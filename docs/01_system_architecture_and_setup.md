# 01 - System Architecture & Setup Guide
*A plain-English, beginner-friendly walkthrough of the Autonomous Market & Financial Research Dashboard.*

---

## 1. What Are We Building?

Imagine you are an equity research analyst at a top investment bank. When someone asks:
> *"What are Apple's (AAPL) biggest supply chain risks this year, and how has their gross margin trended over the past 4 quarters?"*

You don't just guess or ask a chatbot to hallucinate an answer. You do three things:
1. **Dig into official legal filings (SEC 10-K and 10-Q reports)** to read the exact risk factors disclosed under oath by management.
2. **Pull live market numbers** (revenue, EPS, gross margins, P/E ratio, historical price trend) from financial data providers.
3. **Draft a synthesized research memo with visual charts and metric cards** so a decision-maker can understand the findings in seconds.

**This project builds an autonomous multi-agent software system that does this entire workflow in seconds**, streaming the results to a modern web dashboard in real time.

---

## 2. Meet the Multi-Agent Team (The Mental Model)

Instead of relying on a single AI prompt to "do everything", we break the task down into a team of specialized agents, orchestrated by a coordinator:

```
                          [ USER QUERY ]
                                |
                                v
                   +--------------------------+
                   |  1. Supervisor Agent     |
                   |  (The Research Director) |
                   +-------------+------------+
                                 |
         +-----------------------+-----------------------+
         |                                               |
         v                                               v
+-----------------------------+               +-----------------------------+
| 2. SEC Disclosure Agent     |               | 3. Market Metrics Agent     |
| (The Legal Detective)       |               | (The Numbers Cruncher)      |
| -> Searches 10-K/10-Q filings|              | -> Fetches Stock & Financial|
|    using Hybrid Vector Search|              |    Metrics via live APIs    |
+--------------+--------------+               +--------------+--------------+
               |                                             |
               +-----------------------+---------------------+
                                       |
                                       v
                        +-----------------------------+
                        | 4. Widget Generator Agent   |
                        | (The Visual Dashboard Maker)|
                        | -> Converts numbers into    |
                        |    interactive JSON charts  |
                        +--------------+--------------+
                                       |
                                       v
                        +-----------------------------+
                        | 5. Final Report Synthesizer |
                        | -> Writes the research memo |
                        |    and streams it via SSE   |
                        +-----------------------------+
```

### The 4 Specialized Roles:
1. **The Supervisor Agent (The Coordinator):**
   - Reads the user's inquiry (e.g., *"Analyze Tesla's battery supply risks and current valuation"*).
   - Extracts the stock ticker (`TSLA`).
   - Creates a multi-step research plan.
   - Dispatches tasks to the right specialist sub-agents.
2. **The SEC Filing Agent (The Legal & Disclosure Detective):**
   - Never guesses. Uses **Hybrid RAG** (Retrieval-Augmented Generation) against Qdrant vector database.
   - Searches official SEC 10-K (annual) and 10-Q (quarterly) filings for exact phrases, risks, and management discussions.
3. **The Market Metrics Agent (The Quantitative Analyst):**
   - Fetches live financial data (P/E ratio, Beta, 52-week high/low, historical revenue, margins) from financial APIs (Alpha Vantage / Financial Modeling Prep / Yahoo Finance).
4. **The Widget & Synthesis Agent (The Presenter):**
   - Structures data into standardized UI blueprints (`ChartWidget`, `MetricCardWidget`, `TableWidget`).
   - Streams both the interactive UI components and the written narrative report live to the user's browser.

---

## 3. Why These Technologies? (Plain English Decisions)

### A. Why LangGraph instead of simple LangChain chains?
- Traditional LLM chains run in a straight line: `A -> B -> C -> End`.
- Real research requires loops and conditional logic:
  - *"Did the SEC agent find enough information about regulatory scrutiny? No? Try another search query."*
  - *"Did the market API return valid balance sheet data? If yes, send to widget generator; if no, try an alternative endpoint."*
- **LangGraph** models the process as a **State Graph**. The conversation state is a shared Python dictionary (`FinancialState`). Agents can pass control back and forth safely until the research is complete.

