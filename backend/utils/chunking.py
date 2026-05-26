from typing import List, Dict, Any
import uuid
import datetime

def chunk_text(text: str, metadata: Dict[str, Any], chunk_size: int = 500, overlap: int = 75) -> List[Dict[str, Any]]:
    """
    Splits text into smaller chunks for vector embeddings.
    
    Chunking strategy:
    - We use a sliding window approach with 'chunk_size' and 'overlap'.
    - Why overlap? It prevents cutting off context in the middle of a sentence or thought.
      By overlapping, we ensure that the relationships between words across chunk boundaries 
      are preserved, improving retrieval performance.
      
    Args:
        text (str): The full text to chunk.
        metadata (Dict): Metadata associated with the full document.
        chunk_size (int): Number of words per chunk.
        overlap (int): Number of words overlapping between adjacent chunks.
        
    Returns:
        List[Dict]: A list of chunk dictionaries containing 'text', 'metadata', and 'id'.
    """
    words = text.split()
    chunks = []
    
    if not words:
        return chunks

    i = 0
    chunk_index = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunk_text_str = " ".join(chunk_words)
        
        # Extend metadata with chunk specific info
        chunk_metadata = metadata.copy()
        chunk_metadata["chunk_index"] = chunk_index
        chunk_metadata["upload_timestamp"] = datetime.datetime.now().isoformat()
        
        chunks.append({
            "id": str(uuid.uuid4()),
            "text": chunk_text_str,
            "metadata": chunk_metadata
        })
        
        i += (chunk_size - overlap)
        chunk_index += 1
        
    return chunks
