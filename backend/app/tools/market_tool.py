"""
Market Metrics & Financial Data Tool
------------------------------------
Tool used by the Market Metrics Agent to fetch live financial ratios,
valuation metrics, margin trends, and quarterly historical revenues.

Uses Yahoo Finance (`yfinance`) as the default free real-time data engine,
with graceful fallback to structured baseline metrics for top companies.
"""

from typing import Dict, Any, Optional, List
import yfinance as yf
from langchain_core.tools import tool

# Fallback financial fundamentals for top companies (useful offline or during rate limits)
FALLBACK_MARKET_DATA = {
    "AAPL": {
        "company_name": "Apple Inc.",
        "current_price": 228.50,
        "market_cap": "$3.48T",
        "market_cap_raw": 3480000000000,
        "trailing_pe": 34.2,
        "forward_pe": 29.8,
        "peg_ratio": 2.45,
        "gross_margin": 46.2,
        "operating_margin": 31.5,
        "fifty_two_week_high": 237.23,
        "fifty_two_week_low": 164.08,
        "revenue_trend": [
            {"period": "Q4 23", "revenue_billions": 89.5, "net_income_billions": 22.96},
            {"period": "Q1 24", "revenue_billions": 119.58, "net_income_billions": 33.92},
            {"period": "Q2 24", "revenue_billions": 90.75, "net_income_billions": 23.64},
            {"period": "Q3 24", "revenue_billions": 85.78, "net_income_billions": 21.45},
            {"period": "Q4 24", "revenue_billions": 94.93, "net_income_billions": 14.74}
        ]
    },
    "MSFT": {
        "company_name": "Microsoft Corporation",
        "current_price": 435.20,
        "market_cap": "$3.24T",
        "market_cap_raw": 3240000000000,
        "trailing_pe": 35.8,
        "forward_pe": 30.5,
        "peg_ratio": 2.10,
        "gross_margin": 69.8,
        "operating_margin": 44.6,
        "fifty_two_week_high": 468.35,
        "fifty_two_week_low": 309.45,
        "revenue_trend": [
            {"period": "Q1 24", "revenue_billions": 56.52, "net_income_billions": 22.29},
            {"period": "Q2 24", "revenue_billions": 62.02, "net_income_billions": 21.87},
            {"period": "Q3 24", "revenue_billions": 61.86, "net_income_billions": 21.94},
            {"period": "Q4 24", "revenue_billions": 64.73, "net_income_billions": 22.04}
        ]
    },
    "NVDA": {
        "company_name": "NVIDIA Corporation",
        "current_price": 128.40,
        "market_cap": "$3.15T",
        "market_cap_raw": 3150000000000,
        "trailing_pe": 48.6,
        "forward_pe": 32.1,
        "peg_ratio": 1.15,
        "gross_margin": 75.1,
        "operating_margin": 62.1,
        "fifty_two_week_high": 140.76,
        "fifty_two_week_low": 40.50,
        "revenue_trend": [
            {"period": "Q3 24", "revenue_billions": 18.12, "net_income_billions": 9.24},
            {"period": "Q4 24", "revenue_billions": 22.10, "net_income_billions": 12.29},
            {"period": "Q1 25", "revenue_billions": 26.04, "net_income_billions": 14.88},
            {"period": "Q2 25", "revenue_billions": 30.04, "net_income_billions": 16.60}
        ]
    }
}


def _format_market_cap(val: Optional[float]) -> str:
    if not val:
        return "N/A"
    if val >= 1e12:
        return f"${val / 1e12:.2f}T"
    if val >= 1e9:
        return f"${val / 1e9:.2f}B"
    if val >= 1e6:
        return f"${val / 1e6:.2f}M"
    return f"${val:,.0f}"


