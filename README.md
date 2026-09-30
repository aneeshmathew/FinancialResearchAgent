# Autonomous Market & Financial Research Dashboard (Frontend)

> A modern **Next.js 14** interactive financial research dashboard that connects to an autonomous multi-agent backend via Server-Sent Events (SSE). Streams real-time agent reasoning steps, dynamically renders interactive widgets (KPI metric cards, revenue trend charts, risk badges), and live-renders formatted equity research memoranda with dark and light theme support.

---

## Two-Repository Architecture

```
                      +---------------------------------------+
                      |         FastAPI Gateway API          |
                      |   (/api/v1/research/stream [SSE])     |
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

This project is decoupled into two repositories for streamlined CI/CD, modular scaling, and zero-config cloud deployments:

| Repository | Tech Stack | Role | Target Deployment |
| :--- | :--- | :--- | :--- |
| **[FinancialResearchAgent](https://github.com/aneeshmathew/FinancialResearchAgent)** *(This Repo)* | Next.js 14, React 18, Tailwind CSS, Recharts | Interactive UI dashboard, SSE client, dynamic widget renderer, dark/light theme | **Vercel** (Zero-config edge CDN) |
| **[FinancialResearchAgent_Backend](https://github.com/aneeshmathew/FinancialResearchAgent_Backend)** | FastAPI, Python 3.11/3.14, LangGraph, Qdrant | Supervisor agent, SEC 10-K RAG, live Yahoo Finance tools, widget generator, report synthesizer | **Render** (Persistent Linux container) |

---

## Key Features

1. **Server-Sent Events (SSE) Streaming Client (`useEventSource`):**
   - Consumes `/api/v1/research/stream` with real-time multiplexing across 4 event types:
     - `agent_thought`: Live reasoning logs from Supervisor and specialist agents.
     - `tool_call`: Live external tool execution telemetry (SEC EDGAR, Yahoo Finance).
     - `ui_component`: Dynamic JSON component blueprints rendered on-the-fly.
     - `text_chunk`: Token-by-token streaming markdown equity research memo.

2. **Adaptive Dynamic Widget Renderer (`WidgetRenderer`):**
   - **Metric Cards:** Real-time stock prices, 52-week ranges, P/E ratios, profit margins with change indicators.
   - **Interactive Charts:** Recharts bar and line charts displaying historical revenue trajectories.
   - **Risk Assessment Badges:** Categorized SEC 10-K risk factors with severity badges (High / Medium / Low).
   - **Financial Tables:** Multi-year structured balance sheet and income statement comparisons.

3. **Theme & UX Enhancements:**
   - Full dark and light theme toggle with smooth CSS transitions.
   - One-click preset search queries for popular tickers (AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA).
   - Pre-populated default prompt for instant zero-click demonstration.
   - Real-time connection status indicators (`Streaming...`, `Completed`, `Error`).

---

## Local Development Quickstart

### Prerequisites
- Node.js 18.x or 20.x
- npm or pnpm

### 1. Installation

```bash
# Clone the frontend repository
git clone https://github.com/aneeshmathew/FinancialResearchAgent.git
cd FinancialResearchAgent

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

By default, `.env.local` points to `http://localhost:8000`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
*(If your backend is already deployed to Render, you can point directly to `https://your-backend.onrender.com`)*.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with ThemeProvider
│   │   ├── page.tsx           # Main dashboard interface
│   │   └── globals.css        # Tailwind styling & dark/light variables
│   ├── components/
│   │   ├── stream/
│   │   │   ├── AgentThoughtLog.tsx   # Real-time multi-agent reasoning timeline
│   │   │   └── MarkdownReport.tsx    # Streaming research report viewer
│   │   └── widgets/
│   │       ├── ChartWidget.tsx       # Dynamic Recharts revenue graphs
│   │       ├── MetricCardWidget.tsx  # KPI metric cards
│   │       ├── RiskItemWidget.tsx    # SEC disclosure risk cards
│   │       ├── TableWidget.tsx       # Comparative financial tables
│   │       └── WidgetRenderer.tsx    # Dynamic widget registry dispatcher
│   ├── context/
│   │   └── ThemeContext.tsx   # Dark/light theme state & toggle
│   ├── hooks/
│   │   └── useEventSource.ts  # SSE streaming client hook
│   └── types/
│       └── index.ts           # TypeScript schemas for SSE events & widgets
├── next.config.js             # Local API proxy rewrites
├── tailwind.config.ts         # Tailwind design tokens
└── package.json               # Root npm dependencies & build scripts
```

---

## Documentation Links

- **Project Architecture:** [project_architecture.md](project_architecture.md)
- **System Architecture & Setup:** [docs/01_system_architecture_and_setup.md](docs/01_system_architecture_and_setup.md)
