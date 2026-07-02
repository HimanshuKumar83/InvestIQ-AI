import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Newspaper,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BrainCircuit,
  FileText,
  Copy,
  Download,
  Link2,
  Rocket,
  AlertCircle
} from 'lucide-react';
import type { InvestmentReport, PipelineProgress, Recommendation } from './types';
import ConfidenceGauge from './ConfidenceGauge';
import RadarChart from './RadarChart';
import LoadingSkeleton from './LoadingSkeleton';
import { runResearchPipeline } from './researchGraph';
import { exportJson, exportReportDocx, exportReportPdf } from './exportUtils';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<PipelineProgress>({ stage: 'idle', message: '' });
  const [report, setReport] = useState<InvestmentReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bullCase: true,
    bearCase: true,
    risks: true,
    catalysts: true,
    reasoning: true,
    sources: true,
  });

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
      sentimentScore: 0.5,
      positivePills: [],
      negativePills: [],
    },
    risks: {
      regulatory: 'N/A',
      macroeconomic: 'N/A',
      execution: 'N/A',
      technology: 'N/A',
      riskScore: 0,
    },
    debate: {
      bullCase: {
        analystName: 'N/A',
        arguments: [],
        conclusion: 'N/A',
      },
      bearCase: {
        analystName: 'N/A',
        arguments: [],
        conclusion: 'N/A',
      },
      judgeVerdict: 'N/A',
    },
    contradictions: { conflicts: [] },
    missingInfo: { missingFields: [], recommendedSources: [], impactOnVerdict: 'N/A' },
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
      keyCatalysts: [],
      shortSummary: 'No summary available.',
      detailedExplanation: 'No explanation available.',
      confidenceReason: 'No confidence explanation available.',
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
  const exampleQueries = useMemo(() => ['Apple', 'NVIDIA', 'Microsoft', 'Tesla', 'SpaceX'], []);
  const exportActions = [
    { label: 'PDF Report', icon: Download, action: () => report && exportReportPdf(report) },
    { label: 'DOCX Report', icon: FileText, action: () => report && exportReportDocx(report) },
    { label: 'Export JSON', icon: FileText, action: () => report && exportJson(report) },
    { label: 'Copy Summary', icon: Copy, action: () => {
      if (report) {
        navigator.clipboard?.writeText(report.decision.shortSummary || report.decision.detailedExplanation);
      }
    } },
  ];

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
      { stage: 'company', message: 'Initializing Research Planner & mapping pipeline targets...', delay: 600 },
      { stage: 'financials', message: 'Web Researcher crawling public disclosures and database filings...', delay: 800 },
      { stage: 'competition', message: 'Financial Analyst extracting balances, ratios, and operating margins...', delay: 600 },
      { stage: 'news', message: 'Sentiment Analyzer scanning recent headlines and social indicators...', delay: 800 },
      { stage: 'risks', message: 'Assessing risk matrices, operational threats, and competitor moats...', delay: 600 },
      { stage: 'debate', message: 'Synthesizing Bull vs Bear scenarios to identify growth inflection points...', delay: 1000 },
      { stage: 'contradictions', message: 'Verifying data consistency and logical contradiction checks...', delay: 800 },
      { stage: 'decision', message: 'Investment Verdict synthesizer compiling final recommendation score...', delay: 600 },
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

  const getRecommendationStyle = (rec?: Recommendation) => {
    switch (rec) {
      case 'BUY':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          badge: 'bg-emerald-500 text-white',
          label: 'BUY'
        };
      case 'HOLD':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          badge: 'bg-amber-500 text-white',
          label: 'HOLD'
        };
      case 'PASS':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          badge: 'bg-rose-500 text-white',
          label: 'PASS'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
          badge: 'bg-slate-500 text-white',
          label: 'PASS'
        };
    }
  };

  const getSentimentLabel = (score?: number) => {
    const s = score !== undefined ? score : 0.50;
    if (s >= 0.70) return `BULLISH (${s.toFixed(2)})`;
    if (s <= 0.35) return `BEARISH (${s.toFixed(2)})`;
    return `NEUTRAL (${s.toFixed(2)})`;
  };

  const getSentimentBadgeClass = (score?: number) => {
    const s = score !== undefined ? score : 0.50;
    if (s >= 0.70) return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (s <= 0.35) return 'bg-rose-50 border-rose-200 text-rose-700';
    return 'bg-amber-50 border-amber-200 text-amber-700';
  };

  const getNodeStatus = (nodeIndex: number, currentStage: PipelineProgress['stage']) => {
    const stageOrder: PipelineProgress['stage'][] = [
      'idle',
      'company',
      'financials',
      'competition',
      'news',
      'risks',
      'debate',
      'contradictions',
      'decision',
      'complete'
    ];
    const currentIndex = stageOrder.indexOf(currentStage);
    
    let nodeStageIndices: number[] = [];
    if (nodeIndex === 0) nodeStageIndices = [1];
    else if (nodeIndex === 1) nodeStageIndices = [3, 4];
    else if (nodeIndex === 2) nodeStageIndices = [2];
    else if (nodeIndex === 3) nodeStageIndices = [5, 6];
    else if (nodeIndex === 4) nodeStageIndices = [7, 8];
    
    const minNodeIndex = Math.min(...nodeStageIndices);
    const maxNodeIndex = Math.max(...nodeStageIndices);
    
    if (currentStage === 'complete' || currentIndex > maxNodeIndex) {
      return 'complete';
    }
    if (currentIndex >= minNodeIndex && currentIndex <= maxNodeIndex) {
      return 'active';
    }
    return 'pending';
  };

  const pipelineNodes = [
    { title: 'Research Planner', desc: 'Research plan mapped' },
    { title: 'Web Researcher', desc: 'Searching news & analyst opinions' },
    { title: 'Financial Analyst', desc: 'Fetching financial metrics' },
    { title: 'Sentiment Analyzer', desc: 'Analyzing news sentiment' },
    { title: 'Investment Verdict', desc: 'Synthesizing final recommendation' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-slate-800">
      {/* Brand Header */}
      <header className="flex flex-col items-center justify-center text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-blue-400 shadow-sm">
          <Sparkles size={12} className="text-blue-500 animate-pulse" />
          ✦ AI-POWERED RESEARCH AGENT
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <TrendingUp size={22} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
            InvestIQ<span className="text-blue-600 font-black">AI</span>
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">
          Enter any company name or ticker to get a structured <span className="font-bold text-emerald-600">BUY</span> / <span className="font-bold text-amber-500">HOLD</span> / <span className="font-bold text-rose-500">PASS</span> verdict powered by an orchestrating multi-agent pipeline.
        </p>

        {/* Centered Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mt-6">
          <div className="relative flex items-center surface-card rounded-[20px] p-1.5 shadow-md focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/70 transition-all duration-200">
            <Search className="ml-3 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full pl-3 pr-24 py-2.5 text-sm bg-transparent border-none text-slate-100 placeholder-slate-400 outline-none"
              placeholder="Search company (e.g. Apple, NVIDIA, Tesla, Microsoft...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold tracking-wide transition-all disabled:opacity-40"
            >
              <span>{loading ? 'Researching...' : 'Research'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-xs text-slate-400">
            <span className="self-center">Examples:</span>
            {exampleQueries.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </form>
      </header>

      {/* Pipeline Loader (Agent Pipeline Node Stepper) */}
      {loading && (
        <div className="mx-auto max-w-2xl surface-card rounded-3xl p-6 shadow-lg mb-10">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit size={18} className="text-blue-500" />
              <span className="font-bold text-sm text-slate-100">Agent Pipeline</span>
            </div>
            {safeReport.company.ticker && (
              <span className="text-[10px] font-bold font-mono tracking-wider bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded">
                {safeReport.company.ticker}
              </span>
            )}
          </div>

          {/* Vertical Node list */}
          <div className="relative pl-8 space-y-6">
            {/* Connection vertical line */}
            <div className="absolute left-[13px] top-[14px] bottom-[14px] w-0.5 bg-slate-800/80" />

            {pipelineNodes.map((node, idx) => {
              const status = getNodeStatus(idx, progress.stage);
              return (
                <div key={node.title} className="relative flex items-start gap-4 text-left">
                  {/* Status Circle */}
                  <div className="absolute -left-[30px] flex items-center justify-center mt-0.5">
                    {status === 'complete' && (
                      <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle2 size={14} className="fill-emerald-50" />
                      </div>
                    )}
                    {status === 'active' && (
                      <div className="h-6 w-6 rounded-full bg-blue-50 border border-blue-500 flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.3)] animate-pulse">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                      </div>
                    )}
                    {status === 'pending' && (
                      <div className="h-6 w-6 rounded-full bg-slate-800/70 border border-slate-700 flex items-center justify-center text-slate-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className={`text-xs font-bold leading-none ${status === 'active' ? 'text-blue-400' : status === 'complete' ? 'text-slate-100' : 'text-slate-400'}`}>
                      {node.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {status === 'active' ? progress.message : status === 'complete' ? 'Task completed successfully' : node.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-rose-950/60 border border-rose-800/80 text-rose-300 rounded-2xl flex items-center gap-3 shadow-sm mb-10">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      {loading && !report && <LoadingSkeleton />}

      {/* Main Analysis Output */}
      {report && (
        <div className="space-y-8">
          {/* Company Brief Card */}
          <div className="surface-card rounded-3xl p-5 shadow-sm text-left">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {safeReport.company.logoUrl ? (
                  <img
                    src={safeReport.company.logoUrl}
                    alt={safeReport.company.name}
                    className="h-14 w-14 rounded-full object-contain border border-slate-700 p-1 bg-slate-800"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    LOGO
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">{safeReport.company.name}</h2>
                    {safeReport.company.ticker && (
                      <span className="text-xs font-bold font-mono tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {safeReport.company.ticker}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{safeReport.company.industry}</p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xl">{safeReport.company.summary}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-1.5 shrink-0 self-start sm:self-center">
                {exportActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
                    >
                      <Icon size={12} className="text-slate-400" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Multi-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left/Center Column - Detailed Analysis Cases */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 px-1 text-left">
                <FileText size={18} className="text-blue-500" />
                <span>Detailed Analysis</span>
              </h3>

              {/* Bull Case Card */}
              <div className="surface-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleSection('bullCase')}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-slate-100 hover:bg-slate-800/50 transition-colors border-none bg-transparent outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">🟢</span>
                    <span>Bull Case</span>
                  </div>
                  {expandedSections.bullCase ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {expandedSections.bullCase && (
                  <div className="px-6 pb-6 pt-1 space-y-3 text-left">
                    <div className="bg-emerald-950/35 border border-emerald-800/60 rounded-2xl p-5 space-y-4">
                      {debateData.bullCase.arguments.length > 0 ? (
                        debateData.bullCase.arguments.map((arg, idx) => (
                          <div key={idx} className="flex gap-3.5 items-start">
                            <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">{arg}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No arguments generated.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bear Case Card */}
              <div className="surface-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleSection('bearCase')}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-slate-100 hover:bg-slate-800/50 transition-colors border-none bg-transparent outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-rose-500 font-bold">🔴</span>
                    <span>Bear Case</span>
                  </div>
                  {expandedSections.bearCase ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {expandedSections.bearCase && (
                  <div className="px-6 pb-6 pt-1 space-y-3 text-left">
                    <div className="bg-rose-950/35 border border-rose-800/60 rounded-2xl p-5 space-y-4">
                      {debateData.bearCase.arguments.length > 0 ? (
                        debateData.bearCase.arguments.map((arg, idx) => (
                          <div key={idx} className="flex gap-3.5 items-start">
                            <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">{arg}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No arguments generated.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Risks Card */}
              <div className="surface-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleSection('risks')}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-slate-100 hover:bg-slate-800/50 transition-colors border-none bg-transparent outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={16} className="text-amber-500 fill-amber-50" />
                    <span>Key Risks</span>
                  </div>
                  {expandedSections.risks ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {expandedSections.risks && (
                  <div className="px-6 pb-6 pt-1 text-left">
                    <div className="bg-amber-950/35 border border-amber-800/60 rounded-2xl p-5 space-y-4">
                      {safeReport.decision.topRisks.length > 0 ? (
                        safeReport.decision.topRisks.map((risk, idx) => (
                          <div key={idx} className="flex gap-3.5 items-start">
                            <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">{risk}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No risk elements cataloged.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Catalysts Card */}
              <div className="surface-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleSection('catalysts')}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-slate-100 hover:bg-slate-800/50 transition-colors border-none bg-transparent outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Rocket size={16} className="text-indigo-500" />
                    <span>Key Catalysts</span>
                  </div>
                  {expandedSections.catalysts ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {expandedSections.catalysts && (
                  <div className="px-6 pb-6 pt-1 text-left">
                    <div className="bg-indigo-950/35 border border-indigo-800/60 rounded-2xl p-5 space-y-4">
                      {safeReport.decision.keyCatalysts && safeReport.decision.keyCatalysts.length > 0 ? (
                        safeReport.decision.keyCatalysts.map((catalyst, idx) => (
                          <div key={idx} className="flex gap-3.5 items-start">
                            <span className="flex items-center justify-center shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium mt-0.5">{catalyst}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No catalysts mapped.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Full Reasoning Card */}
              <div className="surface-card rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => toggleSection('reasoning')}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-slate-100 hover:bg-slate-800/50 transition-colors border-none bg-transparent outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-slate-500" />
                    <span>Full Reasoning</span>
                  </div>
                  {expandedSections.reasoning ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {expandedSections.reasoning && (
                  <div className="px-6 pb-6 pt-1 text-left">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 text-left text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-medium">
                      {safeReport.decision.detailedExplanation}
                    </div>
                  </div>
                )}
              </div>

              {/* News & Sentiment Agent Card */}
              <div className="surface-card rounded-3xl p-6 shadow-sm space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <Newspaper size={18} className="text-slate-700" />
                    <span className="font-bold text-sm text-slate-100">News & Sentiment</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getSentimentBadgeClass(safeReport.news.sentimentScore)}`}>
                    {getSentimentLabel(safeReport.news.sentimentScore)}
                  </span>
                </div>

                {/* Orange Left Border Summary block */}
                <div className="border-l-4 border-orange-500 bg-orange-950/35 rounded-r-2xl p-4 text-xs font-semibold leading-relaxed text-slate-300">
                  {safeReport.news.sentimentSummary}
                </div>

                {/* Catalyst pills grid */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {safeReport.news.positivePills && safeReport.news.positivePills.map((pill, idx) => (
                    <span
                      key={`pos-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700"
                    >
                      <span>🚀</span>
                      <span>{pill}</span>
                    </span>
                  ))}
                  {safeReport.news.negativePills && safeReport.news.negativePills.map((pill, idx) => (
                    <span
                      key={`neg-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-700"
                    >
                      <span>🚩</span>
                      <span>{pill}</span>
                    </span>
                  ))}
                </div>

                {/* News Article List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Recent News Logs</h4>
                  {safeReport.news.recentNews.length > 0 ? (
                    <div className="border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
                      {safeReport.news.recentNews.map((news, idx) => {
                        const domain = news.url ? news.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : news.source;
                        return (
                          <div key={idx} className="flex justify-between items-center gap-4 p-4 hover:bg-slate-800/40 transition-colors">
                            <div className="space-y-1 text-left">
                              {news.url ? (
                                <a
                                  href={news.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-slate-100 hover:text-blue-400 transition-colors flex items-center gap-1"
                                >
                                  {news.title}
                                  <Link2 size={10} className="text-slate-400 shrink-0" />
                                </a>
                              ) : (
                                <p className="text-xs font-bold text-slate-100">{news.title}</p>
                              )}
                              <div className="flex gap-2 text-[10px] font-medium text-slate-400">
                                <span className="font-mono">{domain}</span>
                                <span>•</span>
                                <span>{news.date}</span>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border shrink-0 ${
                              news.sentiment === 'positive'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : news.sentiment === 'negative'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {news.sentiment}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No recent news logs available.</p>
                  )}
                </div>
              </div>

              {/* Sources card */}
              <div className="surface-card rounded-3xl p-6 shadow-sm text-left">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
                  <Link2 size={16} className="text-slate-500" />
                  <span className="font-bold text-sm text-slate-100">Sources</span>
                </div>
                {safeReport.decision.sourcesUsed.length > 0 ? (
                  <ul className="space-y-2 text-xs font-medium">
                    {safeReport.decision.sourcesUsed.map((source, idx) => {
                      const isUrl = source.startsWith('http');
                      return (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5">•</span>
                          {isUrl ? (
                            <a
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline break-all"
                            >
                              {source}
                            </a>
                          ) : (
                            <span className="text-slate-300">{source}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">No sources cataloged.</p>
                )}
              </div>
            </div>

            {/* Right Column - Recommendation Sidebar */}
            <div className="space-y-6">
              {/* Verdict banner card */}
              <div className={`p-6 border rounded-3xl shadow-md text-center space-y-4 ${getRecommendationStyle(safeReport.decision.recommendation).bg}`}>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    System Final Recommendation
                  </span>
                  <div className="text-5xl font-black tracking-widest mt-1">
                    {getRecommendationStyle(safeReport.decision.recommendation).label}
                  </div>
                </div>
                <div className="h-px bg-slate-200/50 w-full" />
                <p className="text-xs font-bold leading-relaxed text-left text-slate-600/90">
                  {safeReport.decision.shortSummary}
                </p>
              </div>

              {/* Confidence Gauge */}
              <ConfidenceGauge score={safeReport.decision.confidenceScore} />
              <div className="p-4 rounded-2xl border border-slate-700 bg-slate-900 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Confidence Rationale
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {safeReport.decision.confidenceReason}
                </p>
              </div>

              {/* Decision Score Breakdown */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-left shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Score Breakdown
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Base</span>
                    <span className="font-semibold text-slate-100">{safeReport.decision.baseScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Risk Deduction</span>
                    <span className="font-semibold text-rose-400">-{safeReport.decision.riskDeduction}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 mt-2">
                    <span className="font-medium text-slate-100">Final</span>
                    <span className="font-semibold text-blue-400">{safeReport.decision.finalScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Financial scores radar chart */}
              <RadarChart scores={safeReport.financials.scores} />

              {/* Stats and Validation Check cards */}
              <div className="p-5 surface-card rounded-3xl shadow-sm space-y-4 text-left">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Integrity Validation
                </span>
                <div className="space-y-2.5 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={14} className="fill-emerald-50" />
                    <span>Business Model Identified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={14} className="fill-emerald-50" />
                    <span>Financial Metrics Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={14} className="fill-emerald-50" />
                    <span>Competitor Moat Measured</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={14} className="fill-emerald-50" />
                    <span>Headlines & Sentiment Scanned</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={14} className="fill-emerald-50" />
                    <span>Risk Metrics Computed</span>
                  </div>
                </div>
              </div>

              {/* Reject Rationale block */}
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Alternative Reject Rationale
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed italic font-medium">
                  {safeReport.decision.whyAlternativeRejected}
                </p>
              </div>

              {/* Risk details block */}
              <div className="p-5 surface-card rounded-3xl shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-slate-400">
                    Risk Quotient Score
                  </span>
                  <span className="text-base font-bold text-rose-500">{safeReport.risks.riskScore}/100</span>
                </div>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Regulatory</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed font-medium">{safeReport.risks.regulatory}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Macroeconomic</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed font-medium">{safeReport.risks.macroeconomic}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Execution Complexity</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed font-medium">{safeReport.risks.execution}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
