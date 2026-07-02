export type Recommendation = 'BUY' | 'HOLD' | 'PASS';

export interface CompanyData {
  name: string;
  ticker?: string;
  industry: string;
  products: string[];
  businessModel: string;
  summary: string;
  logoUrl?: string;
  companyApiSource?: string;
  apiVerified?: boolean;
  apiMetrics?: {
    revenue?: number;
    revenueGrowth?: number;
    profitMargin?: number;
    peRatio?: number;
    roe?: number;
    debtEquity?: number;
    currentRatio?: number;
    marketCapitalization?: number;
  };
}

export interface CompetitorEntry {
  name: string;
  reason: string;
  explanation: string;
}

export interface FinancialData {
  revenueTrends: string;
  profitability: string;
  margins: string;
  debtLevel: string;
  cashFlow: string;
  growthIndicators: string;
  scores: {
    growth: number;        // 1-100
    profitability: number; // 1-100
    stability: number;     // 1-100
    innovation: number;    // 1-100
    marketPosition: number;// 1-100
  };
}

export interface CompetitiveData {
  competitors: CompetitorEntry[];
  marketPosition: string;
  moat: string;
  threats: string[];
}

export interface NewsItem {
  title: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  headlineSummary: string;
  verified?: boolean;
  url?: string;
}

export interface NewsData {
  recentNews: NewsItem[];
  controversies: string[];
  developments: string[];
  sentimentSummary: string;
  sentimentScore?: number;
  positivePills?: string[];
  negativePills?: string[];
  disclaimer?: string;
}

export interface RiskData {
  regulatory: string;
  macroeconomic: string;
  execution: string;
  technology: string;
  riskScore: number; // 1-100
}

export interface DebateData {
  bullCase: {
    analystName: string;
    arguments: string[];
    conclusion: string;
  };
  bearCase: {
    analystName: string;
    arguments: string[];
    conclusion: string;
  };
  judgeVerdict: string;
}

export interface ContradictionDetector {
  conflicts: {
    factA: string;
    factB: string;
    sourceA: string;
    sourceB: string;
    resolution: string;
  }[];
}

export interface MissingInfoDetector {
  missingFields: string[];
  recommendedSources: string[];
  impactOnVerdict: string;
}

export interface ModelFeatures {
  growthPotential: number;
  profitabilityScore: number;
  stabilityScore: number;
  innovationScore: number;
  moatStrength: number;
  newsSentiment: number;
  riskExposure: number;
  executionRisk: number;
  marketPositionStrength: number;
}

export interface ModelPrediction {
  score: number;
  recommendation: Recommendation;
  explanation: string;
  featureWeights: Record<string, number>;
}

export interface FinalDecision {
  recommendation: Recommendation;
  baseScore: number;
  riskDeduction: number;
  finalScore: number;
  decisionRule: Recommendation;
  confidenceScore: number; // 1-100
  coverageScore: number;
  coverageLabel: 'Excellent' | 'Partial' | 'Limited';
  topReasons: string[];
  topRisks: string[];
  keyCatalysts?: string[];
  shortSummary: string;
  detailedExplanation: string;
  confidenceReason: string;
  sourcesUsed: string[];
  whyAlternativeRejected: string;
}

export interface InvestmentReport {
  company: CompanyData;
  financials: FinancialData;
  competition: CompetitiveData;
  news: NewsData;
  risks: RiskData;
  debate: DebateData;
  contradictions: ContradictionDetector;
  missingInfo: MissingInfoDetector;
  decision: FinalDecision;
}

export interface PipelineProgress {
  stage: 'idle' | 'company' | 'financials' | 'competition' | 'news' | 'risks' | 'debate' | 'contradictions' | 'decision' | 'complete';
  message: string;
}
