"""
SEC Filing & Disclosure Search Agent
------------------------------------
Specialist agent responsible for navigating regulatory documents (10-K, 10-Q)
and extracting legally binding disclosures, risks, and executive commentary.
"""

from typing import Dict, Any
from app.agents.state import FinancialState
from app.tools.sec_tool import get_shared_vector_store
from app.rag.sec_ingestion import fetch_sec_filings_edgar, prepare_chunks
from app.agents.llm_factory import get_llm, clean_llm_text


def sec_agent_node(state: FinancialState) -> Dict[str, Any]:
    """
    SEC Agent Node in LangGraph.
    Retrieves regulatory disclosure chunks matching the research query.
    """
    ticker = state.get("ticker", "AAPL").upper()
    user_query = state.get("user_query", "financial results and risk factors")
    store = get_shared_vector_store()

    # Query vector store for ticker
    results = store.search(
        query=user_query,
        ticker=ticker,
        limit=4
    )

    # If nothing in vector store for this ticker, attempt fallback ingestion
    if not results:
        try:
            import asyncio
            # In sync context, we can run the coroutine or seed fallback
            filings = asyncio.run(fetch_sec_filings_edgar(ticker))
            if filings:
                chunks = prepare_chunks(filings)
                store.index_documents(chunks)
                results = store.search(query=user_query, ticker=ticker, limit=4)
        except Exception:
            pass

    log_content = (
        f"SEC Disclosure Agent: Retrieved {len(results)} disclosure passages for {ticker} "
        f"from SEC Form 10-K filings."
    )

    llm = get_llm()
    if llm and results:
        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            summary_prompt = (
                f"Summarize what you found in the SEC filings for {ticker} in 1 short sentence:\n"
                f"{results[0].get('text')[:300]}"
            )
            resp = llm.invoke([SystemMessage(content="You are an SEC filing research analyst."), HumanMessage(content=summary_prompt)])
            cleaned = clean_llm_text(resp.content)
            if cleaned:
                log_content = f"SEC Disclosure Agent: {cleaned}"
        except Exception:
            pass

    log_entry = {
        "agent": "sec_agent",
        "type": "tool_call",
        "content": log_content,
        "details": {"ticker": ticker, "passages_found": len(results)}
    }

    return {
        "sec_context": results,
        "current_step": "market_agent",
        "next_agent": "market_agent",
        "agent_logs": [log_entry]
    }
