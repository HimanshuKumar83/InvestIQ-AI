# InvestIQ AI

InvestIQ AI is an AI-driven investment research dashboard built with React, TypeScript, and Vite. It synthesizes company fundamentals, competitive analysis, risk assessment, and news-based sentiment into a structured, explainable investment research report.

## Overview — what it does

- Ingests a company name and produces an `InvestmentReport` containing:
  - company profile (industry, products, business model)
  - financial summary and multi-dimension scores
  - competitive landscape and moat analysis
  - recent headlines and sentiment (live API, known facts, or inferred themes)
  - risk assessment, analyst-style bull/bear debate, contradictions and missing-info detectors
  - deterministic final recommendation (`INVEST`, `WATCH`, `PASS`) with a confidence and coverage score

## How to run it — setup and run steps

Prerequisites: Node 18+, npm

1. Install dependencies

```bash
npm install
```

2. Local development

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Environment variables

- Create a local `.env` file (DO NOT commit `.env`):

```
VITE_GEMINI_API_KEY=AIzaSyBAeoGboZxGYw_xrGoyocIVUajd4ni8iw8
VITE_NEWS_API_KEY =58a51cb11660c4030e9bba081eb7c917
VITE_FINNHUB_API_KEY=d8ub7g1r01qinhugu0qgd8ub7g1r01qinhugu0r0

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Deployed Link: 

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Notes:
- The app prefers a live News API key; if none is set the pipeline falls back to curated `knownNewsFacts` or inferred themes and logs diagnostics.
- Ensure `.gitignore` contains `.env` and `node_modules/`.

## How it works — approach & architecture

- Frontend: React + TypeScript + Vite. UI is in `src/Dashboard.tsx` and components under `src/`.
- Orchestration: `src/researchGraph.ts` implements the research pipeline and progress stages. It calls specialized agent prompts (company, financials, competition, news, risks, debate, decision).
- LLM abstraction: `src/llm.ts` wraps LLM calls and provides safe fallbacks / simulated responses for offline development.
- Types: `src/types.ts` defines `InvestmentReport`, `FinalDecision`, `NewsItem`, and other domain types to keep the pipeline deterministic and typed.
- News retrieval: `fetchCompanyNewsAndFacts()` attempts live API fetch, validates responses, logs diagnostics, and falls back to `knownNewsFacts` or `inferNewsThemes()` when needed.
- Deterministic decision: a weighted scoring function aggregates dimension scores, applies risk penalties, and computes `finalScore`, `coverageScore`, and `confidenceScore` to produce a stable recommendation.

## Key decisions & trade-offs

- Deterministic scoring: chose a transparent weighted-sum model for reproducibility over an opaque LLM-only decision. Trade-off: less adaptive nuance but easier to audit.
- News handling: prefer verified headlines when available; otherwise, use curated facts or inferred themes. Trade-off: inferred themes are lower confidence but avoid empty UI states.
- Hybrid LLM + heuristic architecture: LLMs generate structured suggestions (competitors, narratives), but code validates and filters outputs. Trade-off: extra validation code but reduced hallucination risk.
- Frontend-only hosting: app is a static SPA built by Vite and served via platforms like Vercel. Trade-off: no server-side secrets; any sensitive API keys must be stored in deployment envs.

## Example runs — sample agent outputs

Below are concise, representative outputs produced by the pipeline for three companies (synthetic excerpts):

- Apple Inc. (AAPL)

  - Recommendation: WATCH
  - Final score: 68
  - Coverage: Partial (coverageScore 72)
  - Short summary: Apple is a premium consumer electronics company with strong services growth; regulatory risk around the App Store and iPhone cycle sensitivity warrant a watch stance.
  - Top reasons: strong growth indicators in services, high market position, recurring device revenue.

- NVIDIA Corporation (NVDA)

  - Recommendation: INVEST
  - Final score: 88
  - Coverage: Excellent (coverageScore 92)
  - Short summary: NVIDIA benefits from AI accelerator demand and a robust software ecosystem; despite export-control risk the risk-adjusted thesis is highly favorable.

- Tech Mahindra

  - Recommendation: PASS
  - Final score: 52
  - Coverage: Limited (coverageScore 48)
  - Short summary: IT services demand is stable but profit and growth indicators are moderate and news coverage is inferred; more verified financials needed for conviction.

These outputs are illustrative; exact results depend on available known profiles, LLM responses, and live news.

## What I would improve with more time

- Add end-to-end tests and snapshot tests for deterministic scoring behavior.
- Harden the LLM output validation and add schema-based prompt/response checks.
- Add a server-side component for safe secret storage and richer API access (rate-limited, cached news aggregation).
- Improve UI to show provenance metadata for each claim (which agent produced it, source URL, LLM prompt used).

## BONUS: LLM chat session logs (how to reproduce / sample)

This project was developed by iterating with an LLM-driven agent. Full session transcripts can be large; to reproduce or export logs locally:

- If you used the built-in conversation logging, see (example) local transcript path used during development:

```
c:\Users\hp\AppData\Roaming\Code\User\workspaceStorage\<session>\GitHub.copilot-chat\transcripts\<id>.jsonl
```

- Sample excerpt (representative) from a development chat with the LLM:

```
User: Fix competitor fallback — competitors must be company-specific and not generic placeholders.
LLM: Understood. I'll return structured competitors like [{name, reason, explanation}] and avoid phrases like "other firms".
User: Also add news API diagnostics and fallback to curated facts.
LLM: I'll include a `diagnostic` field when API fails and return `known` or `fallback` sources.
```

If you want full export of the development chat logs, I can locate and include the transcript files from your workspace or produce a sanitized export.

---

If you'd like, I can: (A) initialize a Git repo and push to GitHub for you, or (B) create a `vercel.json` and `README` deployment section with exact Vercel env names. Which do you prefer next?

