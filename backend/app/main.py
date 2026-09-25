"""
FastAPI Gateway & Real-Time SSE Streamer
----------------------------------------
Entry point for the backend API. Exposes endpoints for synchronous research
and real-time Server-Sent Events (SSE) streaming of agent thoughts, tool calls,
dynamic UI widget blueprints, and incremental report markdown.
"""

import asyncio
import json
from typing import AsyncGenerator, Optional
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.graph.workflow import research_graph
from app.agents.state import FinancialState
from contextlib import asynccontextmanager
from app.schemas.events import StreamEvent, StreamEventType
from app.tools.sec_tool import get_shared_vector_store
from app.rag.sec_ingestion import seed_vector_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes in-memory Qdrant and seeds reference filings upon boot."""
    store = get_shared_vector_store()
    seed_vector_store(store)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-Agent Autonomous Financial & Market Research Dashboard API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    query: str = Field(..., examples=["Analyze Apple supply chain risks and recent revenue performance"])
    ticker: Optional[str] = Field(None, examples=["AAPL"])


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "default_model": settings.DEFAULT_LLM_MODEL
    }


async def stream_research_events(query: str, ticker: Optional[str]) -> AsyncGenerator[str, None]:
    """
    Generator that executes the LangGraph workflow step-by-step
    and yields SSE events to the browser in real time.
    """
    initial_state: FinancialState = {
        "messages": [],
        "ticker": ticker.upper() if ticker else "",
        "company_name": None,
        "user_query": query,
        "research_plan": [],
        "current_step": None,
        "next_agent": None,
        "sec_context": [],
        "market_metrics": {},
        "ui_widgets": [],
        "agent_logs": [],
        "final_report": "",
        "is_complete": False
    }

    try:
        # Initial greeting event
        init_event = StreamEvent(
            event=StreamEventType.AGENT_THOUGHT,
            data={"agent": "coordinator", "content": f"Received query: '{query}'. Initializing multi-agent graph."}
        )
        yield init_event.to_sse()
        await asyncio.sleep(0.05)

        # Stream node-by-node execution
        async for output in research_graph.astream(initial_state):
            for node_name, values in output.items():
                # 1. Emit Agent Logs / Thoughts / Tool calls
                logs = values.get("agent_logs", [])
                for log in logs:
                    evt_type = StreamEventType.TOOL_CALL if log.get("type") == "tool_call" else StreamEventType.AGENT_THOUGHT
                    event = StreamEvent(
                        event=evt_type,
                        data=log
                    )
                    yield event.to_sse()
                    await asyncio.sleep(0.05)

                # 2. Emit Dynamic UI Widgets when generated
                widgets = values.get("ui_widgets", [])
                for widget in widgets:
                    widget_event = StreamEvent(
                        event=StreamEventType.UI_COMPONENT,
                        data=widget
                    )
                    yield widget_event.to_sse()
                    await asyncio.sleep(0.05)

                # 3. Stream final report in chunks
                if "final_report" in values and values["final_report"]:
                    report_text = values["final_report"]
                    # Chunk by sentences / paragraphs for realistic typewriter effect
                    paragraphs = report_text.split("\n\n")
                    for p in paragraphs:
                        chunk_event = StreamEvent(
                            event=StreamEventType.TEXT_CHUNK,
                            data={"chunk": p + "\n\n"}
                        )
                        yield chunk_event.to_sse()
                        await asyncio.sleep(0.04)

        # Completion signal
        done_event = StreamEvent(
            event=StreamEventType.DONE,
            data={"status": "completed", "message": "Research pipeline finished successfully."}
        )
        yield done_event.to_sse()

    except Exception as e:
        error_event = StreamEvent(
            event=StreamEventType.ERROR,
            data={"error": str(e), "message": "An error occurred during multi-agent graph execution."}
        )
        yield error_event.to_sse()


@app.get("/api/v1/research/stream")
async def get_research_stream(
    query: str = Query(..., description="Research query prompt"),
    ticker: Optional[str] = Query(None, description="Optional stock ticker")
):
    """SSE endpoint for streaming real-time research outputs (GET)."""
    return StreamingResponse(
        stream_research_events(query, ticker),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.post("/api/v1/research/stream")
async def post_research_stream(req: ResearchRequest):
    """SSE endpoint for streaming real-time research outputs (POST)."""
    return StreamingResponse(
        stream_research_events(req.query, req.ticker),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.post("/api/v1/research")
async def synchronous_research(req: ResearchRequest):
    """Synchronous JSON endpoint returning the entire completed FinancialState."""
    initial_state: FinancialState = {
        "messages": [],
        "ticker": req.ticker.upper() if req.ticker else "",
        "company_name": None,
        "user_query": req.query,
        "research_plan": [],
        "current_step": None,
        "next_agent": None,
        "sec_context": [],
        "market_metrics": {},
        "ui_widgets": [],
        "agent_logs": [],
        "final_report": "",
        "is_complete": False
    }
    result = await research_graph.ainvoke(initial_state)
    return result
