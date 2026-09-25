# Option A: Autonomous Market & Financial Research Dashboard
**Scope & Architecture Specification Document**

---

## 1. Executive Summary & Goals
The Autonomous Market & Financial Research Dashboard is a multi-agent AI application designed to conduct deep, automated research on public companies and financial trends. The system routes user queries to specialized sub-agents, retrieves SEC filings and live financial news, computes metrics, and dynamically streams interactive dashboard UI widgets (charts, metrics, tables) alongside written analysis.

### Primary Portfolio Objectives
- **Demonstrate Multi-Agent Orchestration:** Complex stateful agent loops using LangGraph.
- **Showcase Streaming Dynamic UI:** Real-time Server-Sent Events (SSE) streaming JSON-based UI component blueprints.
- **Implement Production RAG:** Hybrid dense/sparse vector search with metadata filtering over financial disclosures.

---

## 2. System Architecture & Component Design

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
|  Qdrant / Vector Index |  |   Alpha Vantage / FMP  |  | Dynamic Widget Stream  |
|  (SEC 10-K/10-Q Docs)  |  |        REST APIs       |  |  (JSON Component Schemas)|
+------------------------+  +------------------------+  +------------------------+
```

---

## 3. Technology Stack & Key Libraries

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Recharts | Dynamic streaming UI dashboard render |
| **Backend Framework**| FastAPI, Uvicorn, Asyncio | Async SSE endpoint handler |
| **Agent Framework** | LangGraph, LangChain Core | State graph management, supervisor/sub-agent routing |
| **LLM Engines** | OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet | Reasoning, function calling, schema generation |
| **Vector DB / RAG** | Qdrant (or Pinecone) + BGE-Large / OpenAI Embeddings | Hybrid vector store with metadata filtering |
| **Observability** | LangSmith or Arize Phoenix | Agent trace inspection, tool usage, latency profiling |

---

## 4. Multi-Agent Graph Flow & State Design

### Agent Roles
1. **Supervisor Agent:** Parses query, generates execution plan, delegates tasks to sub-agents, synthesizes final response.
2. **SEC Filing Search Agent:** Executes hybrid vector search over SEC 10-K/10-Q chunked disclosures to retrieve risk factors, financial disclosures, and management discussions.
3. **Market Metrics Agent:** Calls external stock financial APIs to pull historical prices, PE ratios, revenue numbers, and market cap.
4. **Widget Generator Agent:** Converts structured analytical numbers into a standardized JSON payload that client components render as interactive charts.

### State Schema (`AgentState`)
```python
from typing import TypedDict, List, Dict, Any, Annotated
import operator

class FinancialState(TypedDict):
    messages: Annotated[List[Dict[str, str]], operator.add]
    ticker: str
    research_plan: List[str]
    sec_context: List[Dict[str, Any]]
    market_metrics: Dict[str, Any]
    ui_widgets: List[Dict[str, Any]]  # Output for frontend widget rendering
    final_report: str
```

---

## 5. Implementation Milestones

### Phase 1: Data Pipeline & RAG Indexing (Days 1–3)
- Build ingestion script to pull SEC Edgar filings (10-K/10-Q) for top 50 companies.
- Implement chunking strategy with metadata (`ticker`, `filing_type`, `fiscal_year`).
- Index into Qdrant using dense embeddings + sparse BM25 keyword matching.

### Phase 2: LangGraph Orchestration & Tools (Days 4–7)
- Define `SEC_Search_Tool` and `Financial_Metrics_Tool` (integration with Alpha Vantage / Financial Modeling Prep).
- Build the core graph topology in LangGraph with conditional routing.
- Integrate structured output generation for UI visual widgets (`ChartWidget`, `MetricCardWidget`, `TableWidget`).

### Phase 3: FastAPI Backend & SSE Streaming (Days 8–10)
- Expose `/api/v1/research/stream` via FastAPI `EventSourceResponse`.
- Format event stream tokens into distinct types:
  - `event: agent_thought` (Reasoning logs)
  - `event: tool_call` (Execution updates)
  - `event: ui_component` (JSON payload for live chart rendering)
  - `event: text_chunk` (Markdown report streaming)

### Phase 4: Next.js Dynamic Dashboard Frontend (Days 11–13)
- Implement `useEventSource` hook to consume SSE stream.
- Build adaptive layout components that automatically mount and render based on received SSE UI event types.
- Render charts dynamically using `Recharts`.

### Phase 5: Testing, Observability & Polish (Days 14–15)
- Connect LangSmith trace monitoring.
- Write evaluation script comparing retrieval accuracy vs. raw prompt queries.
- Build interactive demo mode for portfolio visitors.