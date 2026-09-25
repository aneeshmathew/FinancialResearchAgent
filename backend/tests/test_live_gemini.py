"""
Live Gemini Integration Test
----------------------------
This test is OPTIONAL — it verifies the full LangGraph pipeline produces
real LLM-generated text using your free Gemini API key.

How to run ONLY this test:
    PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_live_gemini.py -v -s

It is SKIPPED automatically when GEMINI_API_KEY is not set, so it will never
block normal offline testing.

What a naive developer needs to know:
  - This calls Google's servers (requires internet)
  - Uses your free Gemini key from backend/.env
  - Should produce a real equity research report for AAPL
"""

import pytest
import os


# ---------------------------------------------------------------------------
# Skip the whole file unless a real Gemini key is present
# ---------------------------------------------------------------------------
def _has_real_gemini_key() -> bool:
    """Returns True only when we have a key that isn't the placeholder text."""
    key = os.environ.get("GEMINI_API_KEY", "")
    return bool(key) and key not in ("your_gemini_api_key_here", "")


pytestmark = pytest.mark.skipif(
    not _has_real_gemini_key(),
    reason="GEMINI_API_KEY not set — skipping live Gemini tests"
)


# ---------------------------------------------------------------------------
# Test 1: Verify get_llm() returns a real Gemini model object
# ---------------------------------------------------------------------------
def test_get_llm_returns_gemini():
    """
    Checks that llm_factory.get_llm() does not return None when
    GEMINI_API_KEY is present. If it returns None, the full pipeline
    falls back to template text (no real AI output).
    """
    from app.agents.llm_factory import get_llm
    llm = get_llm()
    assert llm is not None, (
        "get_llm() returned None — Gemini is not loading correctly. "
        "Check GEMINI_API_KEY in backend/.env"
    )
    # The class name will contain 'GoogleGenerativeAI'
    assert "GoogleGenerativeAI" in type(llm).__name__ or "Google" in str(type(llm)), (
        f"Expected a Google Gemini LLM, got: {type(llm).__name__}"
    )


# ---------------------------------------------------------------------------
# Test 2: Simple one-shot Gemini call (sanity check before full pipeline)
# ---------------------------------------------------------------------------
def test_gemini_hello_world():
    """
    Sends a tiny prompt to Gemini and checks we get non-empty text back.
    This verifies your API key works and the model endpoint is reachable.
    """
    from app.agents.llm_factory import get_llm, clean_llm_text
    from langchain_core.messages import HumanMessage

    llm = get_llm()
    assert llm is not None

    response = llm.invoke([HumanMessage(content="Say exactly: Hello from Gemini")])
    text = clean_llm_text(response.content)
    print(f"\n[Gemini raw response type]: {type(response.content)}")
    print(f"[Gemini response text]: {text[:200]}")

    assert len(text) > 0, "Gemini returned empty response"
    # Loose check — we just want *some* text back
    assert any(w in text.lower() for w in ["hello", "gemini", "hi"]), (
        f"Expected 'hello' or 'gemini' in response, got: {text[:200]}"
    )


# ---------------------------------------------------------------------------
# Test 3: Full LangGraph pipeline with real Gemini LLM
# ---------------------------------------------------------------------------
def test_full_pipeline_with_gemini():
    """
    Runs the entire multi-agent LangGraph pipeline for ticker 'AAPL' and
    verifies that the final_report contains real AI-generated text (not
    just a fallback template).

    Pipeline stages:
      supervisor → sec_agent → market_agent → widget_agent → synthesizer

    Each stage calls Gemini to produce intelligent output.
    """
    from app.graph.workflow import research_graph

    initial_state = {
        "messages": [],
        "ticker": "AAPL",
        "company_name": None,
        "user_query": "Analyze Apple's supply chain risks and revenue trends",
        "research_plan": [],
        "current_step": None,
        "next_agent": None,
        "sec_context": [],
        "market_metrics": {},
        "ui_widgets": [],
        "agent_logs": [],
        "final_report": "",
        "is_complete": False,
    }

    result = research_graph.invoke(initial_state)

    # ---- Assertions ----
    final_report = result.get("final_report", "")
    agent_logs = result.get("agent_logs", [])
    widgets = result.get("ui_widgets", [])

    print(f"\n[Pipeline complete]")
    print(f"  final_report length: {len(final_report)} chars")
    print(f"  agent_logs count: {len(agent_logs)}")
    print(f"  widgets count: {len(widgets)}")
    print(f"\n[Report preview (first 400 chars)]:\n{final_report[:400]}")
    print(f"\n[Agent log summary]:")
    for log in agent_logs:
        print(f"  [{log.get('agent')}]: {log.get('content', '')[:100]}")

    # The pipeline must complete
    assert result.get("is_complete") is True, "Pipeline did not reach is_complete=True"

    # The report should have real content (not just a placeholder)
    assert len(final_report) > 100, (
        f"Final report too short ({len(final_report)} chars) — likely a fallback template."
    )

    # We should have at least one agent log from each key agent
    agents_that_ran = {log.get("agent") for log in agent_logs}
    for expected_agent in ["supervisor", "synthesizer"]:
        assert expected_agent in agents_that_ran, (
            f"Expected agent '{expected_agent}' to run, got: {agents_that_ran}"
        )

    # We should have at least one UI widget
    assert len(widgets) >= 1, "No widgets generated — widget_agent may have failed"
