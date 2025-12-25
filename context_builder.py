def build_context(chunks, max_chars=2000):
    context = ""
    for c in chunks:
        if len(context) + len(c["text"]) > max_chars:
            break
        context += f"\nSource (page {c['metadata']['page']}):\n{c['text']}\n"
    return context.strip()
