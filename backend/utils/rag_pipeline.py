from typing import Dict, Any, List
from utils.query_optimizer import optimize_query
from utils.embeddings import generate_query_embedding
from utils.vectordb import semantic_search
from utils.hybrid_search import perform_hybrid_search
from utils.reranker import rerank_chunks
from utils.groq_helper import generate_answer

# LangSmith tracing is temporarily disabled to prevent memory overhead on free tier.
# We define a local no-op decorator to avoid breaking pipeline instrumentation.
def traceable(*args, **kwargs):
    def decorator(func):
        return func
    return decorator

@traceable(name="advanced_rag_pipeline")
def run_pipeline(user_query: str) -> Dict[str, Any]:
    """
    Executes the full Advanced RAG pipeline and returns the final answer
    along with intermediate steps for observability and explainability.
    """
    # 1. Query Optimization
    optimized_query = optimize_query(user_query)
    
    # 2. Embedding generation for Semantic Search
    query_embedding = generate_query_embedding(optimized_query)
    
    # 3. Vector Similarity Retrieval
    semantic_results = semantic_search(query_embedding, n_results=10)
    
    # 4. Hybrid Search (Semantic + BM25)
    hybrid_results = perform_hybrid_search(optimized_query, semantic_results, n_results=10)
    
    # 5. Reranking (CrossEncoder)
    # We take the top 10 from hybrid search and rerank them to select the top 3
    reranked_results = rerank_chunks(optimized_query, hybrid_results, top_k=3)
    
    # 6. Generate Final Answer
    final_answer = generate_answer(optimized_query, reranked_results)
    
    return {
        "user_query": user_query,
        "optimized_query": optimized_query,
        "semantic_results_count": len(semantic_results),
        "hybrid_results_count": len(hybrid_results),
        "reranked_chunks": reranked_results,
        "answer": final_answer
    }
