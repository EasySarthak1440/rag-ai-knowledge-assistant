def filter_chunks(chunks, min_length=100):
    filtered = []
    for c in chunks:
        if len(c["text"]) >= min_length:
            filtered.append(c)
    return filtered
