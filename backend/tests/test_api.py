"""
Integration tests for FastAPI endpoints and SSE Streaming

Tests are split into two categories:
  - Offline tests (no network, no LLM): test_health_endpoint
  - Live tests (requires Gemini key + internet):
      test_synchronous_research_endpoint, test_streaming_sse_endpoint

The live tests are skipped automatically in sandboxed/offline environments.
Run live tests explicitly with:
    PYTHONPATH=backend backend/.venv/bin/pytest backend/tests/test_api.py -v
(ensure GEMINI_API_KEY is in backend/.env beforehand)
"""

import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

from app.config import settings

# ---------------------------------------------------------------------------
# Decorator: skip tests that require a network connection + real Gemini key
# ---------------------------------------------------------------------------
gemini_key = (settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")).strip()
_has_key = bool(gemini_key) and gemini_key not in ("", "your_gemini_api_key_here")

NEEDS_NETWORK = pytest.mark.skipif(
    not _has_key,
    reason="GEMINI_API_KEY not set — skipping live API tests (requires network)"
)


# ---------------------------------------------------------------------------
# OFFLINE TEST — always runs, no internet required
# ---------------------------------------------------------------------------
def test_health_endpoint():
    """
    Verifies the /health endpoint returns HTTP 200 with {"status": "healthy"}.
    This test is fully offline and should always pass.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


# ---------------------------------------------------------------------------
# LIVE TESTS — require GEMINI_API_KEY and network access
# ---------------------------------------------------------------------------
@NEEDS_NETWORK
def test_synchronous_research_endpoint():
    """
    Runs the full LangGraph multi-agent pipeline via POST /api/v1/research.
    Verifies that:
      - The response is HTTP 200
      - The ticker in the response matches what was requested
      - At least one UI widget was generated
      - A non-empty final report was produced
    """
    response = client.post("/api/v1/research", json={
        "query": "Analyze Microsoft cloud growth and AI investments",
        "ticker": "MSFT"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "MSFT"
    assert len(data["ui_widgets"]) > 0
    assert len(data["final_report"]) > 0
    assert data["is_complete"] is True


@NEEDS_NETWORK
def test_streaming_sse_endpoint():
    """
    Verifies that GET /api/v1/research/stream emits the correct SSE event types:
      event: agent_thought  — agent is working on a step
      event: ui_component   — a widget has been generated
      event: text_chunk     — a chunk of the markdown report
      event: done           — pipeline complete
    """
    with client.stream("GET", "/api/v1/research/stream?query=Analyze+Tesla+risks&ticker=TSLA") as response:
        assert response.status_code == 200
        content = ""
        for line in response.iter_lines():
            content += line + "\n"

        assert "event: agent_thought" in content
        assert "event: ui_component" in content
        assert "event: text_chunk" in content
        assert "event: done" in content
