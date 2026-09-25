"""
Supervisor / Coordinator Agent
------------------------------
Acts as the research director. Parses the user prompt, determines the primary ticker,
creates an actionable research plan, and coordinates delegation to specialist sub-agents.
"""

import re
from typing import Dict, Any, List
from app.agents.state import FinancialState
from app.agents.llm_factory import get_llm, clean_llm_text

COMMON_TICKERS = {
    "APPLE": "AAPL",
    "MICROSOFT": "MSFT",
    "NVIDIA": "NVDA",
    "TESLA": "TSLA",
    "AMAZON": "AMZN",
    "GOOGLE": "GOOGL",
    "ALPHABET": "GOOGL",
    "META": "META",
    "FACEBOOK": "META"
}


def extract_ticker_from_text(text: str) -> str:
    """Extracts a stock ticker from user input or matches common company names."""
    # Check for exact company names first
    text_upper = text.upper()
    for name, sym in COMMON_TICKERS.items():
        if name in text_upper:
            return sym

    # Look for $TICKER or isolated 2-5 letter all-caps words
    dollar_match = re.search(r"\$([A-Z]{1,5})\b", text)
    if dollar_match:
        return dollar_match.group(1)

    word_match = re.search(r"\b([A-Z]{2,5})\b", text)
    if word_match and word_match.group(1) not in {"THE", "AND", "FOR", "WHAT", "HOW", "SEC", "CEO", "CFO", "RAG", "API"}:
        return word_match.group(1)

    return "AAPL"  # Default fallback benchmark


def supervisor_node(state: FinancialState) -> Dict[str, Any]:
    """
    Supervisor Node in LangGraph.
    Inspects user query, builds research plan, and emits initial thought log.
    """
    user_query = state.get("user_query") or (state.get("messages", [{}])[-1].get("content", ""))
    ticker = state.get("ticker") or extract_ticker_from_text(user_query)

    plan = [
        f"1. Query SEC Edgar vector index for {ticker} 10-K/10-Q risk disclosures and operational performance.",
        f"2. Fetch live market metrics and financial multiples for {ticker} (P/E, margins, quarterly revenue trend).",
        f"3. Generate dynamic UI visualization blueprints (metrics cards, revenue chart, risk breakdown).",
        f"4. Synthesize final comprehensive equity research report."
    ]

    llm = get_llm()
    thought_summary = f"Supervisor: Analyzed request for ticker '{ticker}'. Initiated 4-phase research execution plan."

    if llm:
        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            prompt = (
                f"You are the Research Director of an autonomous financial analysis agent team.\n"
                f"User Request: {user_query}\n"
                f"Target Ticker: {ticker}\n"
                f"Formulate a brief 1-2 sentence statement of your plan and delegation strategy."
            )
            resp = llm.invoke([SystemMessage(content="You are a senior hedge fund research director."), HumanMessage(content=prompt)])
            cleaned = clean_llm_text(resp.content)
            if cleaned:
                thought_summary = f"Supervisor: {cleaned}"
        except Exception:
            pass

    log_entry = {
        "agent": "supervisor",
        "type": "thought",
        "content": thought_summary
    }

    return {
        "ticker": ticker,
        "research_plan": plan,
        "current_step": "sec_agent",
        "next_agent": "sec_agent",
        "agent_logs": [log_entry]
    }
