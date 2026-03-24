from fastapi import FastAPI
from pydantic import BaseModel
from ingest import ingest_pdf
from vector_store import VectorStore
from rag_pipeline import rag_answer
import os

app = FastAPI()

vs = VectorStore()

PDF_PATH = "data/uploaded.pdf"

if os.path.exists(PDF_PATH):
    print(f"Loading existing PDF: {PDF_PATH}")
    chunks = ingest_pdf(PDF_PATH)
    vs.build(chunks)
    print("Vector store ready!")
else:
    print("⚠️  No PDF found — upload one via Streamlit first.")

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
def query_endpoint(request: QueryRequest):
    if vs.index is None:
        return {"error": "No document indexed yet. Upload a PDF via Streamlit first."}
    answer = rag_answer(request.query, vs)
    return {"query": request.query, "answer": answer}