def fetch_ticker_metrics(ticker: str) -> Dict[str, Any]:
    """Internal fetcher with yfinance and fallback mechanisms."""
    t_clean = ticker.strip().upper()
    try:
        t = yf.Ticker(t_clean)
        info = t.info
        if info and "currentPrice" in info or "regularMarketPrice" in info:
            price = info.get("currentPrice") or info.get("regularMarketPrice") or 0.0
            mcap = info.get("marketCap") or 0
            pe = info.get("trailingPE") or info.get("forwardPE") or 0.0
            f_pe = info.get("forwardPE") or 0.0
            peg = info.get("pegRatio") or 0.0
            gross_m = (info.get("grossMargins") or 0.0) * 100
            op_m = (info.get("operatingMargins") or 0.0) * 100

            # Revenue trend from quarterly financials
            trend = []
            try:
                qf = t.quarterly_financials
                if qf is not None and not qf.empty and "Total Revenue" in qf.index:
                    revs = qf.loc["Total Revenue"].dropna()
                    for date_col, rev_val in list(revs.items())[:4]:
                        period_str = str(date_col)[:7]
                        trend.append({
                            "period": period_str,
                            "revenue_billions": round(float(rev_val) / 1e9, 2)
                        })
                    trend.reverse()
            except Exception:
                pass

            if not trend and t_clean in FALLBACK_MARKET_DATA:
                trend = FALLBACK_MARKET_DATA[t_clean].get("revenue_trend", [])

            return {
                "ticker": t_clean,
                "company_name": info.get("longName") or info.get("shortName") or t_clean,
                "current_price": round(float(price), 2),
                "market_cap": _format_market_cap(mcap),
                "market_cap_raw": mcap,
                "trailing_pe": round(float(pe), 2) if pe else None,
                "forward_pe": round(float(f_pe), 2) if f_pe else None,
                "peg_ratio": round(float(peg), 2) if peg else None,
                "gross_margin": round(float(gross_m), 1) if gross_m else None,
                "operating_margin": round(float(op_m), 1) if op_m else None,
                "fifty_two_week_high": info.get("fiftyTwoWeekHigh"),
                "fifty_two_week_low": info.get("fiftyTwoWeekLow"),
                "revenue_trend": trend
            }
    except Exception:
        pass

    # Use fallback data if live fetch failed
    if t_clean in FALLBACK_MARKET_DATA:
        data = dict(FALLBACK_MARKET_DATA[t_clean])
        data["ticker"] = t_clean
        return data

    return {
        "ticker": t_clean,
        "company_name": t_clean,
        "current_price": 100.0,
        "market_cap": "N/A",
        "market_cap_raw": 0,
        "trailing_pe": None,
        "forward_pe": None,
        "peg_ratio": None,
        "gross_margin": None,
        "operating_margin": None,
        "fifty_two_week_high": None,
        "fifty_two_week_low": None,
        "revenue_trend": []
    }


@tool
def get_financial_metrics(ticker: str) -> str:
    """
    Fetch comprehensive market metrics, current stock valuation, and historical
    quarterly revenue trends for a public company.

    Args:
        ticker: The stock ticker symbol (e.g. 'AAPL', 'MSFT', 'NVDA', 'TSLA')
    """
    metrics = fetch_ticker_metrics(ticker)
    summary = [
        f"--- Market & Financial Profile: {metrics.get('company_name')} ({metrics.get('ticker')}) ---",
        f"• Current Price: ${metrics.get('current_price')}",
        f"• Market Capitalization: {metrics.get('market_cap')}",
        f"• Trailing P/E: {metrics.get('trailing_pe')} | Forward P/E: {metrics.get('forward_pe')}",
        f"• Gross Margin: {metrics.get('gross_margin')}% | Operating Margin: {metrics.get('operating_margin')}%",
        f"• 52-Week Range: ${metrics.get('fifty_two_week_low')} - ${metrics.get('fifty_two_week_high')}"
    ]

    trend = metrics.get("revenue_trend")
    if trend:
        trend_strs = [f"{q.get('period')}: ${q.get('revenue_billions')}B" for q in trend]
        summary.append(f"• Revenue Trend: {', '.join(trend_strs)}")

    return "\n".join(summary)
