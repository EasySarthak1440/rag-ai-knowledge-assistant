# RAG AI Knowledge Assistant

Multi-PDF RAG system: Python backend (FastAPI + FAISS + Groq) + React frontend + MCP server.

## Quick Start

```bash
# Terminal 1: Backend (port 8000)
cd rag-ai-knowledge-assistant && uvicorn api:app --reload --port 8000

# Terminal 2: MCP server (port 8002)
cd rag-ai-knowledge-assistant && python -m mcp_server

# Terminal 3: Frontend (port 3000)
cd rag-ai-knowledge-assistant/frontend && npm start
```

## Required Setup

```bash
pip install -r requirements.txt
export GROQ_API_KEY="your_key"  # Linux/macOS
```

## Project Structure

```
rag-ai-knowledge-assistant/
├── api.py              # Main FastAPI (port 8000)
├── mcp_server.py      # MCP server (port 8002)
├── vector_store.py    # FAISS index + metadata
├── rag_pipeline.py    # RAG orchestration
├── ingest.py          # PDF → chunks
├── smart_retriever.py # Query → search → rerank
├── llm.py             # Groq client
├── chunker.py         # NLTK sentence chunking
├── data/              # PDFs + saved index (gitignored)
└── frontend/          # React UI
```

## Key Details

- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **LLM**: Groq `llama-3.3-70b-versatile`
- **Index**: FAISS inner product, saved to `data/index.index`
- **API base**: `http://localhost:8000`
- **MCP endpoint**: `http://localhost:8002/mcp`

## Notes

- No formal lint/test for Python—manual testing via UI
- NLTK `punkt` downloaded automatically on first import
- `data/` folder gitignored—contains runtime PDFs and index