"""
LangGraph Multi-Agent Workflow Engine
-------------------------------------
Constructs the stateful graph connecting all specialized sub-agents:
  START
    -> supervisor (query parsing & planning)
    -> sec_agent (hybrid RAG retrieval from 10-K/10-Q)
    -> market_agent (live stock metrics, margins & trend)
    -> widget_agent (structured UI JSON blueprint generation)
    -> synthesizer (equity research memo synthesis)
  -> END
"""

from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, START, END
from app.agents.state import FinancialState
from app.agents.supervisor import supervisor_node
from app.agents.sec_agent import sec_agent_node
from app.agents.market_agent import market_agent_node
from app.agents.widget_agent import widget_agent_node
from app.agents.synthesizer import synthesizer_node


def route_supervisor(state: FinancialState) -> Literal["sec_agent", "market_agent", "widget_agent", "synthesizer"]:
    """Conditional router allowing supervisor to skip or route dynamically."""
    next_agent = state.get("next_agent")
    if next_agent in ["sec_agent", "market_agent", "widget_agent", "synthesizer"]:
        return next_agent
    return "sec_agent"


def build_financial_research_graph():
    """Builds and compiles the multi-agent LangGraph workflow."""
    workflow = StateGraph(FinancialState)

    # 1. Register Nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("sec_agent", sec_agent_node)
    workflow.add_node("market_agent", market_agent_node)
    workflow.add_node("widget_agent", widget_agent_node)
    workflow.add_node("synthesizer", synthesizer_node)

    # 2. Define Execution Graph Edges
    workflow.add_edge(START, "supervisor")
    workflow.add_conditional_edges("supervisor", route_supervisor)
    workflow.add_edge("sec_agent", "market_agent")
    workflow.add_edge("market_agent", "widget_agent")
    workflow.add_edge("widget_agent", "synthesizer")
    workflow.add_edge("synthesizer", END)

    return workflow.compile()


# Compiled singleton graph
research_graph = build_financial_research_graph()
