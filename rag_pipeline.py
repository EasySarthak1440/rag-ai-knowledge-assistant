"""
rag_pipeline.py — End-to-end RAG orchestration (multi-PDF aware)

Changes from v1:
  • Accepts optional source_filter to restrict retrieval to one PDF.
  • Returns (answer, results) so the UI can display source citations.
"""

from vector_store import VectorStore
from smart_retriever import retrieve
from context_builder import build_context
from prompt import build_prompt
from llm import generate_answer


def run_rag(
    query: str,
    vector_store: VectorStore,
    top_k: int = 5,
    source_filter: str | None = None,
) -> tuple[str, list[dict]]:
    """
    Run the full RAG pipeline for a user query.

    Args:
        query:         The user's question.
        vector_store:  Populated VectorStore instance.
        top_k:         Number of chunks to retrieve before reranking.
        source_filter: If set, only retrieve from this PDF filename.

    Returns:
        (answer_str, results_list)
        results_list carries { chunk, score, source, page, chunk_id }
        for the UI to display as source citations.
    """
    # 1. Retrieve + rerank
    results = retrieve(
        query=query,
        vector_store=vector_store,
        top_k=top_k,
        source_filter=source_filter,
    )

    if not results:
        return (
            "I couldn't find relevant information in the uploaded documents. "
            "Please try rephrasing your question or upload a relevant PDF.",
            [],
        )

    # 2. Build context string
    context = build_context(results)

    # 3. Build prompt
    prompt = build_prompt(context=context, question=query)

    # 4. Call LLM
    answer = generate_answer(prompt)

    return answer, results
