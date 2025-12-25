import nltk
nltk.download("punkt")

from nltk.tokenize import sent_tokenize

def smart_chunk(text, chunk_size=500, overlap=100):
    sentences = sent_tokenize(text)
    chunks = []
    current = ""

    for sent in sentences:
        if len(current) + len(sent) <= chunk_size:
            current += " " + sent
        else:
            chunks.append(current.strip())
            current = current[-overlap:] + " " + sent

    if current:
        chunks.append(current.strip())

    return chunks

