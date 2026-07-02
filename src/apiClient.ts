const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export interface CompanySearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
}

export interface CompanyApiProfile {
  name: string;
  ticker: string;
  industry: string;
  description: string;
  website?: string;
  exchange?: string;
  ipo?: string;
  marketCapitalization?: number;
  currency?: string;
}

export interface CompanyApiMetrics {
  revenue?: number;
  revenueGrowth?: number;
  profitMargin?: number;
  peRatio?: number;
  roe?: number;
  debtEquity?: number;
  currentRatio?: number;
  marketCapitalization?: number;
}

export interface CompanyApiResult {
  symbol: string;
  profile: CompanyApiProfile;
  metrics: CompanyApiMetrics;
  source: 'finnhub';
}

const hasApiKey = () => Boolean(FINNHUB_API_KEY && FINNHUB_API_KEY.trim().length > 0);

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${body}`);
  }
  return response.json();
};

export async function searchCompanySymbol(companyName: string): Promise<CompanySearchResult | null> {
  if (!hasApiKey()) return null;
  const encoded = encodeURIComponent(companyName);
  const url = `${FINNHUB_BASE}/search?q=${encoded}&token=${FINNHUB_API_KEY}`;
  const data = await fetchJson(url);
  if (!Array.isArray(data.result) || data.result.length === 0) return null;
  const exact = data.result.find((item: any) => item.description?.toLowerCase() === companyName.toLowerCase());
  const candidate = exact || data.result[0];
  if (!candidate?.symbol) return null;
  return {
    symbol: candidate.symbol,
    description: candidate.description || companyName,
    displaySymbol: candidate.displaySymbol || candidate.symbol,
    type: candidate.type || 'Common Stock',
  };
}

export async function fetchCompanyProfile(symbol: string): Promise<CompanyApiProfile | null> {
  if (!hasApiKey()) return null;
  const url = `${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
  const data = await fetchJson(url);
  if (!data || !data.name) return null;
  return {
    name: data.name,
    ticker: data.ticker || symbol,
    industry: data.finnhubIndustry || data.industry || 'Unknown',
    description: data.description || data.name,
    website: data.weburl || data.website,
    exchange: data.exchange || undefined,
    ipo: data.ipo || undefined,
    marketCapitalization: typeof data.marketCapitalization === 'number' ? data.marketCapitalization : undefined,
    currency: data.currency || undefined,
  };
}

export async function fetchCompanyMetrics(symbol: string): Promise<CompanyApiMetrics | null> {
  if (!hasApiKey()) return null;
  const url = `${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${FINNHUB_API_KEY}`;
  const data = await fetchJson(url);
  const metric = data.metric || data;
  if (!metric) return null;

  return {
    revenue: typeof metric.revenueQuarterlyGrowth === 'number' ? metric.revenueQuarterlyGrowth : undefined,
    revenueGrowth: typeof metric.revenueGrowth === 'number' ? metric.revenueGrowth : undefined,
    profitMargin: typeof metric.profitMargin === 'number' ? metric.profitMargin : undefined,
    peRatio: typeof metric.peNormalizedAnnual === 'number' ? metric.peNormalizedAnnual : undefined,
    roe: typeof metric.roeAnnual === 'number' ? metric.roeAnnual : undefined,
    debtEquity: typeof metric.debtEquityAnnual === 'number' ? metric.debtEquityAnnual : undefined,
    currentRatio: typeof metric.currentRatioAnnual === 'number' ? metric.currentRatioAnnual : undefined,
    marketCapitalization: typeof metric.marketCapitalization === 'number' ? metric.marketCapitalization : undefined,
  };
}

export async function fetchCompanyApiResult(companyName: string): Promise<CompanyApiResult | null> {
  if (!hasApiKey()) return null;
  const search = await searchCompanySymbol(companyName);
  if (!search) return null;
  const profile = await fetchCompanyProfile(search.symbol);
  if (!profile) return null;
  const metrics = (await fetchCompanyMetrics(search.symbol)) || {};
  return {
    symbol: search.symbol,
    profile,
    metrics,
    source: 'finnhub',
  };
}
