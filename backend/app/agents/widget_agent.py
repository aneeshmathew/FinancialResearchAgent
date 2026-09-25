"""
Widget Generator Agent
----------------------
Transforms raw financial figures and SEC risk disclosures into structured JSON blueprints.
These blueprints match the UI Component schemas (Metric Cards, Revenue Charts, Risk Lists)
that the Next.js React frontend consumes and renders on the fly.
"""

from typing import Dict, Any, List
import uuid
from app.agents.state import FinancialState
from app.schemas.widgets import (
    MetricCardWidget, MetricCardItem,
    ChartWidget, ChartSeries,
    RiskItemWidget, WidgetType
)


def widget_agent_node(state: FinancialState) -> Dict[str, Any]:
    """
    Widget Generator Node in LangGraph.
    Synthesizes structured UI components from collected SEC and market data.
    """
    ticker = state.get("ticker", "AAPL").upper()
    company_name = state.get("company_name", ticker)
    metrics = state.get("market_metrics", {})
    sec_context = state.get("sec_context", [])

    generated_widgets: List[Dict[str, Any]] = []

    # 1. Metric Cards Widget (Top-level KPI highlights)
    price = metrics.get("current_price", 0.0)
    mcap = metrics.get("market_cap", "N/A")
    pe = metrics.get("trailing_pe")
    gross_m = metrics.get("gross_margin")
    op_m = metrics.get("operating_margin")

    card_items = [
        MetricCardItem(
            label="Stock Price",
            value=f"${price:.2f}" if price else "N/A",
            change_direction="neutral",
            subtext=f"Ticker: {ticker}"
        ),
        MetricCardItem(
            label="Market Capitalization",
            value=str(mcap),
            subtext="Total Valuation"
        ),
        MetricCardItem(
            label="P/E Ratio (TTM)",
            value=f"{pe:.1f}x" if pe else "N/A",
            subtext="Valuation Multiple"
        ),
        MetricCardItem(
            label="Gross Margin",
            value=f"{gross_m:.1f}%" if gross_m is not None else "N/A",
            change_direction="positive" if gross_m and gross_m > 40 else "neutral",
            subtext="Profitability"
        )
    ]

    metric_widget = MetricCardWidget(
        id=f"kpi-metrics-{ticker.lower()}",
        title=f"{company_name} — Key Financial Multiples",
        metrics=card_items
    )
    generated_widgets.append(metric_widget.model_dump())

    # 2. Revenue Trend Chart Widget (if quarterly revenue data exists)
    rev_trend = metrics.get("revenue_trend", [])
    if rev_trend:
        chart_series = [
            ChartSeries(key="revenue_billions", name="Revenue ($B)", color="#3b82f6")
        ]
        has_net_inc = any("net_income_billions" in p for p in rev_trend)
        if has_net_inc:
            chart_series.append(
                ChartSeries(key="net_income_billions", name="Net Income ($B)", color="#10b981")
            )

        chart_widget = ChartWidget(
            id=f"revenue-trend-{ticker.lower()}",
            title=f"{company_name} Quarterly Revenue Progression",
            description="Historical quarterly revenue (and net income where available) in billions USD",
            chart_kind="bar" if len(rev_trend) <= 4 else "line",
            x_axis_key="period",
            series=chart_series,
            data=rev_trend
        )
        generated_widgets.append(chart_widget.model_dump())

    # 3. SEC Risk Item Widgets
    for idx, doc in enumerate(sec_context[:2]):
        headline = doc.get("section", f"SEC Disclosure Risk #{idx+1}")
        text_excerpt = doc.get("text", "")
        # Extract a short summary sentence
        first_sentence = text_excerpt.split(". ")[0] + "." if text_excerpt else "Official filing risk factor."

        risk_widget = RiskItemWidget(
            id=f"risk-{ticker.lower()}-{idx+1}",
            category="Regulatory / Operational",
            severity="high" if "antitrust" in text_excerpt.lower() or "bottleneck" in text_excerpt.lower() else "medium",
            headline=headline,
            filing_reference=f"SEC Form {doc.get('filing_type', '10-K')} (FY{doc.get('fiscal_year', 2024)})",
            summary=first_sentence
        )
        generated_widgets.append(risk_widget.model_dump())

    log_entry = {
        "agent": "widget_agent",
        "type": "tool_call",
        "content": (
            f"Widget Generator Agent: Created {len(generated_widgets)} UI widget blueprints "
            f"(KPI Metric Cards, Revenue Trend Chart, and SEC Risk Disclosures)."
        ),
        "details": {"widgets_count": len(generated_widgets)}
    }

    return {
        "ui_widgets": generated_widgets,
        "current_step": "synthesizer",
        "next_agent": "synthesizer",
        "agent_logs": [log_entry]
    }
