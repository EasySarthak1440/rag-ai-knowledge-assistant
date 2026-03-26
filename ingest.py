"""
ingest.py — PDF ingestion pipeline (multi-PDF capable)

Flow:
    PDF paths → load pages → clean → chunk → embed → FAISS index

Each chunk carries metadata: { source, page, chunk_id }
so the UI can show exactly which document + page an answer came from.
"""

from pdf_loader import load_pdfs
from cleaner import clean_text
from chunker import smart_chunk
from vector_store import VectorStore


def ingest_pdfs(file_paths: list[str], vector_store: VectorStore) -> int:
    """
    Ingest one or more PDFs into the vector store.

    Args:
        file_paths:   List of absolute paths to PDF files.
        vector_store: An initialised VectorStore instance.

    Returns:
        Total number of chunks indexed.
    """
    all_chunks = []
    all_metadata = []

    pages = load_pdfs(file_paths)                     # [{text, source, page}, ...]

    for page in pages:
        cleaned = clean_text(page["text"])
        chunks = smart_chunk(cleaned)                  # list[str]

        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            all_metadata.append({
                "source": page["source"],
                "page":   page["page"],
                "chunk_id": f"{page['source']}_p{page['page']}_c{i}",
            })

    vector_store.add(all_chunks, all_metadata)
    return len(all_chunks)


def ingest_single_pdf(file_path: str, vector_store: VectorStore) -> int:
    """Convenience wrapper for a single PDF."""
    return ingest_pdfs([file_path], vector_store)
