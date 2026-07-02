import type {
  CompanyData,
  FinancialData,
  InvestmentReport,
  NewsData,
  RiskData,
  Recommendation,
  ModelFeatures,
  ModelPrediction,
} from './types';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const normalizeMetric = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value > 1 ? value / 100 : value;
};

const scoreFromGrowth = (growthMetric?: number, fallback = 50) => {
  const normalized = normalizeMetric(growthMetric);
  if (typeof normalized !== 'number') return clamp(fallback);
  if (normalized >= 0.2) return 92;
  if (normalized >= 0.12) return 82;
  if (normalized >= 0.08) return 72;
  if (normalized >= 0.04) return 60;
  if (normalized >= 0.01) return 50;
  return 40;
};

const scoreFromProfitability = (profitMargin?: number, roe?: number, fallback = 50) => {
  const margin = normalizeMetric(profitMargin);
  const returnOnEquity = normalizeMetric(roe);
  if (typeof margin !== 'number' && typeof returnOnEquity !== 'number') return clamp(fallback);
  const values = [margin, returnOnEquity].filter((value): value is number => typeof value === 'number');
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (average >= 0.2) return 92;
  if (average >= 0.12) return 82;
  if (average >= 0.08) return 72;
  if (average >= 0.04) return 58;
  return 42;
};

const scoreFromStability = (debtEquity?: number, currentRatio?: number, fallback = 50) => {
  const debt = typeof debtEquity === 'number' ? debtEquity : undefined;
  const ratio = typeof currentRatio === 'number' ? currentRatio : undefined;
  if (typeof debt === 'number' && typeof ratio === 'number') {
    if (debt <= 0.4 && ratio >= 2) return 90;
    if (debt <= 0.8 && ratio >= 1.5) return 78;
    if (debt <= 1.5 && ratio >= 1.1) return 66;
    return 48;
  }
  if (typeof ratio === 'number') {
    if (ratio >= 2) return 82;
    if (ratio >= 1.5) return 70;
    if (ratio >= 1.1) return 58;
    return 42;
  }
  if (typeof debt === 'number') {
    if (debt <= 0.4) return 80;
    if (debt <= 0.8) return 68;
    if (debt <= 1.5) return 54;
    return 38;
  }
  return clamp(fallback);
};

const scoreFromMarketPosition = (marketCap?: number, fallback = 50) => {
  if (typeof marketCap !== 'number' || Number.isNaN(marketCap)) return clamp(fallback);
  if (marketCap >= 2_000_000_000_000) return 95;
  if (marketCap >= 500_000_000_000) return 88;
  if (marketCap >= 100_000_000_000) return 78;
  if (marketCap >= 20_000_000_000) return 68;
  return 56;
};

export async function extractModelFeatures(
  company: CompanyData,
  financials: FinancialData,
  competition: InvestmentReport['competition'],
  news: NewsData,
  risks: RiskData
): Promise<ModelFeatures> {
  const scores = financials.scores || { growth: 50, profitability: 50, stability: 50, innovation: 50, marketPosition: 50 };
  const metrics = company.apiMetrics;

  const growthPotential = scoreFromGrowth(metrics?.revenueGrowth, scores.growth);
  const profitabilityScore = scoreFromProfitability(metrics?.profitMargin, metrics?.roe, scores.profitability);
  const stabilityScore = scoreFromStability(metrics?.debtEquity, metrics?.currentRatio, scores.stability);
  const innovationScore = clamp(scores.innovation);
  const marketPositionStrength = scoreFromMarketPosition(metrics?.marketCapitalization, scores.marketPosition);

  const positiveCount = news.recentNews.filter((item) => item.sentiment === 'positive').length;
  const negativeCount = news.recentNews.filter((item) => item.sentiment === 'negative').length;
  const sentimentFactor = news.recentNews.length > 0
    ? clamp(50 + (positiveCount - negativeCount) * 10 + (news.recentNews.some((item) => item.verified) ? 4 : 0))
    : news.sentimentSummary.toLowerCase().includes('positive')
      ? 74
      : news.sentimentSummary.toLowerCase().includes('negative')
        ? 32
        : 50;

  const moatStrength = clamp(
    (competition.moat && competition.moat.length > 20 ? 72 : competition.competitors.length >= 3 ? 58 : 42) +
      (typeof metrics?.marketCapitalization === 'number' && metrics.marketCapitalization >= 100_000_000_000 ? 8 : 0)
  );

  const riskScore = risks?.riskScore || 50;

  return {
    growthPotential,
    profitabilityScore,
    stabilityScore,
    innovationScore,
    moatStrength,
    newsSentiment: clamp(sentimentFactor),
    riskExposure: clamp(riskScore),
    executionRisk: clamp(Math.max(0, 100 - riskScore)),
    marketPositionStrength,
  };
}

export function predictRecommendationFromFeatures(features: ModelFeatures): ModelPrediction {
  const weights: Record<keyof ModelFeatures, number> = {
    growthPotential: 0.18,
    profitabilityScore: 0.16,
    stabilityScore: 0.14,
    innovationScore: 0.12,
    moatStrength: 0.14,
    newsSentiment: 0.1,
    riskExposure: -0.1,
    executionRisk: -0.08,
    marketPositionStrength: 0.14,
  };

  const baseScore = clamp(
    weights.growthPotential * features.growthPotential +
      weights.profitabilityScore * features.profitabilityScore +
      weights.stabilityScore * features.stabilityScore +
      weights.innovationScore * features.innovationScore +
      weights.moatStrength * features.moatStrength +
      weights.newsSentiment * features.newsSentiment +
      weights.riskExposure * features.riskExposure +
      weights.executionRisk * features.executionRisk +
      weights.marketPositionStrength * features.marketPositionStrength
  );

  const riskAdjustedScore = clamp(
    baseScore - Math.max(0, features.riskExposure - 60) * 0.18 - Math.max(0, features.executionRisk - 55) * 0.12
  );

  let recommendation: Recommendation = 'PASS';
  if (riskAdjustedScore >= 78) recommendation = 'BUY';
  else if (riskAdjustedScore >= 62) recommendation = 'HOLD';

  const strongSignals = [
    features.growthPotential >= 75 && 'growth potential',
    features.profitabilityScore >= 75 && 'profitability',
    features.moatStrength >= 70 && 'moat strength',
    features.marketPositionStrength >= 75 && 'market position',
    features.newsSentiment >= 70 && 'news sentiment',
  ].filter(Boolean);
  const riskSignals = [
    features.riskExposure >= 70 && 'risk exposure',
    features.executionRisk >= 70 && 'execution risk',
  ].filter(Boolean);

  const explanation = `The deterministic model combined verified financial signals, competitive strength, and recent market sentiment to produce a ${Math.round(riskAdjustedScore)} point score. Strongest features: ${strongSignals.join(', ') || 'no dominant strengths identified'}. Largest risks: ${riskSignals.join(', ') || 'none were detected at a high level'}.`;

  const featureWeights: Record<string, number> = {};
  for (const key of Object.keys(weights) as Array<keyof ModelFeatures>) {
    featureWeights[key] = Number((weights[key] * 100).toFixed(0));
  }

  return {
    score: Math.round(riskAdjustedScore),
    recommendation,
    explanation,
    featureWeights,
  };
}
