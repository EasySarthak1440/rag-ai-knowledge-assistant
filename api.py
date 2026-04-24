from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ingest import ingest_single_pdf
from vector_store import VectorStore
from rag_pipeline import run_rag
from context_builder import build_sources_summary
import os
import shutil

app = FastAPI()

# Allow React (localhost:3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vs = VectorStore()
DATA_DIR = "data"
INDEX_PATH = os.path.join(DATA_DIR, "index")
os.makedirs(DATA_DIR, exist_ok=True)

# Try loading saved index, otherwise fall back to PDF ingestion
if vs.load(INDEX_PATH):
    print(f"Loaded saved index with {len(vs.chunks)} chunks.")
else:
    print("No saved index found. Loading PDFs...")
    existing = [os.path.join(DATA_DIR, f) for f in os.listdir(DATA_DIR) if f.endswith(".pdf")]
    if existing:
        for path in existing:
            print(f"Loading existing PDF: {path}")
            ingest_single_pdf(path, vs)
        print(f"Vector store ready! {len(existing)} PDF(s) loaded.")
    else:
        print("No PDFs found — upload one via the UI.")


def _save_index() -> None:
    """Save the vector store index to disk."""
    vs.save(INDEX_PATH)
    print(f"Index saved ({len(vs.chunks)} chunks).")


# ── Upload endpoint ────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
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


# ── Query endpoint ─────────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str
    source_filter: str | None = None

@app.post("/query")
def query_endpoint(request: QueryRequest):
    if vs.index is None:
        return {"error": "No document indexed yet. Upload a PDF first."}

    answer, results = run_rag(
        query=request.query,
        vector_store=vs,
        source_filter=request.source_filter,
    )
    sources = build_sources_summary(results)

    return {
        "query": request.query,
        "answer": answer,
        "sources": sources,
    }


# ── List sources endpoint ──────────────────────────────────────────────────────
@app.get("/sources")
def list_sources():
    return {"sources": vs.list_sources()}


# ── Delete a PDF ───────────────────────────────────────────────────────────────
# api.py — replace the delete endpoint with this
@app.delete("/sources/{filename}")
def delete_source(filename: str):
    removed = vs.delete_source(filename)       # fast: reconstructs vectors, no re-encoding
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        os.remove(path)
    _save_index()
    return {"message": f"Removed {filename}", "removed_chunks": removed, "remaining_sources": vs.list_sources()}