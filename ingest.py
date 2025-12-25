from pdf_loader import load_pdf
from cleaner import clean_text
from chunker import smart_chunk

def ingest_pdf(pdf_path):
    pages = load_pdf(pdf_path)

    all_chunks = []
    for page in pages:
        cleaned = clean_text(page["text"])
        chunks = smart_chunk(cleaned)

        for chunk in chunks:
            all_chunks.append({
                "text": chunk,
                "metadata": {
                    "page": page["page"],
                    "source": pdf_path
                }
            })

    return all_chunks
