# Autonomous Market & Financial Research Dashboard

> A multi-agent AI system built with **LangGraph**, **FastAPI**, **Qdrant**, and **Next.js 14** that autonomously conducts equity research, indexes SEC EDGAR filings, retrieves real-time market data, and streams dynamic interactive UI widgets (charts, metric cards, risk factors) alongside comprehensive institutional research memos.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |         Next.js 14 Frontend           |
                      |  (React, Tailwind, Recharts, SSE Client)|
                      +-------------------|-------------------+
                                          | HTTP / SSE Stream
                                          v
                      +---------------------------------------+
                      |          FastAPI Gateway API          |
                      +-------------------|-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |    LangGraph Agent Coordinator        |
                      +----|--------------|---------------|---+
                           |              |               |
      +--------------------+              |               +--------------------+
      v                                   v                                    v
+------------------------+  +------------------------+  +------------------------+
|   SEC / Disclosure     |  |   Market Data & News   |  |   Financial Analyst    |
|     Search Agent       |  |     Search Agent       |  |     Synthesis Agent    |
+-----------|------------+  +-----------|------------+  +-----------|------------+
            |                           |                           |
            v                           v                           v
+------------------------+  +------------------------+  +------------------------+
|  Qdrant / Vector Index |  |      Yahoo Finance     |  | Dynamic Widget Stream  |
|  (SEC 10-K/10-Q Docs)  |  |        REST APIs       |  |  (JSON Component Schemas)|
+------------------------+  +------------------------+  +------------------------+
```

---

## Key Features

1. **Multi-Agent Orchestration (LangGraph):**
   - **Supervisor Agent:** Parses intent, extracts ticker, builds multi-stage research plan, and routes to specialists.
   - **SEC Filing Search Agent:** Performs hybrid dense/keyword retrieval over SEC 10-K and 10-Q filings.
   - **Market Metrics Agent:** Fetches real-time price, valuation multiples (P/E, PEG), profit margins, and quarterly revenue trends.
   - **Widget Generator Agent:** Converts quantitative findings into standardized JSON component blueprints.
   - **Synthesizer Agent:** Drafts an institutional equity research memorandum with inline legal citations.

2. **Dynamic UI Streaming (Server-Sent Events):**
   - Real-time SSE stream (`/api/v1/research/stream`) emitting four distinct event types:
     - `event: agent_thought` (Internal reasoning and planning updates)
     - `event: tool_call` (Execution logs from tools)
     - `event: ui_component` (JSON blueprints for React/Recharts widgets)
     - `event: text_chunk` (Streaming Markdown report tokens)

3. **Hybrid RAG over SEC Disclosures (Qdrant):**
   - In-memory embedded Qdrant vector database (zero Docker requirement for local development).
   - Dense semantic vector search + keyword BM25 boost + metadata filtering (`ticker`, `filing_type`, `fiscal_year`).

4. **Interactive Next.js 14 Dashboard:**
   - Dark-mode responsive interface.
   - Live widget renderer mounting KPI metric cards, Recharts charts, and SEC risk badges on the fly.
   - Interactive timeline of agent thoughts and tool calls.

---

## Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (or Python 3.14)
- Node.js 18+ & npm

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# (Optional) Add your OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in backend/.env

# Run backend test suite
PYTHONPATH=. pytest tests/

# Launch FastAPI development server (port 8000)
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Detailed Documentation
For an in-depth walkthrough of the design decisions, data structures, and multi-agent mental model written for beginners, read:
- [01 - System Architecture & Setup Guide](docs/01_system_architecture_and_setup.md)
- [Project Architecture Specification](project_architecture.md)
