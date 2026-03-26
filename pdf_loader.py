import pypdf
from pathlib import Path


def load_pdf(file_path: str) -> list[dict]:
    """
    Load text from a single PDF file.

    Returns a list of page dicts:
        { "text": str, "source": filename, "page": 1-based int }
    """
    pages = []
    source = Path(file_path).name

    with open(file_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():                          # skip blank pages
                pages.append({
                    "text": text,
                    "source": source,
                    "page": i + 1,
                })

    return pages


def load_pdfs(file_paths: list[str]) -> list[dict]:
    """
    Load text from multiple PDF files.

    Returns a flat list of page dicts from all PDFs,
    each carrying its own 'source' and 'page' metadata.
    """
    all_pages = []
    for path in file_paths:
        all_pages.extend(load_pdf(path))
    return all_pages
