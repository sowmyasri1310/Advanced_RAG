from rank_bm25 import BM25Okapi
from typing import List, Dict, Any
from utils.vectordb import get_all_chunks

# Hybrid Search:
# Combines Semantic Search (Vector similarity) with Keyword Search (BM25).
# Why hybrid search?
# - Semantic search is great for understanding concepts, synonyms, and context.
# - Keyword search is great for exact word matches (names, acronyms, specific IDs).
# Combining them provides the best of both worlds.

def keyword_search(query: str, chunks: List[Dict[str, Any]], n_results: int = 10) -> List[Dict[str, Any]]:
    """
    Performs BM25 keyword retrieval.
    """
    if not chunks:
        return []
        
    tokenized_corpus = [chunk['text'].lower().split() for chunk in chunks]
    bm25 = BM25Okapi(tokenized_corpus)
    tokenized_query = query.lower().split()
    
    # Get scores for all chunks
    doc_scores = bm25.get_scores(tokenized_query)
    
    # Sort by score descending and get top n
    top_indices = sorted(range(len(doc_scores)), key=lambda i: doc_scores[i], reverse=True)[:n_results]
    
    results = []
    for i in top_indices:
        if doc_scores[i] > 0: # Only include if there's some match
            result = chunks[i].copy()
            result['bm25_score'] = doc_scores[i]
            results.append(result)
            
    return results

def reciprocal_rank_fusion(semantic_results: List[Dict], keyword_results: List[Dict], k: int = 60) -> List[Dict]:
    """
    Implements Reciprocal Rank Fusion (RRF).
    
    RRF combines rankings from different search systems without requiring score normalization.
    Score formula: RRF_Score = 1 / (k + Rank)
    """
    rrf_scores: Dict[str, float] = {}
    chunk_map: Dict[str, Dict] = {}
    
    # Process semantic results
    for rank, result in enumerate(semantic_results):
        chunk_id = result['id']
        chunk_map[chunk_id] = result
        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + (1.0 / (k + rank + 1))
        
    # Process keyword results
    for rank, result in enumerate(keyword_results):
        chunk_id = result['id']
        if chunk_id not in chunk_map:
            chunk_map[chunk_id] = result
        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + (1.0 / (k + rank + 1))
        
    # Sort chunks by RRF score descending
    sorted_chunks = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    
    final_results = []
    for chunk_id, score in sorted_chunks:
        chunk = chunk_map[chunk_id].copy()
        chunk['rrf_score'] = score
        final_results.append(chunk)
        
    return final_results

def perform_hybrid_search(query: str, semantic_results: List[Dict[str, Any]], n_results: int = 10) -> List[Dict[str, Any]]:
    """
    Executes hybrid search by combining provided semantic results with freshly calculated keyword results.
    """
    # 1. We already have semantic_results from ChromaDB vector search
    
    # 2. Get all chunks for BM25
    all_chunks = get_all_chunks()
    
    # 3. Perform keyword search
    keyword_results = keyword_search(query, all_chunks, n_results=n_results)
    
    # 4. Merge results using Reciprocal Rank Fusion
    hybrid_results = reciprocal_rank_fusion(semantic_results, keyword_results)
    
    return hybrid_results[:n_results]
