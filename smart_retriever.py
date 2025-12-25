from query_rewrite import rewrite_query
from filter import filter_chunks
from reranker import rerank

def smart_retrieve(query, vector_store):
    rewritten = rewrite_query(query)
    retrieved = vector_store.search(rewritten, top_k=8)
    filtered = filter_chunks(retrieved)
    reranked = rerank(rewritten, filtered)
    return reranked
