"""
Agent State Definition
----------------------
Defines `FinancialState`, the central shared state schema passed across
all nodes in the LangGraph multi-agent execution pipeline.

Why this matters (Mental Model):
In LangGraph, each agent is a function that takes this state, reads what it needs,
does its work (e.g. queries SEC filings or fetches stock prices), and returns
updates to be merged into this dictionary.
"""

from typing import TypedDict, List, Dict, Any, Annotated, Optional
import operator


class FinancialState(TypedDict):
    # Chat / prompt message history
    messages: Annotated[List[Dict[str, Any]], operator.add]

    # Core query parameters
    ticker: str
    company_name: Optional[str]
    user_query: str

    # Agent planning & internal routing
    research_plan: List[str]
    current_step: Optional[str]
    next_agent: Optional[str]

    # Sub-agent gathered knowledge
    sec_context: List[Dict[str, Any]]        # Retrieved 10-K / 10-Q filing chunks
    market_metrics: Dict[str, Any]            # Stock prices, ratios, historical financials

    # Output payloads for frontend
    ui_widgets: Annotated[List[Dict[str, Any]], operator.add]  # Dynamic charts, metrics, tables
    agent_logs: Annotated[List[Dict[str, Any]], operator.add]  # Reasoning & tool execution logs
    final_report: str                                          # Formatted markdown report
    is_complete: bool                                          # Pipeline completion flag
