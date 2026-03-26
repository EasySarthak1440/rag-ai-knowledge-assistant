"""
context_builder.py — Build LLM context from retrieved chunks

Each chunk is prefixed with its source + page so the LLM can:
  1. Ground its answer to specific documents.
  2. Optionally cite the source in its response.
"""


def build_context(results: list[dict], max_chars: int = 4000) -> str:
    """
    Concatenate top retrieved chunks into a single context string.

    Args:
        results:   Output of VectorStore.search() — list of result dicts.
        max_chars: Hard cap to avoid exceeding LLM context window.

    Returns:
        A formatted string ready to be injected into the prompt.
    """
    context_parts = []
    total = 0

    for i, r in enumerate(results, 1):
        header = f"[Source: {r['source']} | Page {r['page']}]"
        block = f"{header}\n{r['chunk']}"

        if total + len(block) > max_chars:
            break

        context_parts.append(block)
        total += len(block)

    return "\n\n---\n\n".join(context_parts)


def build_sources_summary(results: list[dict]) -> list[dict]:
    """
    Return a deduplicated list of source references for UI display.

    Returns:
        [ { "source": str, "pages": [int, ...] }, ... ]
    """
    seen: dict[str, set] = {}
    for r in results:
        src = r.get("source", "unknown")
        page = r.get("page", 0)
        seen.setdefault(src, set()).add(page)

    return [
        {"source": src, "pages": sorted(pages)}
        for src, pages in seen.items()
    ]
