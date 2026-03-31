# AGENTS.md - Development Guide for AI Agents

A multi-PDF RAG (Retrieval Augmented Generation) system with Python backend (FastAPI, FAISS, Groq LLM) and React frontend, with MCP (Model Context Protocol) support for AI agents.

## Build / Lint / Test Commands

### Python Backend

```bash
# Run FastAPI backend (main API for React frontend)
uvicorn api:app --reload --port 8000

# Run MCP server (for AI agent integration)
python -m mcp_server
# or: uvicorn mcp_server:app --reload --port 8002
```

No formal linting/testing configured. Manual testing via UI.

### React Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm start

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npm test -- --testPathPattern=App.test.js

# Run tests in watch mode (interactive)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Running the Full Stack

```bash
# Terminal 1: Start FastAPI backend (main API)
uvicorn api:app --reload --port 8000

# Terminal 2: Start MCP server (for AI agents)
python -m mcp_server

# Terminal 3: Start React frontend
cd frontend && npm start
```

## MCP (Model Context Protocol) Server

The MCP server exposes the RAG functionality as tools that AI assistants (Claude Desktop, Cursor, etc.) can use directly.

**Available MCP Tools:**
- `upload_pdf` - Upload and index a PDF file
- `query_documents` - Ask questions about documents
- `list_sources` - List all indexed PDF documents
- `delete_document` - Remove an indexed PDF document
- `get_stats` - Get index statistics (chunk count, source count)

**MCP Server Endpoints:**
- MCP endpoint: `http://localhost:8002/mcp` (for AI agent connection)
- Regular API: Same as main API but on port 8002
- Health check: `http://localhost:8002/docs` (Swagger UI)

## Code Style Guidelines

### Python Backend

**Imports** (in order: stdlib, third-party, local; alphabetical within each group):
```python
import os
from typing import Optional

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from vector_store import VectorStore
```

**Formatting**: Black formatter (line length: 100), 4 spaces indentation.

**Types**: Python 3.10+ type hints. Use `|` syntax (`str | None`), built-in collections (`list[str]`, `dict[str, Any]`).

**Naming**: `snake_case` (variables/functions), `PascalCase` (classes), `UPPER_SNAKE_CASE` (constants), `_leading_underscore` (private methods).

**Error Handling**: Raise explicit exceptions for config errors; return error dicts from API functions.

**Docstrings**: Google-style with Args/Returns sections.

### React Frontend

**Components**: Functional with hooks, default export, one per file.

**Naming**: `PascalCase` (components), `camelCase` (props/functions), `.jsx` (components), `.js` (utilities).

**State**: `useState` (local), `useEffect` (side effects), `useRef` (DOM refs).

**Styling**: Inline styles with JS objects, follow existing patterns in `RAGInterface.jsx`.

**API Calls**: Use `fetch` with async/await, try/catch error handling, toast notifications for feedback.

## Project Structure

```
rag-ai-knowledge-assistant/
├── api.py              # FastAPI backend (main API for React)
├── mcp_server.py       # MCP server for AI agent integration
├── vector_store.py     # FAISS vector store
├── rag_pipeline.py     # RAG orchestration
├── ingest.py           # PDF ingestion
├── context_builder.py  # Context formatting
├── prompt.py           # LLM prompt building
├── llm.py              # Groq LLM client
├── smart_retriever.py  # Retrieval + reranking
├── reranker.py         # Cross-encoder reranker
├── pdf_loader.py       # PDF text extraction
├── cleaner.py          # Text cleaning
├── chunker.py          # Text chunking
├── filter.py           # Filtering utilities
├── query_rewrite.py    # Query rewriting
├── data/               # Uploaded PDFs storage
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── RAGInterface.jsx
│   │   └── index.js
│   └── package.json
└── requirements.txt
```

## Key Configuration

- **GROQ_API_KEY**: Required env var for LLM
- **Embed Model**: `all-MiniLM-L6-v2`
- **LLM Model**: `llama-3.3-70b-versatile` via Groq
- **Vector Store**: FAISS with inner product

## Common Tasks

**Add API endpoint**: Add to `api.py` (main API) or `mcp_server.py` (MCP tools), update frontend in `RAGInterface.jsx` if needed for main API.

**Add Python module**: Create `.py` in root, add imports, use type hints.

**Modify UI**: Edit `RAGInterface.jsx`, styles are inline (see `GLOBAL_CSS`).

**MCP Server Configuration**: AI agents connect to `http://localhost:8002/mcp` to access RAG functionality as tools.