"""
SEC Disclosure Search Tool
--------------------------
Tool used by the SEC Filing Search Agent to retrieve verified disclosures,
risk factors, and management commentary from official 10-K and 10-Q reports.
"""

from typing import Optional, Dict, Any, List
from langchain_core.tools import tool
from app.rag.vector_store import SECVectorStore
from app.rag.sec_ingestion import seed_vector_store

# Shared vector store instance for tools
_vector_store: Optional[SECVectorStore] = None


def get_shared_vector_store() -> SECVectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = SECVectorStore()
        # Seed with initial high-fidelity disclosures
        seed_vector_store(_vector_store)
    return _vector_store


@tool
def search_sec_filings(
    query: str,
    ticker: Optional[str] = None,
    filing_type: Optional[str] = None
) -> str:
    """
    Search official SEC EDGAR disclosures (10-K and 10-Q filings) for a given company.
    Use this tool to find:
    - Official risk factors (Item 1A)
    - Management discussion & analysis of financial results (Item 7)
    - Legal proceedings and regulatory risks
    
    Args:
        query: What topic or risk to search for (e.g. 'supply chain China risk', 'cloud revenue growth')
        ticker: Optional company stock ticker symbol (e.g. 'AAPL', 'MSFT', 'NVDA', 'TSLA')
        filing_type: Optional filter, e.g. '10-K' (annual) or '10-Q' (quarterly)
    """
    store = get_shared_vector_store()
    results = store.search(
        query=query,
        ticker=ticker,
        filing_type=filing_type,
        limit=4
    )

    if not results:
        return f"No SEC disclosure passages found matching query '{query}' for ticker '{ticker}'."

    formatted = []
    for r in results:
        citation = f"[{r.get('ticker')} {r.get('filing_type', '10-K')} FY{r.get('fiscal_year', 2024)} | {r.get('section', 'General')}]"
        formatted.append(f"{citation}\n{r.get('text')}\n(Relevance Score: {r.get('score', 0):.2f})")

    return "\n\n---\n\n".join(formatted)
