# Advanced RAG Application

This is a production-style Advanced Retrieval-Augmented Generation (RAG) application.

## Features

1. **Hybrid Search**: Combines Vector Similarity Search with BM25 Keyword Search using Reciprocal Rank Fusion (RRF).
2. **Query Optimization**: Uses an LLM (Groq) to rewrite and expand user queries before retrieval.
3. **Reranking**: Applies a Cross-Encoder to rerank the top chunks retrieved by hybrid search for maximum accuracy.
4. **Modern UI**: Built with Next.js 15, Tailwind CSS, Shadcn UI, and Framer Motion.
5. **FastAPI Backend**: High-performance Python backend with a modular AI pipeline.
6. **ChromaDB**: Persistent local vector database.
7. **Observability**: Integrated with LangSmith.

## Project Structure

- `frontend/`: Next.js frontend application.
- `backend/`: FastAPI backend and AI pipelines.
- `chroma_db/`: Local persistent storage for ChromaDB (created at runtime).

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` in the root directory and fill in your API keys (Groq, LangSmith).
4. Run the backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

*Note: The first time you run a query or upload a document, it will download the SentenceTransformer and CrossEncoder models. This may take a few minutes depending on your internet connection.*

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

- **Backend**: Can be deployed to Render or Railway using the provided `Dockerfile`. Ensure you mount a volume for `./chroma_db` if you want persistence across deployments, or use a managed vector database for production.
- **Frontend**: Can be deployed seamlessly to Vercel using the `vercel.json` configuration.
