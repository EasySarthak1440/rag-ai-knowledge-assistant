from ingest import all_chunks
from vector_store import VectorStore

vs = VectorStore()
vs.build(all_chunks)

query = "What domain does rohit work in?"

results = vs.search(query)

for i, res in enumerate(results, 1):
    print(f"\nResult {i}")
    print(res["text"][:300])
    print("Source:", res["metadata"])
