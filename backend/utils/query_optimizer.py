import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Query Optimization:
# Users often ask brief or ambiguous questions (e.g., "refund policy").
# By rewriting or expanding the query using an LLM before retrieval, we can add
# context, fix typos, and generate a richer search query, which drastically improves retrieval.

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not found")
    return Groq(api_key=api_key)

def optimize_query(user_query: str) -> str:
    """
    Uses Groq LLM to optimize and expand the user's query for better retrieval.
    """
    client = get_groq_client()
    
    prompt = f"""You are an expert AI search query optimizer for a RAG system.
Your task is to take a user's query and rewrite it to be optimal for both vector (semantic) and BM25 (keyword) search.
- Correct any spelling mistakes.
- Expand acronyms if obvious.
- Add synonyms or related terms to improve semantic matching.
- Keep the intent identical to the original query.
- Make it a clear, detailed search query.

Original Query: "{user_query}"

Provide ONLY the optimized query text. Do not include quotes, explanations, or introductory text.
"""

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful query optimization assistant."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.2, # Low temperature for more deterministic, focused rewrites
        max_tokens=100
    )
    
    optimized_query = response.choices[0].message.content.strip()
    # Strip any extra quotes if the model added them
    if optimized_query.startswith('"') and optimized_query.endswith('"'):
        optimized_query = optimized_query[1:-1]
        
    return optimized_query
