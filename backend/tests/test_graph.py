"""
Unit tests for LangGraph multi-agent graph execution
"""

import pytest
from app.graph.workflow import research_graph


def test_research_graph_full_flow():
    initial_state = {
        "messages": [],
        "ticker": "AAPL",
        "company_name": None,
        "user_query": "Analyze Apple's supply chain risks and recent revenue trends",
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

    # Execute graph synchronously
    final_output = research_graph.invoke(initial_state)

    # Validate output
    assert final_output["ticker"] == "AAPL"
    assert len(final_output["research_plan"]) > 0
    assert len(final_output["sec_context"]) > 0
    assert final_output["market_metrics"]["current_price"] > 0
    assert len(final_output["ui_widgets"]) >= 2
    assert final_output["is_complete"] is True
    assert "Apple" in final_output["final_report"]
    assert len(final_output["agent_logs"]) >= 4
