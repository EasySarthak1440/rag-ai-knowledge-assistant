# 📚 RAG AI Knowledge Assistant (Streamlit)


---

## ✨ Key Features

- 📄 Upload **any PDF** at runtime
- 🧹 Text cleaning + smart sentence‑aware chunking
- 🔎 Semantic search using **Sentence Transformers + FAISS**
- 🎯 Query rewriting, filtering & cross‑encoder re‑ranking
- 🤖 Answer generation using **Groq LLaMA‑4**
- 🖥️ Simple **Streamlit UI** for demos & interviews

---

## 🧠 Core Design Principle

> **Nothing runs by default.**  
> The RAG pipeline executes **only after a PDF is uploaded**.

This avoids accidental indexing, ghost data, and interview red flags.

---

## 📁 Folder Structure

```
rag_project/practise/
│
├── app.py                 # Streamlit UI (entry point)
├── ingest.py              # PDF ingestion logic (pure function)
├── pdf_loader.py          # Load text from PDFs
├── cleaner.py             # Text cleaning utilities
├── chunker.py             # Smart sentence-based chunking
├── vector_store.py        # FAISS vector database
├── smart_retriever.py     # Query rewrite → filter → rerank
├── reranker.py            # Cross-encoder re-ranking
├── context_builder.py     # Context construction for LLM
├── prompt.py              # System + user prompt template
├── llm.py                 # Groq LLM wrapper
├── rag_pipeline.py        # End-to-end RAG orchestration
├── data/
│   └── uploaded.pdf       # Uploaded PDF (runtime only)
└── README.md
```

---

## ⚙️ Tech Stack

| Component | Tool |
|---------|------|
| UI | Streamlit |
| Embeddings | `all-MiniLM-L6-v2` |
| Vector DB | FAISS |
| Reranker | `ms-marco-MiniLM` CrossEncoder |
| LLM | Groq – LLaMA‑4 Maverick |
| PDF Parsing | PyPDF |

---

## 🚀 How It Works (Flow)

1. **Upload PDF** via Streamlit
2. Text extracted page‑wise
3. Cleaned & sentence‑aware chunking
4. Embeddings generated & indexed in FAISS
5. User query → rewritten → retrieved → reranked
6. Context built from top chunks
7. LLM answers **only from context**

---

## ▶️ Run the App

```bash
streamlit run app.py
```

Then:
1. Upload a PDF
2. Ask questions related **only to that document**

---

## 🔐 Environment Setup

Set your Groq API key:

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

- Real‑world RAG architecture (not a tutorial clone)
- Strong separation of concerns
- LLM grounding & hallucination control
- Practical Streamlit deployment

---

## 📌 Future Enhancements

- Persistent FAISS index
- Multi‑PDF support
- Source citation highlighting
- Dockerization

---

## 👨‍💻 Author

Built with focus on **clarity, correctness**.


