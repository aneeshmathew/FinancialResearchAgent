"""
Unit tests for SEC and Market Agent Tools
"""

import pytest
from app.tools.sec_tool import search_sec_filings
from app.tools.market_tool import get_financial_metrics, fetch_ticker_metrics


def test_sec_tool_execution():
    result = search_sec_filings.invoke({
        "query": "supply chain risks and manufacturing partners",
        "ticker": "AAPL"
    })
    assert isinstance(result, str)
    assert "AAPL" in result
    assert "supply chain" in result.lower() or "supplier" in result.lower()


def test_market_tool_fallback_metrics():
    metrics = fetch_ticker_metrics("AAPL")
    assert metrics["ticker"] == "AAPL"
    assert metrics["current_price"] > 0
    assert len(metrics["revenue_trend"]) > 0

    text_summary = get_financial_metrics.invoke({"ticker": "AAPL"})
    assert "Apple" in text_summary or "AAPL" in text_summary
    assert "Market Capitalization" in text_summary
