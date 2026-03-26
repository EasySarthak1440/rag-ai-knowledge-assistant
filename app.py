"""
app.py — Streamlit UI for Multi-PDF RAG Knowledge Assistant

New in v2:
  • Upload multiple PDFs at once
  • Sidebar PDF manager (see what's indexed, remove individual docs)
  • Source + page badges shown under every answer
  • Optional per-source filter before asking a question
"""

import os
import shutil
import tempfile
import streamlit as st

from vector_store import VectorStore
from ingest import ingest_pdfs
from rag_pipeline import run_rag
from context_builder import build_sources_summary


st.set_page_config(
    page_title="RAG Knowledge Assistant",
    page_icon="🧠",
    layout="wide",
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)


if "vector_store" not in st.session_state:
    st.session_state.vector_store = VectorStore()

if "indexed_files" not in st.session_state:
    # { filename: absolute_path }
    st.session_state.indexed_files: dict[str, str] = {}

if "chat_history" not in st.session_state:
    st.session_state.chat_history: list[dict] = []


vs: VectorStore = st.session_state.vector_store


with st.sidebar:
    st.header("📂 PDF Manager")

    uploaded_files = st.file_uploader(
        "Upload PDFs",
        type="pdf",
        accept_multiple_files=True,
        help="You can upload multiple PDFs at once.",
    )

    if uploaded_files:
        new_files = [f for f in uploaded_files
                     if f.name not in st.session_state.indexed_files]

        if new_files:
            with st.spinner(f"Indexing {len(new_files)} new PDF(s)…"):
                saved_paths = []
                for uf in new_files:
                    dest = os.path.join(DATA_DIR, uf.name)
                    with open(dest, "wb") as out:
                        out.write(uf.read())
                    saved_paths.append(dest)
                    st.session_state.indexed_files[uf.name] = dest

                count = ingest_pdfs(saved_paths, vs)
                st.success(f"✅ Indexed {count} chunks from {len(new_files)} PDF(s).")
        else:
            st.info("All uploaded PDFs are already indexed.")

    st.divider()

    st.subheader("📋 Indexed Documents")

    if not st.session_state.indexed_files:
        st.caption("No PDFs indexed yet.")
    else:
        for fname in list(st.session_state.indexed_files.keys()):
            col1, col2 = st.columns([4, 1])
            col1.markdown(f"📄 `{fname}`")
            if col2.button("🗑️", key=f"del_{fname}", help=f"Remove {fname}"):
                _path = st.session_state.indexed_files.pop(fname)
                if os.path.exists(_path):
                    os.remove(_path)
                # Rebuild index without this file
                vs.reset()
                remaining = list(st.session_state.indexed_files.values())
                if remaining:
                    ingest_pdfs(remaining, vs)
                st.rerun()

    if st.session_state.indexed_files:
        if st.button("🧹 Clear All", use_container_width=True):
            for path in st.session_state.indexed_files.values():
                if os.path.exists(path):
                    os.remove(path)
            st.session_state.indexed_files = {}
            vs.reset()
            st.session_state.chat_history = []
            st.rerun()

    st.divider()

    st.subheader("🔍 Filter by Source")
    sources = vs.list_sources()
    source_options = ["All documents"] + sources
    selected_source = st.selectbox(
        "Answer from:",
        source_options,
        help="Restrict answers to a specific PDF.",
    )
    source_filter = None if selected_source == "All documents" else selected_source
    
def _render_sources(sources: list[dict]) -> None:
    """Display source badges under an answer."""
    with st.expander("📌 Sources used", expanded=False):
        for s in sources:
            pages_str = ", ".join(f"p.{p}" for p in s["pages"])
            st.markdown(f"- **{s['source']}** — {pages_str}")

st.title("🧠 RAG AI Knowledge Assistant")
st.caption("Upload PDFs in the sidebar, then ask questions about them.")

# Render chat history
for msg in st.session_state.chat_history:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if msg["role"] == "assistant" and msg.get("sources"):
            _render_sources(msg["sources"])


# Query input
if prompt := st.chat_input(
    "Ask a question about your documents…",
    disabled=not st.session_state.indexed_files,
):
    # Show user message
    st.session_state.chat_history.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate answer
    with st.chat_message("assistant"):
        with st.spinner("Thinking…"):
            answer, results = run_rag(
                query=prompt,
                vector_store=vs,
                source_filter=source_filter,
            )

        st.markdown(answer)
        sources = build_sources_summary(results)
        _render_sources(sources)

    st.session_state.chat_history.append({
        "role": "assistant",
        "content": answer,
        "sources": sources,
    })

if not st.session_state.indexed_files:
    st.info("👈 Upload at least one PDF from the sidebar to get started.")
