from smart_retriever import smart_retrieve
from context_builder import build_context
from prompt import build_prompt
from llm import generate_answer

def rag_answer(query, vector_store):
    chunks = smart_retrieve(query, vector_store)

    if not chunks:
        return "I don't have enough information to answer this."

    context = build_context(chunks)
    prompt = build_prompt(context, query)

    return generate_answer(prompt)
