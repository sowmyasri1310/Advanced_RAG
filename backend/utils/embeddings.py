from sentence_transformers import SentenceTransformer
from typing import List

# Embeddings: We use an embedding model to convert text chunks into high-dimensional vectors.
# This allows us to perform vector search (semantic search) using cosine similarity.
# We are using 'all-MiniLM-L6-v2', a small, fast, and efficient model for sentence embeddings.

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        # Load the model only once
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generates embeddings for a list of text strings.
    """
    model = get_embedding_model()
    # model.encode returns numpy arrays, we convert to list for ChromaDB compatibility
    embeddings = model.encode(texts, show_progress_bar=False).tolist()
    return embeddings

def generate_query_embedding(query: str) -> List[float]:
    """
    Generates embedding for a single query string.
    """
    model = get_embedding_model()
    return model.encode(query, show_progress_bar=False).tolist()
