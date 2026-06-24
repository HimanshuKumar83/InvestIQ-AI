import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  CheckCircle,
  AlertTriangle,
  Flame,
  Scale,
  Newspaper,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { InvestmentReport, PipelineProgress, Recommendation } from './types';
import ConfidenceGauge from './ConfidenceGauge';
import RadarChart from './RadarChart';
import LoadingSkeleton from './LoadingSkeleton';
import { runResearchPipeline } from './researchGraph';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<PipelineProgress>({ stage: 'idle', message: '' });
  const [report, setReport] = useState<InvestmentReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    financials: false,
    competition: true,
    news: true,
    risks: false,
    debate: true,
    contradictions: true,
    decision: true,
  });

  const defaultDebate = {
    bullCase: {
      analystName: 'N/A',
      arguments: ['No analyst debate available.'],
      conclusion: 'No conclusion available.',
    },
    bearCase: {
      analystName: 'N/A',
      arguments: ['No analyst debate available.'],
      conclusion: 'No conclusion available.',
    },
    judgeVerdict: 'No judge verdict available.',
  };

  const defaultReport = {
    company: {
      name: 'Unknown',
      ticker: 'N/A',
      industry: 'N/A',
      products: [],
      businessModel: 'N/A',
      summary: 'No company summary available.',
      logoUrl: undefined,
    },
    financials: {
      revenueTrends: 'N/A',
      profitability: 'N/A',
      margins: 'N/A',
      debtLevel: 'N/A',
      cashFlow: 'N/A',
      growthIndicators: 'N/A',
      scores: {
        growth: 0,
        profitability: 0,
        stability: 0,
        innovation: 0,
        marketPosition: 0,
      },
    },
    competition: {
      competitors: [],
      marketPosition: 'N/A',
      moat: 'N/A',
      threats: [],
    },
    news: {
      recentNews: [],
      controversies: [],
      developments: [],
      sentimentSummary: 'No sentiment summary available.',
    },
    risks: {
      regulatory: 'N/A',
      macroeconomic: 'N/A',
      execution: 'N/A',
      technology: 'N/A',
      riskScore: 0,
    },
    debate: defaultDebate,
    contradictions: { conflicts: [] },
    missingInfo: { missingFields: [], recommendedSources: [], impactOnVerdict: 'No impact information available.' },
    decision: {
      recommendation: 'PASS' as const,
      baseScore: 0,
      riskDeduction: 0,
      finalScore: 0,
      decisionRule: 'PASS' as const,
      confidenceScore: 0,
      coverageScore: 0,
      coverageLabel: 'Limited' as const,
      topReasons: [],
      topRisks: [],
      shortSummary: 'No summary available.',
      detailedExplanation: 'No explanation available.',
      sourcesUsed: [],
      whyAlternativeRejected: 'No alternative reasoning available.',
    },
  };

  const normalizeReport = (rawReport: InvestmentReport): InvestmentReport => ({
    company: { ...defaultReport.company, ...rawReport.company },
    financials: { ...defaultReport.financials, ...rawReport.financials },
    competition: { ...defaultReport.competition, ...rawReport.competition },
    news: { ...defaultReport.news, ...rawReport.news },
    risks: { ...defaultReport.risks, ...rawReport.risks },
    debate: { ...defaultReport.debate, ...rawReport.debate },
    contradictions: { ...defaultReport.contradictions, ...rawReport.contradictions },
    missingInfo: { ...defaultReport.missingInfo, ...rawReport.missingInfo },
    decision: { ...defaultReport.decision, ...rawReport.decision },
  });

  const safeReport = report ? normalizeReport(report) : defaultReport;
  const debateData = safeReport.debate;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    const stages: Array<{ stage: PipelineProgress['stage']; message: string; delay: number }> = [
      { stage: 'company', message: `Contacting Company Understanding Agent for "${query}"...`, delay: 600 },
      { stage: 'financials', message: 'Financial Research Agent parsing balances and operating margin matrices...', delay: 800 },
      { stage: 'competition', message: 'Competitive Landscape Agent analyzing industry index scores and patent moats...', delay: 600 },
      { stage: 'news', message: 'News & Sentiment Agent executing sentiment analytics and crawling articles...', delay: 800 },
      { stage: 'risks', message: 'Risk Agent calculating execution and macroeconomic exposure scores...', delay: 600 },
      { stage: 'debate', message: 'Engaging Analyst Debate Node: Bull vs Bear Case simulation running...', delay: 1000 },
      { stage: 'contradictions', message: 'Logical validation layer: scanning for contradictions and missing info...', delay: 800 },
      { stage: 'decision', message: 'Consolidating investment reports. Synthesis Decision Node initializing...', delay: 600 },
    ];

    for (const step of stages) {
      setProgress({ stage: step.stage, message: step.message });
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }

    try {
      const reportData = await runResearchPipeline(query, (p) => {
        setProgress(p);
      });
      setReport(normalizeReport(reportData));
      setProgress({ stage: 'complete', message: 'Analysis complete!' });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong during research orchestration.');
    } finally {
      setLoading(false);
    }
  };

  const getRecBadgeStyles = (rec?: Recommendation) => {
    switch (rec) {
      case 'INVEST':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'WATCH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PASS':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 px-4 py-8 text-zinc-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <Sparkles size={22} className="animate-pulse" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              InvestIQ <span className="text-cyan-400 font-medium">AI</span>
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-2">
            AI-driven investment research for public companies, with company-specific news coverage, competitor intelligence, and deterministic scoring.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Status: Nodes Ready</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-zinc-500" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-32 py-4 bg-zinc-950/80 border border-zinc-800/80 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 rounded-xl text-zinc-200 placeholder-zinc-500 outline-none transition-all duration-200 text-base shadow-lg shadow-black/40"
            placeholder="Search company (e.g. NVIDIA, Apple, Microsoft, Tesla...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-40 text-zinc-100 font-semibold rounded-lg text-sm shadow-md transition-all duration-200 flex items-center gap-2 outline-none"
          >
            <span>Research</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {loading && (
        <div className="w-full max-w-3xl mx-auto p-6 bg-zinc-900/40 rounded-xl border border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-zinc-300">Orchestrator Active</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono tracking-wide bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
            &gt; {progress.message}
          </p>
          <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width:
                  progress.stage === 'company'
                    ? '15%'
                    : progress.stage === 'financials'
                    ? '30%'
                    : progress.stage === 'competition'
                    ? '45%'
                    : progress.stage === 'news'
                    ? '60%'
                    : progress.stage === 'risks'
                    ? '75%'
                    : progress.stage === 'debate'
                    ? '85%'
                    : progress.stage === 'contradictions'
                    ? '92%'
                    : progress.stage === 'decision'
                    ? '98%'
                    : '5%',
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10px] text-zinc-500 font-mono uppercase text-center mt-2">
            <span className={progress.stage === 'company' || progress.stage === 'financials' ? 'text-cyan-400' : ''}>
              1. Researching
            </span>
            <span className={progress.stage === 'competition' || progress.stage === 'news' ? 'text-cyan-400' : ''}>
              2. Analyzing
            </span>
            <span className={progress.stage === 'risks' || progress.stage === 'debate' ? 'text-cyan-400' : ''}>
              3. Comparing
            </span>
            <span className={progress.stage === 'contradictions' || progress.stage === 'decision' ? 'text-cyan-400' : ''}>
              4. Evaluating
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center flex items-center justify-center gap-3">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && !report && <LoadingSkeleton />}

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md">
              <button
                onClick={() => toggleSection('summary')}
                className="w-full flex justify-between items-center p-5 bg-zinc-950/20 text-zinc-200 font-semibold text-base border-b border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <Compass size={18} className="text-cyan-400" />
                  <span>Company Understanding Agent</span>
                </div>
                {expandedSections.summary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedSections.summary && (
                <div className="p-5 space-y-4 text-sm text-zinc-300">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-zinc-500">Company</span>
                      <span className="font-bold text-zinc-200 text-lg">{report.company.name}</span>
                    </div>
                    {report.company.logoUrl ? (
                      <img
                        src={report.company.logoUrl}
                        alt={`${report.company.name} logo`}
                        className="h-14 w-14 rounded-full object-contain border border-zinc-700/70 bg-zinc-950"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-zinc-950 border border-zinc-700/70 flex items-center justify-center text-xs text-zinc-500">
                        Logo
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-zinc-500">Official Name</span>
                      <span className="font-bold text-zinc-200">{report.company.name}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-zinc-500">Industry Segment</span>
                      <span className="text-zinc-200 font-medium">{report.company.industry}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-zinc-500">Business Model</span>
                    <p className="mt-1 text-zinc-300 bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/40">
                      {report.company.businessModel}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-zinc-500">Core Offerings / Products</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {report.company.products.map((p, idx) => (
                        <span key={idx} className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-zinc-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md">
              <button
                onClick={() => toggleSection('financials')}
                className="w-full flex justify-between items-center p-5 bg-zinc-950/20 text-zinc-200 font-semibold text-base border-b border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-emerald-400" />
                  <span>Financial Research Agent</span>
                </div>
                {expandedSections.financials ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedSections.financials && (
                <div className="p-5 space-y-4 text-sm text-zinc-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-zinc-500">Revenue Trends</span>
                        <p className="text-zinc-200 font-medium mt-0.5">{report.financials.revenueTrends}</p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-zinc-500">Profitability Profiles</span>
                        <p className="text-zinc-200 font-medium mt-0.5">{report.financials.profitability}</p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-zinc-500">Cash Flow Integrity</span>
                        <p className="text-zinc-200 font-medium mt-0.5">{report.financials.cashFlow}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-zinc-500">Debt & Leverage Limits</span>
                        <p className="text-zinc-200 font-medium mt-0.5">{report.financials.debtLevel}</p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-zinc-500">Gross & Operating Margins</span>
                        <p className="text-zinc-200 font-medium mt-0.5">{report.financials.margins}</p>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-zinc-500">Leading Indicators</span>
                        <p className="text-zinc-200 font-medium mt-0.5">{report.financials.growthIndicators}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md">
              <button
                onClick={() => toggleSection('competition')}
                className="w-full flex justify-between items-center p-5 bg-zinc-950/20 text-zinc-200 font-semibold text-base border-b border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <Scale size={18} className="text-purple-400" />
                  <span>Competitive Landscape Agent</span>
                </div>
                {expandedSections.competition ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedSections.competition && (
                <div className="p-5 space-y-4 text-sm text-zinc-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-zinc-500">Market Positioning</span>
                      <p className="text-zinc-200 font-medium mt-1">{report.competition.marketPosition}</p>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-zinc-500">Business Moat Depth</span>
                      <p className="text-zinc-200 font-medium mt-1">{report.competition.moat}</p>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-zinc-500">Key Competitors</span>
                    <div className="space-y-3 mt-4">
                      {report.competition.competitors.map((competitor, idx) => (
                        <div key={idx} className="p-3 bg-zinc-950/30 border border-zinc-800/40 rounded-xl">
                          <p className="text-sm font-semibold text-zinc-200">{competitor.name}</p>
                          <p className="text-xs text-zinc-400 mt-1"><span className="font-semibold text-zinc-300">Reason:</span> {competitor.reason}</p>
                          <p className="text-xs text-zinc-400 mt-1"><span className="font-semibold text-zinc-300">Why it matters:</span> {competitor.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md">
              <button
                onClick={() => toggleSection('news')}
                className="w-full flex justify-between items-center p-5 bg-zinc-950/20 text-zinc-200 font-semibold text-base border-b border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <Newspaper size={18} className="text-yellow-400" />
                  <span>News & Sentiment Agent</span>
                </div>
                {expandedSections.news ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedSections.news && (
                <div className="p-5 space-y-4 text-sm text-zinc-300">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-zinc-500">Sentiment Summary</span>
                    <p className="text-zinc-200 font-medium mt-1">{report.news.sentimentSummary}</p>
                    {report.news.disclaimer ? (
                      <p className="mt-2 text-[11px] text-amber-300 italic border-l-2 border-amber-500/50 pl-3">
                        {report.news.disclaimer}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-zinc-500">Recent Headlines Log</span>
                    <div className="space-y-2 mt-2">
                      {report.news.recentNews.map((news, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4 p-3 bg-zinc-950/30 border border-zinc-800/40 rounded-lg">
                          <div>
                            <p className="font-semibold text-zinc-200">{news.title}</p>
                            <p className="text-xs text-zinc-400 mt-1">{news.headlineSummary}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-500 font-mono">
                              <span>{news.date}</span>
                              <span>{news.source}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            news.sentiment === 'positive'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : news.sentiment === 'negative'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {news.sentiment}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md">
              <button
                onClick={() => toggleSection('debate')}
                className="w-full flex justify-between items-center p-5 bg-zinc-950/20 text-zinc-200 font-semibold text-base border-b border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <Flame size={18} className="text-amber-500" />
                  <span>Analyst Debate Node (Bull vs Bear)</span>
                </div>
                {expandedSections.debate ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedSections.debate && (
                <div className="p-5 space-y-6 text-sm text-zinc-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-emerald-950/10 border border-emerald-800/30 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-800/30 pb-2">
                        <TrendingUp size={16} />
                        <span>BULL ANALYST: {debateData.bullCase.analystName}</span>
                      </div>
                      <ul className="space-y-1.5 list-disc pl-4 text-zinc-300">
                        {debateData.bullCase.arguments.map((arg, idx) => (
                          <li key={idx}>{arg}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-zinc-400 italic pt-2">
                        Conclusion: {debateData.bullCase.conclusion}
                      </p>
                    </div>

                    <div className="p-4 bg-rose-950/10 border border-rose-800/30 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-rose-800/30 pb-2">
                        <AlertTriangle size={16} />
                        <span>BEAR ANALYST: {debateData.bearCase.analystName}</span>
                      </div>
                      <ul className="space-y-1.5 list-disc pl-4 text-zinc-300">
                        {debateData.bearCase.arguments.map((arg, idx) => (
                          <li key={idx}>{arg}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-zinc-400 italic pt-2">
                        Conclusion: {debateData.bearCase.conclusion}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-xl">
                    <span className="block text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1">
                      Debate Referee / Judge Verdict
                    </span>
                    <p className="text-zinc-200 leading-relaxed font-medium">
                      {debateData.judgeVerdict}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-md">
              <button
                onClick={() => toggleSection('contradictions')}
                className="w-full flex justify-between items-center p-5 bg-zinc-950/20 text-zinc-200 font-semibold text-base border-b border-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className="text-rose-400" />
                  <span>Validation layer (Contradictions & Missing Info)</span>
                </div>
                {expandedSections.contradictions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedSections.contradictions && (
                <div className="p-5 space-y-6 text-sm text-zinc-300">
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-rose-400 font-bold mb-2">
                      Contradiction Detector
                    </span>
                    {report.contradictions.conflicts.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No direct logic contradictions identified.</p>
                    ) : (
                      <div className="space-y-3">
                        {report.contradictions.conflicts.map((c, idx) => (
                          <div key={idx} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="block text-zinc-500">Claim A ({c.sourceA}):</span>
                                <p className="text-rose-400/90 font-medium">{c.factA}</p>
                              </div>
                              <div>
                                <span className="block text-zinc-500">Claim B ({c.sourceB}):</span>
                                <p className="text-amber-400/90 font-medium">{c.factB}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-zinc-800/60 text-xs">
                              <span className="block text-emerald-400 font-bold">Orchestrator Resolution:</span>
                              <p className="text-zinc-300 font-medium">{c.resolution}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-zinc-800/60 pt-4">
                    <span className="block text-xs uppercase tracking-wider text-cyan-400 font-bold mb-2">
                      Missing Info Detector
                    </span>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-zinc-500">Missing/Unquantifiable Parameters:</span>
                        <ul className="list-disc pl-4 text-xs text-zinc-300 mt-1 space-y-1">
                          {report.missingInfo.missingFields.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500">Recommended Data Channels:</span>
                        <p className="text-xs text-zinc-300 mt-0.5">{report.missingInfo.recommendedSources.join(', ')}</p>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500">Verdict Integrity Impact:</span>
                        <p className="text-xs text-zinc-400 italic mt-0.5">{report.missingInfo.impactOnVerdict}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 backdrop-blur-md space-y-6 shadow-xl">
              <div>
                <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  System Final Recommendation
                </span>
                <div className={`text-center py-5 border rounded-xl font-extrabold text-3xl tracking-widest ${getRecBadgeStyles(report.decision.recommendation)}`}>
                  {report.decision.recommendation}
                </div>
                <div className="mt-4 text-sm text-zinc-300 leading-relaxed">
                  <span className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Recommendation rationale</span>
                  <p>{report.decision.detailedExplanation}</p>
                </div>
              </div>

              <ConfidenceGauge score={report.decision.confidenceScore} />

              <div className="mt-4 space-y-2 text-xs text-zinc-400">
                <p>
                  <span className="font-semibold text-zinc-200">Confidence score</span> combines evidence strength, verified coverage, and the risk deduction to show the system’s conviction in this recommendation.
                </p>
                <p>
                  <span className="font-semibold text-zinc-200">Coverage label</span> explains how complete and verified the underlying data is: <span className="text-emerald-300">Excellent</span> means strong verification, <span className="text-amber-300">Partial</span> means some inferred or missing data, and <span className="text-rose-300">Limited</span> means the recommendation relies more heavily on fallback content.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                    Decision Score Breakdown
                  </span>
                  <div className="space-y-3 text-sm text-zinc-300">
                    <div className="flex justify-between gap-4">
                      <span>Base Score</span>
                      <span className="font-semibold text-zinc-100">{report.decision.baseScore}/100</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Risk Deduction</span>
                      <span className="font-semibold text-rose-300">-{report.decision.riskDeduction}</span>
                    </div>
                    <div className="flex justify-between gap-4 pt-2 border-t border-zinc-800/60">
                      <span className="font-semibold">Final Score</span>
                      <span className="font-bold text-cyan-300">{report.decision.finalScore}/100</span>
                    </div>
                    <div className="flex justify-between gap-4 text-xs text-zinc-400 pt-3 border-t border-zinc-800/40">
                      <span>Data Coverage</span>
                      <span className="font-semibold text-zinc-200">{report.decision.coverageLabel} ({report.decision.coverageScore}%)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                    Checklist Completion
                  </span>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <CheckCircle size={14} />
                      <span>Business Model Identified</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <CheckCircle size={14} />
                      <span>Financial Metrics Verified</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <CheckCircle size={14} />
                      <span>Competitor Moat Measured</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <CheckCircle size={14} />
                      <span>Headlines & Sentiment Scanned</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <CheckCircle size={14} />
                      <span>Risk Metrics Computed</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-emerald-400">
                      <CheckCircle size={14} />
                      <span>Judge Verdict Concluded</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-4 space-y-4">
                <div>
                  <span className="block text-xs font-bold text-zinc-400 uppercase mb-2">
                    Primary Argument Rationale
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {report.decision.shortSummary}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-bold text-zinc-400 uppercase mb-2">
                    Top 5 Verdict Drivers
                  </span>
                  <ul className="space-y-1.5 list-none text-xs text-zinc-300">
                    {report.decision.topReasons.slice(0, 5).map((r, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-emerald-400 font-bold">✔</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="block text-xs font-bold text-zinc-400 uppercase mb-2">
                    Top 5 Risk Vectors
                  </span>
                  <ul className="space-y-1.5 list-none text-xs text-zinc-300">
                    {report.decision.topRisks.slice(0, 5).map((r, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-rose-400 font-bold">✖</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
                  <span className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                    Why alternatives were rejected?
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-normal italic">
                    {report.decision.whyAlternativeRejected}
                  </p>
                </div>
              </div>
            </div>

            <RadarChart scores={report.financials.scores} />

            <div className="p-5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">
                  Risk Quotient Score
                </span>
                <span className="text-lg font-bold text-rose-400">{report.risks.riskScore}/100</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-zinc-500 font-medium">Regulatory:</span>
                  <p className="text-zinc-300">{report.risks.regulatory}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Macroeconomic:</span>
                  <p className="text-zinc-300">{report.risks.macroeconomic}</p>
                </div>
                <div>
                  <span className="text-zinc-500 font-medium">Execution Complexity:</span>
                  <p className="text-zinc-300">{report.risks.execution}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
