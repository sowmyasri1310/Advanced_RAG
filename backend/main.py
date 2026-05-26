import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from utils.pdf_loader import extract_text_and_metadata_from_pdf
from utils.chunking import chunk_text
from utils.embeddings import generate_embeddings
from utils.vectordb import insert_chunks, clear_db, get_unique_filenames, delete_document
from utils.rag_pipeline import run_pipeline

app = FastAPI(title="Advanced RAG API")

# Configure CORS for Next.js frontend
# Add your Vercel domain to ALLOWED_ORIGINS when deploying
import os
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Advanced RAG API is running"}

@app.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Handles PDF uploads, extracts text, chunks it, generates embeddings, 
    and stores them in ChromaDB.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
        
    total_chunks_processed = 0
    
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
            
        try:
            # Read bytes
            file_bytes = await file.read()
            
            # Extract Text & Metadata
            extracted = extract_text_and_metadata_from_pdf(file_bytes, file.filename)
            text = extracted["text"]
            metadata = extracted["metadata"]
            
            # Chunking
            chunks = chunk_text(text, metadata, chunk_size=500, overlap=75)
            
            if not chunks:
                continue
                
            # Embedding Generation
            texts_to_embed = [chunk['text'] for chunk in chunks]
            embeddings = generate_embeddings(texts_to_embed)
            
            # Insert to VectorDB
            insert_chunks(chunks, embeddings)
            
            total_chunks_processed += len(chunks)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing {file.filename}: {str(e)}")
            
    return {
        "message": "Documents processed successfully",
        "files_processed": len(files),
        "total_chunks_stored": total_chunks_processed
    }

@app.post("/query")
def process_query(request: QueryRequest):
    """
    Executes the Advanced RAG pipeline for the given query.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        response = run_pipeline(request.query)
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear-db")
def clear_database():
    """
    Clears all collections in ChromaDB.
    """
    try:
        clear_db()
        return {"message": "Database cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
def get_documents():
    """
    Returns a list of all uploaded filenames.
    """
    try:
        filenames = get_unique_filenames()
        return {"documents": filenames}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{filename}")
def remove_document(filename: str):
    """
    Deletes a specific document and all its chunks from the database.
    """
    try:
        delete_document(filename)
        return {"message": f"Document {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