### B. Why Qdrant & "Hybrid" Vector Search?
- **Dense Vector Search (Embeddings):** Understands concepts. If you search for *"foreign currency headwinds"*, it finds paragraphs talking about *"Euro depreciation impacting international sales"*, even if the exact words are different.
- **Sparse Search (BM25 / Keyword):** Matches exact accounting codes or legal identifiers like `"Item 1A"`, `"ASC 606"`, or exact dollar amounts (`"$4.2 billion"`).
- **Hybrid Search combines both:** You get the best of semantic understanding and exact keyword precision.

### C. Why Server-Sent Events (SSE) instead of WebSockets?
- WebSockets are bidirectional (two-way telephone call). They are great for chat apps where both sides talk continuously, but they are harder to maintain behind firewalls, load balancers, and serverless environments.
- **Server-Sent Events (SSE)** are a one-way radio broadcast from server to browser over standard HTTP. Perfect for AI streaming: the user sends one request, and the backend streams updates (`agent_thought`, `tool_call`, `ui_component`, `text_chunk`).

---

## 4. Project Directory Layout

```
FinancialResearchAgent/
├── project_architecture.md             # High-level architecture specification
├── README.md                           # Main repository README
├── docs/                               # Developer documentation
│   └── 01_system_architecture_and_setup.md
├── backend/
│   ├── .venv/                          # Isolated Python virtual environment
│   ├── requirements.txt                # Python package dependencies
│   ├── .env.example                    # Environment variable template
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                   # Pydantic Settings & environment loader
│   │   ├── main.py                     # FastAPI application & SSE endpoints
│   │   ├── agents/                     # LangGraph agent definitions
│   │   │   ├── __init__.py
│   │   │   ├── state.py                # FinancialState typed dictionary
│   │   │   ├── supervisor.py           # Coordinator / Planner agent
│   │   │   ├── sec_agent.py            # SEC Filing search specialist
│   │   │   ├── market_agent.py         # Financial metrics specialist
│   │   │   └── widget_agent.py         # JSON UI blueprint generator
│   │   ├── graph/                      # StateGraph definition & compiled runner
│   │   │   ├── __init__.py
│   │   │   └── workflow.py
│   │   ├── tools/                      # Reusable agent tools
│   │   │   ├── __init__.py
│   │   │   ├── sec_tool.py             # SEC retrieval tool
│   │   │   └── market_tool.py          # Market & ratio fetching tool
│   │   ├── rag/                        # Vector search & document ingestion
│   │   │   ├── __init__.py
│   │   │   ├── sec_ingestion.py        # Edgar filings fetcher & chunker
│   │   │   └── vector_store.py         # Qdrant client & hybrid search
│   │   └── schemas/                    # Pydantic models & event schemas
│   │       ├── __init__.py
│   │       ├── events.py               # SSE event specifications
│   │       └── widgets.py              # Chart & metric widget contracts
│   └── tests/                          # Backend unit & integration tests
└── frontend/                           # Next.js 14 Web Application
    ├── package.json
    ├── src/
    │   ├── app/                        # Next.js App Router pages
    │   ├── components/                 # UI components (Widgets, Stream, Layout)
    │   └── hooks/                      # Custom React hooks (useEventSource)
```

---

## 5. How Data Flows Step-by-Step

```
Step 1: User enters ticker "MSFT" & prompt into Next.js frontend.
Step 2: Frontend opens an EventSource connection to POST/GET /api/v1/research/stream?ticker=MSFT.
Step 3: FastAPI initiates the LangGraph workflow.
Step 4: Supervisor analyzes query and emits `agent_thought: "Planning research on Microsoft cloud growth..."`.
Step 5: SEC Agent runs `sec_search_tool` -> emits `tool_call: "Searching Item 1A in MSFT 10-K..."`.
Step 6: Market Agent runs `market_metrics_tool` -> pulls P/E, revenue, balance sheet metrics.
Step 7: Widget Agent creates JSON schemas -> emits `ui_component: { type: "chart", data: [...] }`.
Step 8: The Next.js frontend immediately catches `ui_component` and renders an interactive Recharts chart.
Step 9: Synthesis Agent streams the final markdown report tokens as `text_chunk`.
Step 10: Stream completes with `event: done`.
```
