# InvestIQ AI

InvestIQ AI is a premium, AI-assisted investment research application built with React, TypeScript, Vite, and a structured research pipeline. It takes a company name, orchestrates research across company understanding, financial analysis, competitive intelligence, news review, risk analysis, and debate, and produces an explainable recommendation with a confidence score and export-ready report output.

## Overview

InvestIQ AI helps a user quickly explore a company’s business model, financial quality, competitive moat, recent headlines, and risk posture in a single workflow. The app is designed to feel like an institutional research workspace rather than a generic chatbot UI.

### What it does

- Accepts a company name or ticker-style input
- Runs a multi-stage research pipeline:
  - company understanding
  - financial analysis
  - competitive intelligence
  - news and market signal collection
  - risk assessment
  - bull/bear debate synthesis
  - contradiction and missing-info validation
  - final recommendation generation
- Produces a structured investment report with:
  - company profile
  - financial highlights
  - competitive moat context
  - news-derived insights
  - risk factors
  - recommendation score and rationale
- Supports export to PDF, DOCX, and JSON

## How to run it

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Environment variables

Create a local `.env` file in the project root:

```env
VITE_TAVILY_API_KEY=put your api key here
VITE_GEMINI_API_KEY= put your api key here
```

### Deployed link

- Deployed link: invest-iq-ai-rho.vercel.app

### Notes

- The app uses Tavily when available for live web research.
- If live headline retrieval is unavailable, it gracefully falls back to known facts or inferred themes.
- Do not commit your `.env` file.

## How it works

### Architecture

- Frontend: React + TypeScript + Vite
- UI: dashboard-style research experience with premium cards, animated pipeline states, and export actions
- Pipeline orchestration: implemented in `src/researchGraph.ts`
- LLM abstraction: handled in `src/llm.ts`
- Feature-based scoring: implemented in `src/aiModel.ts`
- Types and report schema: defined in `src/types.ts`
- Export engine: implemented in `src/exportUtils.ts`

### Workflow

1. User enters a company query.
2. The app resolves the company and builds a research context.
3. The pipeline gathers company, financial, competition, news, and risk information.
4. A deterministic scoring model produces a recommendation.
5. The report is displayed in the dashboard and can be exported.

### Design choices

- The project uses a hybrid approach: deterministic scoring for consistency and AI-generated narrative for explanation.
- The UI is built to resemble a premium enterprise research workspace rather than a chatbot experience.
- The system is intentionally explainable: each recommendation includes rationale, score breakdown, confidence, and coverage information.

## Key decisions and trade-offs

### What was chosen

- Deterministic score + rationale pairing for explainability
- Structured output over free-form chat responses
- Graceful fallback behavior when live data is unavailable
- A compact, maintainable frontend-first architecture for the assignment scope

### Trade-offs

- Live API data improves relevance but may be unavailable or rate-limited
- The current implementation prioritizes clarity and maintainability over fully autonomous multi-agent orchestration
- The research engine uses curated and inferred context when external data is missing, which helps avoid empty states but reduces certainty

## Example runs

Below are sample outcomes from the app for a few companies.

### Apple

- Recommendation: WATCH
- Final score: moderate-to-strong, with high brand strength but regulatory and cyclical risks
- Key themes: recurring revenue, premium positioning, services growth, App Store risk

### NVIDIA

- Recommendation: INVEST
- Final score: strong due to AI demand, moat, and market positioning
- Key themes: GPU leadership, software ecosystem, AI infrastructure momentum

### Tesla

- Recommendation: WATCH or PASS depending on the current risk posture and evidence availability
- Key themes: innovation, scale, execution risk, competitive pressure, margin sensitivity

These examples are representative and can vary depending on available live data and fallback context.

## What I would improve with more time

- Add richer backend caching and rate limiting for external APIs
- Introduce stronger schema validation for AI outputs
- Expand the report into a more institutional-style PDF and DOCX layout with tables, charts, and section headers
- Add test coverage for scoring, fallback logic, and export behavior
- Improve provenance by linking each claim to a source or evidence block

## Bonus: LLM chat session logs

This project was developed iteratively while working with an AI assistant. The development process included prompt-driven refinement of the research pipeline, scoring logic, UI polish, and export flow.

Representative development conversation themes included:

- improving the competitiveness and moat analysis
- tightening the scoring logic to be more explainable
- adding graceful fallback handling for missing live data
- improving the UI to feel more premium and less chatbot-like
- adding export functionality for reports and memo-style output

A sanitized excerpt of the process looked like this:

```text
User: Make the recommendation process more explainable and less generic.
Assistant: I’ll add a deterministic scoring layer and surface the rationale in the dashboard.

User: The news section should not show a misleading unavailable state when no live data is present.
Assistant: I’ll remove the summary block and keep the UI focused on actual headlines or fallback messaging.
```

## Folder structure

```text
src/
  App.tsx
  Dashboard.tsx
  ConfidenceGauge.tsx
  RadarChart.tsx
  LoadingSkeleton.tsx
  researchGraph.ts
  llm.ts
  aiModel.ts
  apiClient.ts
  exportUtils.ts
  types.ts
  main.tsx
  index.css
```

## Summary

InvestIQ AI is a polished, assignment-ready prototype for an AI-powered investment research platform. It combines structured company analysis, explainable scoring, and polished UI to create a compelling first version of a premium research workflow.

