import os
from groq import Groq
from typing import List, Dict, Any
from utils.prompts import RAG_PROMPT

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not found")
    return Groq(api_key=api_key)

def generate_answer(query: str, chunks: List[Dict[str, Any]]) -> str:
    """
    Generates the final answer using Groq LLM based on the reranked chunks.
    """
    client = get_groq_client()
    
    # Construct the context block
    context_parts = []
    for i, chunk in enumerate(chunks):
        source = chunk.get('metadata', {}).get('filename', 'Unknown Source')
        page = chunk.get('metadata', {}).get('page_number', 'Unknown Page')
        context_parts.append(f"--- Chunk {i+1} (Source: {source}, Page: {page}) ---\n{chunk['text']}")
        
    context_str = "\n\n".join(context_parts)
    
    # Use prompt template
    prompt = RAG_PROMPT.format(
        reranked_chunks=context_str,
        optimized_query=query
    )
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an advanced RAG AI assistant. Answer ONLY from the provided context."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=1000
    )
    
    return response.choices[0].message.content.strip()
