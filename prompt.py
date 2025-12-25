SYSTEM_PROMPT = """
You are a helpful AI assistant.

Rules:
1. Answer ONLY from the given context.
2. If the answer is not present in the context, say:
   "I don't have enough information to answer this."
3. Be concise and factual.
4. Do NOT hallucinate.
"""

def build_prompt(context, question):
    return f"""
{SYSTEM_PROMPT}

Context:
{context}

Question:
{question}

Answer:
"""
