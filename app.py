import streamlit as st
import os
from ingest import ingest_pdf
from vector_store import VectorStore
from rag_pipeline import rag_answer

st.set_page_config(page_title="RAG AI Assistant", layout="wide")
st.title("📚 RAG AI Knowledge Assistant")
st.caption("Ask questions grounded strictly in your documents")

uploaded_file = st.file_uploader("Upload a PDF", type=["pdf"])

if uploaded_file:
    os.makedirs("data", exist_ok=True)

    with open("data/uploaded.pdf", "wb") as f:
        f.write(uploaded_file.read())

    st.success("PDF uploaded successfully!")

    # ✅ ONLY runs for uploaded PDF
    all_chunks = ingest_pdf("data/uploaded.pdf")

    vs = VectorStore()
    vs.build(all_chunks)

    st.success("Document indexed successfully!")

    query = st.text_input("Ask a question about the document")

    if query:
        with st.spinner("Thinking..."):
            answer = rag_answer(query, vs)

        st.subheader("Answer")
        st.write(answer)
