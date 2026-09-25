"""
Market Metrics & Financial Data Agent
-------------------------------------
Specialist agent responsible for retrieving real-time valuation multiples,
profit margins, 52-week price ranges, and historical quarterly revenue trends.
"""

from typing import Dict, Any
from app.agents.state import FinancialState
from app.tools.market_tool import fetch_ticker_metrics


def market_agent_node(state: FinancialState) -> Dict[str, Any]:
    """
    Market Metrics Agent Node in LangGraph.
    Fetches real-time price, ratios, and revenue trends.
    """
    ticker = state.get("ticker", "AAPL").upper()
    metrics = fetch_ticker_metrics(ticker)

    log_entry = {
        "agent": "market_agent",
        "type": "tool_call",
        "content": (
            f"Market Metrics Agent: Fetched live fundamentals for {metrics.get('company_name', ticker)}: "
            f"Price: ${metrics.get('current_price')}, Market Cap: {metrics.get('market_cap')}, "
            f"P/E: {metrics.get('trailing_pe')}, Gross Margin: {metrics.get('gross_margin')}%."
        ),
        "details": {
            "ticker": ticker,
            "price": metrics.get("current_price"),
            "market_cap": metrics.get("market_cap")
        }
    }

    return {
        "market_metrics": metrics,
        "company_name": metrics.get("company_name", ticker),
        "current_step": "widget_agent",
        "next_agent": "widget_agent",
        "agent_logs": [log_entry]
    }
