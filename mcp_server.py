"""
mcp_server.py — MCP (Model Context Protocol) server for RAG Knowledge Assistant

Run with: python -m mcp_server
Or: uvicorn mcp_server:app --reload --port 8002
"""

import os
import shutil

from fastapi import FastAPI, UploadFile, File
from fastapi_mcp import FastApiMCP

from ingest import ingest_single_pdf
from vector_store import VectorStore
from rag_pipeline import run_rag
from context_builder import build_sources_summary

DATA_DIR = "data"
INDEX_PATH = os.path.join(DATA_DIR, "index")

os.makedirs(DATA_DIR, exist_ok=True)

vs = VectorStore()

# Load existing index or ingest PDFs
if vs.load(INDEX_PATH):
    print(f"Loaded saved index with {len(vs.chunks)} chunks.")
else:
    existing = [os.path.join(DATA_DIR, f) for f in os.listdir(DATA_DIR) if f.endswith(".pdf")]
    if existing:
        for path in existing:
            print(f"Loading existing PDF: {path}")
            ingest_single_pdf(path, vs)
        print(f"Vector store ready! {len(existing)} PDF(s) loaded.")
    else:
        print("No PDFs found.")

def _save_index() -> None:
    vs.save(INDEX_PATH)
    print(f"Index saved ({len(vs.chunks)} chunks).")

app = FastAPI(
    title="RAG Knowledge Assistant",
    description="MCP server for querying indexed PDF documents",
)

# API Endpoints (automatically become MCP tools)
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and index a PDF file."""
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported."}

    dest = os.path.join(DATA_DIR, file.filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    count = ingest_single_pdf(dest, vs)
    sources = vs.list_sources()
    _save_index()

    return {
        "message": f"Indexed {count} chunks from {file.filename}",
        "filename": file.filename,
        "chunks": count,
        "all_sources": sources,
    }

@app.post("/query")
def query_documents(query: str, source_filter: str | None = None):
    """Query the indexed documents using RAG."""
    if vs.index is None:
        return {"error": "No document indexed yet. Upload a PDF first."}

    answer, results = run_rag(
        query=query,
        vector_store=vs,
        source_filter=source_filter,
    )
    sources = build_sources_summary(results)

    return {
        "query": query,
        "answer": answer,
        "sources": sources,
    }

@app.get("/sources")
def list_sources():
    """List all indexed PDF documents."""
    return {"sources": vs.list_sources()}

@app.delete("/sources/{filename}")
def delete_document(filename: str):
    """Delete an indexed PDF document."""
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        os.remove(path)

    vs.reset()
    remaining = [os.path.join(DATA_DIR, f) for f in os.listdir(DATA_DIR) if f.endswith(".pdf")]
    for p in remaining:
        ingest_single_pdf(p, vs)
    _save_index()

    return {"message": f"Removed {filename}", "remaining_sources": vs.list_sources()}

@app.get("/stats")
def get_stats():
    """Get statistics about the current index."""
    sources = vs.list_sources()
    return {
        "total_chunks": len(vs.chunks),
        "total_sources": len(sources),
        "sources": sources,
    }

# MCP Setup - CORRECTED
mcp = FastApiMCP(
    app,
    name="RAG Knowledge Assistant",
    description="MCP server for querying indexed PDF documents",
)

# Use mount_http() instead of deprecated mount()
mcp.mount_http()

if __name__ == "__main__":
    import uvicorn
    # Use different port to avoid conflicts
    uvicorn.run(app, host="0.0.0.0", port=8002)