import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

class VectorStore:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index = None
        self.texts = []
        self.metadata = []

    def build(self, documents):
        self.texts = [doc["text"] for doc in documents]
        self.metadata = [doc["metadata"] for doc in documents]

        embeddings = self.model.encode(self.texts, show_progress_bar=True)
        embeddings = np.array(embeddings).astype("float32")

        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)

    def search(self, query, top_k=5):
        query_embedding = self.model.encode([query]).astype("float32")
        distances, indices = self.index.search(query_embedding, top_k)

        results = []
        for i in indices[0]:
            results.append({
                "text": self.texts[i],
                "metadata": self.metadata[i]
            })
        return results
