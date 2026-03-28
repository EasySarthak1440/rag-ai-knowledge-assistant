# 🧠 RAG AI Knowledge Assistant

> Production-grade Retrieval-Augmented Generation system — multi-PDF, source-cited, hallucination-free.

A full-stack RAG application with a **futuristic React UI** and a **FastAPI backend**, built on a clean 12-module Python pipeline. Upload multiple PDFs, ask questions in natural language, and get grounded answers with exact source + page citations.

---

## ✨ Features

### 🤖 RAG Pipeline
- 📄 Multi-PDF ingestion with per-chunk `source` + `page` metadata
- 🧹 Text cleaning + smart sentence-aware chunking
- 🔎 Semantic search via **Sentence Transformers + FAISS**
- 🎯 Query rewriting + cross-encoder re-ranking (`ms-marco-MiniLM`)
- 🤖 Answer generation via **Groq LLaMA-4 Maverick** — grounded only to context
- 📌 Source + page citations returned with every answer

### 🖥️ React UI (Primary)
- Futuristic dark-mode interface with glassmorphism design
- Real-time PDF upload with drag-and-drop + indexing progress bar
- Per-source filter — restrict answers to a specific document
- Collapsible **"How this was generated"** reasoning panel
- Source cards panel showing filename + pages used
- Session memory panel, command palette (`⌘K`), voice input animation
- Toast notifications for upload/delete success and errors

### ⚙️ FastAPI Backend
- `POST /upload` — upload and index a PDF
- `POST /query` — query with optional per-source filter
- `GET /sources` — list all indexed documents
- `DELETE /sources/{filename}` — remove a PDF and rebuild the index
- CORS configured for React frontend at `localhost:3000`

---

## 📁 Folder Structure

```
rag-ai-knowledge-assistant/
│
├── api.py                 # FastAPI backend (port 8000)
├── app.py                 # Streamlit UI (legacy, port 8501)
│
├── ingest.py              # Multi-PDF ingestion with metadata
├── pdf_loader.py          # Page-wise text extraction + source tagging
├── cleaner.py             # Text cleaning utilities
├── chunker.py             # Smart sentence-based chunking
├── vector_store.py        # FAISS vector DB with parallel metadata store
├── smart_retriever.py     # Query rewrite → FAISS search → rerank
├── reranker.py            # Cross-encoder re-ranking
├── filter.py              # Source-level filtering
├── context_builder.py     # Context string + source summary builder
├── prompt.py              # System + user prompt templates
├── llm.py                 # Groq LLM wrapper
├── rag_pipeline.py        # End-to-end RAG orchestration
├── query_rewrite.py       # Query rewriting logic
│
├── data/
│   └── *.pdf              # Uploaded PDFs (runtime only, gitignored)
│
├── frontend/              # React UI
│   ├── src/
│   │   ├── App.js
│   │   └── RAGInterface.jsx   # Full UI component
│   └── package.json
│
├── requirements.txt
└── README.md
```

---

## ⚙️ Tech Stack

| Layer       | Tool                                  |
|-------------|---------------------------------------|
| UI          | React + lucide-react                  |
| Backend     | FastAPI + Uvicorn                     |
| Embeddings  | `sentence-transformers/all-MiniLM-L6-v2` |
| Vector DB   | FAISS (in-memory)                     |
| Reranker    | `cross-encoder/ms-marco-MiniLM-L-6-v2` |
| LLM         | Groq — LLaMA-4 Maverick               |
| PDF Parsing | PyPDF                                 |
| Legacy UI   | Streamlit                             |

---

## 🚀 How It Works

```
PDF Upload
    │
    ▼
pdf_loader.py  →  page text + {source, page} metadata
    │
    ▼
cleaner.py     →  normalized text
    │
    ▼
chunker.py     →  sentence-aware chunks (smart_chunk)
    │
    ▼
vector_store.py →  FAISS index + parallel metadata list
    │
    ▼
User Query
    │
    ├── query_rewrite.py   →  semantically clearer query
    ├── vector_store.search →  top-K FAISS results (+ optional source filter)
    ├── reranker.py        →  cross-encoder reranked top-N
    └── context_builder.py →  context string with [Source | Page] headers
            │
            ▼
        prompt.py  →  grounded prompt
            │
            ▼
        llm.py     →  Groq LLaMA-4 answer
            │
            ▼
    Answer + Source Citations
```

---

## ▶️ Running the App

### 1. Clone & Install

```bash
git clone https://github.com/EasySarthak1440/rag-ai-knowledge-assistant.git
cd rag-ai-knowledge-assistant
pip install -r requirements.txt
pip install python-multipart   # required for FastAPI file uploads
```

### 2. Set Groq API Key

**Linux / macOS**
```bash
export GROQ_API_KEY="your_api_key_here"
```

**Windows (PowerShell)**
```powershell
setx GROQ_API_KEY "your_api_key_here"
```

### 3. Start the FastAPI Backend

```bash
uvicorn api:app --reload --port 8000
```

### 4. Start the React Frontend

```bash
cd frontend
npm install
npm start
```

Opens at `http://localhost:3000`

### Alternative: Streamlit UI (legacy)

```bash
streamlit run app.py
```

---

## 🖥️ UI Walkthrough

| Area | What it does |
|---|---|
| Right panel → Docs tab | Drag-and-drop or click to upload PDFs. Shows indexing progress. |
| Left sidebar → Filter Source | Restrict answers to one specific PDF |
| Chat input → Upload icon | Quick upload without opening the docs panel |
| AI response | Grounded answer with confidence indicator |
| "How this was generated" | Expandable reasoning chain (query rewrite → retrieve → rerank → answer) |
| Right panel → Sources tab | Cards showing filename + page numbers used in the last answer |
| Right panel → Memory tab | Session context the assistant is aware of |
| `⌘K` / `Ctrl+K` | Command palette — upload, new chat, view memory |

---

## 🔌 API Reference

```
POST /upload
  Body: multipart/form-data { file: <PDF> }
  Returns: { filename, chunks, all_sources }

POST /query
  Body: { query: string, source_filter?: string }
  Returns: { answer, sources: [{ source, pages }] }

GET /sources
  Returns: { sources: [filename, ...] }

DELETE /sources/{filename}
  Returns: { message, remaining_sources }
```

---

## ✅ What This Project Demonstrates

- Production RAG architecture — not a tutorial clone
- Clean separation of concerns across 12+ single-responsibility modules
- Metadata-aware vector store — every chunk knows its source and page
- Full-stack integration: React → FastAPI → Python ML pipeline
- LLM grounding and hallucination control
- Per-source filtering for multi-document knowledge bases
- Real-world API design with file upload, CRUD, and CORS

---

## 📌 Roadmap

- [ ] Persistent FAISS index (survive restarts)
- [ ] Hybrid search — BM25 + semantic (better recall on exact terms)
- [ ] Inline source citation highlighting inside answer text
- [ ] Dockerization (single `docker-compose up`)
- [ ] Multi-user support with isolated indexes

---

## 👨‍💻 Author

**Sarthak** — AI & Data Science Engineer  
Built with focus on clarity, correctness, and real-world architecture.