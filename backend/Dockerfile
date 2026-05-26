FROM python:3.11-slim

WORKDIR /app

# Install system-level build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first
COPY requirements.txt .

# Install CPU-only PyTorch first to strictly prevent CUDA/NVIDIA packages from installing
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch

# Install remaining Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the optimized lightweight embedding model during build time
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-MiniLM-L3-v2')"

# Copy application source code
COPY . .

# Create directories that must exist at runtime
RUN mkdir -p /app/chroma_db /app/uploads

# Configure environment variables to restrict multithreading, prevent CUDA checks, and save memory
ENV OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    VECLIB_MAXIMUM_THREADS=1 \
    NUMEXPR_NUM_THREADS=1 \
    TOKENIZERS_PARALLELISM=false \
    TORCH_CUDA_ARCH_LIST="" \
    FORCE_CUDA="0" \
    PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
