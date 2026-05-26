from typing import List, Dict, Any

# Reranking:
# Cross-Encoders are slow and consume >350MB RAM, which exceeds the Render Free Tier limit.
# Reranking is temporarily disabled/stubbed to preserve the 512MB memory budget.
# This pass-through stub assigns mock descending scores to preserve frontend visualizer compatibility.

def rerank_chunks(query: str, chunks: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Pass-through mock reranker that assigns mock descending scores to retrieved chunks.
    This keeps the API fully compatible with the React/Next.js frontend.
    
    Args:
        query: The optimized query string.
        chunks: The chunks retrieved from Hybrid Search.
        top_k: The number of top chunks to return.
    """
    if not chunks:
        return []
        
    # Attach mock descending scores to simulate reranking and preserve the visualizer UI
    for i, chunk in enumerate(chunks):
        chunk['rerank_score'] = round(0.95 - (i * 0.05), 3)
        
    return chunks[:top_k]
