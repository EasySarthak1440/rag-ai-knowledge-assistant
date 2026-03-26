# 🧠 RAG AI Knowledge Assistant (Streamlit)

A production-style Retrieval-Augmented Generation (RAG) system built with a clean modular architecture. Upload multiple PDFs, ask questions, and get grounded answers with source citations — no hallucinations.

---

## ✨ Key Features

- 📄 Upload **multiple PDFs** at runtime via sidebar
- 🗑️ Remove individual PDFs from the index without restarting
- 🔍 Filter questions to a **specific PDF** or query across all
- 📌 **Source + page citations** shown under every answer
- 🧹 Text cleaning + smart sentence-aware chunking
- 🔎 Semantic search using **Sentence Transformers + FAISS**
- 🎯 Query rewriting, filtering & cross-encoder re-ranking
- 🤖 Answer generation using **Groq LLaMA-4**
- 🖥️ Clean **Streamlit UI** for demos & interviews

---

## 📁 Folder Structure

```
rag-ai-knowledge-assistant/
│
├── app.py                 # Streamlit UI (entry point)
├── ingest.py              # Multi-PDF ingestion with metadata
├── pdf_loader.py          # Load text + metadata from PDFs
├── cleaner.py             # Text cleaning utilities
├── chunker.py             # Smart sentence-based chunking
├── vector_store.py        # FAISS vector DB with metadata support
├── smart_retriever.py     # Query rewrite → filter → rerank
├── reranker.py            # Cross-encoder re-ranking
├── context_builder.py     # Context + source summary for LLM
├── prompt.py              # System + user prompt template
├── llm.py                 # Groq LLM wrapper
├── rag_pipeline.py        # End-to-end RAG orchestration
├── data/
│   └── *.pdf              # Uploaded PDFs (runtime only)
└── README.md
```

---

## ⚙️ Tech Stack

| Component   | Tool                              |
|-------------|-----------------------------------|
| UI          | Streamlit                         |
| Embeddings  | `all-MiniLM-L6-v2`                |
| Vector DB   | FAISS                             |
| Reranker    | `ms-marco-MiniLM` CrossEncoder    |
| LLM         | Groq – LLaMA-4 Maverick           |
| PDF Parsing | PyPDF                             |

---

## 🚀 How It Works (Flow)

1. **Upload PDFs** via the sidebar (one or many)
2. Text extracted page-wise with `source` + `page` metadata attached
3. Cleaned & chunked using sentence-aware splitting
4. Embeddings generated & indexed in FAISS (metadata stored in parallel)
5. User query → rewritten → semantically retrieved → cross-encoder reranked
6. Context built from top chunks (each tagged with source + page)
7. LLM answers **only from context** — no hallucination
8. Answer displayed with **📌 source citations** (filename + page numbers)

---

## 🖥️ UI Walkthrough

### Sidebar — PDF Manager
- Upload one or multiple PDFs at once
- See all indexed documents listed
- 🗑️ Remove a single PDF (index rebuilds automatically)
- 🧹 Clear all PDFs and reset the session
- Filter answers to a specific PDF using the **"Answer from"** dropdown

### Main Chat Area
- Type any question about your uploaded documents
- Answer appears with a collapsible **"📌 Sources used"** section
- Each source shows the filename and exact page numbers referenced

---

## ▶️ Run the App

```bash
streamlit run app.py
```

Then:
1. Upload one or more PDFs from the sidebar
2. Ask questions — answers are grounded strictly to your documents
3. Expand **"📌 Sources used"** to see exactly which PDF + page was referenced

---

## 🔐 Environment Setup

Set your Groq API key before running:

**Windows (PowerShell)**
```powershell
setx GROQ_API_KEY "your_api_key_here"
```

**Linux / macOS**
```bash
export GROQ_API_KEY="your_api_key_here"
```

---

## ✅ What This Project Demonstrates

- Real-world RAG architecture (not a tutorial clone)
- Strong separation of concerns across 12+ modules
- Metadata-aware retrieval — every chunk knows its source & page
- LLM grounding & hallucination control
- Multi-document indexing with per-source filtering
- Practical Streamlit deployment with session state management

---

## 📌 Future Enhancements

- Persistent FAISS index (survive app restarts)
- Source citation highlighting inside the answer text
- Dockerization
- Multi-user support

---

## 👨‍💻 Author

Built with focus on **clarity, correctness, and real-world architecture**.