"""
vector_store.py — FAISS-backed vector store with metadata support

Key change from v1:
    Alongside the FAISS index we maintain a parallel Python list
    `self.metadata` so every chunk can carry { source, page, chunk_id }.
    This is the simplest approach that requires zero extra dependencies.
"""

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer


EMBED_MODEL = "all-MiniLM-L6-v2"


class VectorStore:
    def __init__(self):
        self.model = SentenceTransformer(EMBED_MODEL)
        self.index = None          # faiss.IndexFlatIP
        self.chunks: list[str] = []
        self.metadata: list[dict] = []   # parallel to self.chunks

    # ------------------------------------------------------------------
    # Ingestion
    # ------------------------------------------------------------------

    def add(self, chunks: list[str], metadata: list[dict] | None = None) -> None:
        """
        Encode chunks and add them to the FAISS index.

        Args:
            chunks:   List of text strings to index.
            metadata: Parallel list of dicts ({ source, page, chunk_id }).
                      Pass None to skip metadata (backwards-compatible).
        """
        if not chunks:
            return

        if metadata is None:
            metadata = [{}] * len(chunks)

        embeddings = self._encode(chunks)

        if self.index is None:
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dim)   # inner-product = cosine on L2-normed vecs

        self.index.add(embeddings)
        self.chunks.extend(chunks)
        self.metadata.extend(metadata)

    def reset(self) -> None:
        """Clear the entire index (use when re-ingesting all PDFs)."""
        self.index = None
        self.chunks = []
        self.metadata = []

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    def search(
        self,
        query: str,
        top_k: int = 5,
        source_filter: str | None = None,
    ) -> list[dict]:
        """
        Semantic search over indexed chunks.

        Args:
            query:         Natural-language query string.
            top_k:         Number of results to return.
            source_filter: If set, restrict results to this PDF filename.

        Returns:
            List of result dicts:
                { "chunk": str, "score": float, "source": str, "page": int, "chunk_id": str }
        """
        if self.index is None or not self.chunks:
            return []

        query_vec = self._encode([query])
        # Over-fetch so we can filter and still return top_k
        fetch_k = top_k * 5 if source_filter else top_k
        fetch_k = min(fetch_k, len(self.chunks))

        scores, indices = self.index.search(query_vec, fetch_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            meta = self.metadata[idx]
            if source_filter and meta.get("source") != source_filter:
                continue
            results.append({
                "chunk":    self.chunks[idx],
                "score":    float(score),
                "source":   meta.get("source", "unknown"),
                "page":     meta.get("page", 0),
                "chunk_id": meta.get("chunk_id", str(idx)),
            })
            if len(results) == top_k:
                break

        return results

    def list_sources(self) -> list[str]:
        """Return sorted unique list of all indexed PDF filenames."""
        return sorted({m.get("source", "unknown") for m in self.metadata})

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _encode(self, texts: list[str]) -> np.ndarray:
        embeddings = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings.astype("float32")
