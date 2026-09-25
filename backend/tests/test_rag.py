"""
Unit tests for Qdrant Vector Store and SEC Ingestion
"""

import pytest
from app.rag.vector_store import SECVectorStore
from app.rag.sec_ingestion import seed_vector_store, prepare_chunks, SEED_SEC_DISCLOSURES


def test_vector_store_initialization_and_seeding():
    # Initialize in-memory Qdrant store
    store = SECVectorStore()
    assert store.collection_name == "sec_filings"

    # Seed with sample data
    indexed_count = seed_vector_store(store)
    assert indexed_count > 0, "Expected at least one chunk to be indexed"


def test_sec_hybrid_search():
    store = SECVectorStore()
    seed_vector_store(store)

    # Search for Apple supply chain risks
    results = store.search(
        query="What are the main supply chain risks in East Asia?",
        ticker="AAPL",
        limit=3
    )

    assert len(results) > 0, "Should return at least 1 search result"
    top_result = results[0]
    assert top_result["ticker"] == "AAPL"
    assert "supply chain" in top_result["text"].lower() or "supplier" in top_result["text"].lower()


def test_sec_hybrid_search_filter_ticker():
    store = SECVectorStore()
    seed_vector_store(store)

    # Search specifically for NVIDIA GPU compute
    results = store.search(
        query="Blackwell architecture GPU wafer fabrication",
        ticker="NVDA",
        limit=2
    )

    assert len(results) > 0
    assert results[0]["ticker"] == "NVDA"
    assert "tsmc" in results[0]["text"].lower() or "hopper" in results[0]["text"].lower() or "blackwell" in results[0]["text"].lower()
