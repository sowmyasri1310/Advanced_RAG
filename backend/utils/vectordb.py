import chromadb
import os
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
COLLECTION_NAME = "advanced_rag_collection"

_client = None

def get_chroma_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=DB_PATH)
    return _client

def get_or_create_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(name=COLLECTION_NAME)

def insert_chunks(chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
    collection = get_or_create_collection()
    
    ids = [chunk['id'] for chunk in chunks]
    texts = [chunk['text'] for chunk in chunks]
    metadatas = [chunk['metadata'] for chunk in chunks]
    
    collection.add(
        ids=ids,
        documents=texts,
        metadatas=metadatas,
        embeddings=embeddings
    )

def semantic_search(query_embedding: List[float], n_results: int = 10) -> List[Dict[str, Any]]:
    collection = get_or_create_collection()
    if collection.count() == 0:
        return []

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"]
    )
    
    if not results['ids'][0]:
        return []
        
    formatted_results = []
    for i in range(len(results['ids'][0])):
        formatted_results.append({
            "id": results['ids'][0][i],
            "text": results['documents'][0][i],
            "metadata": results['metadatas'][0][i],
            "distance": results['distances'][0][i]
        })
    return formatted_results

def get_all_chunks() -> List[Dict[str, Any]]:
    collection = get_or_create_collection()
    if collection.count() == 0:
        return []
        
    results = collection.get(include=["documents", "metadatas"])
    
    formatted_results = []
    for i in range(len(results['ids'])):
        formatted_results.append({
            "id": results['ids'][i],
            "text": results['documents'][i],
            "metadata": results['metadatas'][i]
        })
    return formatted_results

def get_unique_filenames() -> List[str]:
    """Returns a list of unique filenames currently in the database."""
    collection = get_or_create_collection()
    if collection.count() == 0:
        return []
        
    # In a production system, maintaining a separate table/collection for documents is better.
    # For now, we extract unique filenames from chunk metadata.
    results = collection.get(include=["metadatas"])
    filenames = set()
    for meta in results['metadatas']:
        if meta and 'filename' in meta:
            filenames.add(meta['filename'])
    return list(filenames)

def delete_document(filename: str):
    """Deletes all chunks associated with a specific filename."""
    collection = get_or_create_collection()
    collection.delete(where={"filename": filename})

def clear_db():
    client = get_chroma_client()
    try:
        client.delete_collection(name=COLLECTION_NAME)
    except:
        pass
