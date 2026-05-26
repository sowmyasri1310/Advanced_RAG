import PyPDF2
from io import BytesIO
from typing import Dict, Any

def extract_text_and_metadata_from_pdf(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Extracts text and basic metadata from a PDF file.
    
    Args:
        file_bytes (bytes): The raw bytes of the PDF file.
        filename (str): The name of the file uploaded.
        
    Returns:
        Dict: Contains 'text' (full text) and 'metadata' (dictionary of metadata).
    """
    pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
    full_text = ""
    pages_metadata = []
    
    for i, page in enumerate(pdf_reader.pages):
        page_text = page.extract_text()
        if page_text:
            full_text += page_text + "\n"
            pages_metadata.append({"page_number": i + 1, "char_length": len(page_text)})
            
    # Basic metadata extraction
    doc_info = pdf_reader.metadata
    title = doc_info.title if doc_info and doc_info.title else filename
    
    metadata = {
        "filename": filename,
        "title": title,
        "total_pages": len(pdf_reader.pages)
    }
    
    return {
        "text": full_text,
        "metadata": metadata
    }
