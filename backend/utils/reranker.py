from sentence_transformers import CrossEncoder
from typing import List, Dict, Any

# Reranking:
# Retrieval models (like Bi-Encoders used in semantic search or BM25) are fast but less accurate.
# Cross-Encoders are slower but highly accurate at scoring the relevance of a (query, document) pair.
# The Reranking step takes the top N chunks from hybrid search and scores them with a CrossEncoder
# to re-order them and select the absolute best M chunks to send to the LLM.

_reranker_model = None

def get_reranker_model():
    global _reranker_model
    if _reranker_model is None:
        # Load the CrossEncoder model
        _reranker_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    return _reranker_model

def rerank_chunks(query: str, chunks: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Reranks the retrieved chunks using a CrossEncoder.
    
    Args:
        query: The optimized query string.
        chunks: The chunks retrieved from Hybrid Search (usually 10).
        top_k: The number of top chunks to return after reranking (e.g., 3).
    """
    if not chunks:
        return []
        
    model = get_reranker_model()
    
    # Create pairs of (query, chunk_text)
    pairs = [[query, chunk['text']] for chunk in chunks]
    
    # Predict scores
    scores = model.predict(pairs)
    
    # Attach scores to chunks
    for i, chunk in enumerate(chunks):
        chunk['rerank_score'] = float(scores[i])
        
    # Sort by rerank score descending
    reranked_chunks = sorted(chunks, key=lambda x: x['rerank_score'], reverse=True)
    
    return reranked_chunks[:top_k]
