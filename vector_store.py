"""
vector_store.py — FAISS-backed vector store with metadata support

Key change from v1:
    Alongside the FAISS index we maintain a parallel Python list
    `self.metadata` so every chunk can carry { source, page, chunk_id }.
    This is the simplest approach that requires zero extra dependencies.

v2:
    - Added save/load methods for persistent index across restarts
"""

import os
import pickle

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
    
    def delete_source(self, source: str) -> int:
        """
        Remove all chunks from a PDF and rebuild the index without re-encoding.

        Args:
            source: filename to remove (matches metadata['source'])
        Returns:
            number of chunks removed
        """
        if not self.chunks:
            return 0

        keep = [i for i, m in enumerate(self.metadata) if m.get("source") != source]
        removed = len(self.chunks) - len(keep)

        if removed == 0:
            return 0

        # reconstruct stored vectors — avoids slow re-encoding
        kept_vecs = np.array(
            [self.index.reconstruct(i) for i in keep], dtype="float32"
        ) if keep else None

        self.chunks   = [self.chunks[i]   for i in keep]
        self.metadata = [self.metadata[i] for i in keep]

        if kept_vecs is not None and len(kept_vecs) > 0:
            dim = kept_vecs.shape[1]
            self.index = faiss.IndexFlatIP(dim)
            self.index.add(kept_vecs)
        else:
            self.index = None  # index is now empty

        return removed

    def list_sources(self) -> list[str]:
        """Return sorted unique list of all indexed PDF filenames."""
        return sorted({m.get("source", "unknown") for m in self.metadata})

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str = "data/index") -> None:
        """
        Save FAISS index and metadata to disk.

        Args:
            path: Base path (will create .index and .meta files)
        """
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)

        if self.index is not None:
            faiss.write_index(self.index, f"{path}.index")

        with open(f"{path}.meta", "wb") as f:
            pickle.dump({"chunks": self.chunks, "metadata": self.metadata}, f)

    def load(self, path: str = "data/index") -> bool:
        """
        Load FAISS index and metadata from disk.

        Args:
            path: Base path (will look for .index and .meta files)

        Returns:
            True if loaded successfully, False if no saved index exists.
        """
        index_path = f"{path}.index"
        meta_path = f"{path}.meta"

        if not os.path.exists(index_path) or not os.path.exists(meta_path):
            return False

        self.index = faiss.read_index(index_path)

        with open(meta_path, "rb") as f:
            data = pickle.load(f)
            self.chunks = data["chunks"]
            self.metadata = data["metadata"]

        return True

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _encode(self, texts: list[str]) -> np.ndarray:
        embeddings = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings.astype("float32")
