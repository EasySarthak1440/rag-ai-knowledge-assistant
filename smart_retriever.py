"""
smart_retriever.py — Query rewrite → retrieve → filter → rerank

Changes from v1:
  • source_filter is threaded through to VectorStore.search()
  • Result dicts now carry full metadata (source, page, chunk_id)
"""

from query_rewrite import rewrite_query
from vector_store import VectorStore
from reranker import rerank


def retrieve(
    query: str,
    vector_store: VectorStore,
    top_k: int = 5,
    source_filter: str | None = None,
) -> list[dict]:
    """
    Full smart retrieval pipeline.

    Steps:
        1. Rewrite the query for better semantic matching.
        2. FAISS vector search (optionally filtered by source PDF).
        3. Cross-encoder reranking.

    Returns:
        Top-k result dicts: { chunk, score, source, page, chunk_id }
    """
    # Step 1 — Query rewriting
    rewritten = rewrite_query(query)

    # Step 2 — Vector search (over-fetch for reranker headroom)
    candidates = vector_store.search(
        query=rewritten,
        top_k=top_k * 3,
        source_filter=source_filter,
    )

    if not candidates:
        return []

    # Step 3 — Rerank and return top_k
    adapted = [{"text": r["chunk"], **r} for r in candidates]
    reranked = rerank(query=rewritten, chunks=adapted, top_n=top_k)
    return reranked
