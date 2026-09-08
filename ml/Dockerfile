# Umbra — Módulo ML propio
# Imagen para deploy del FastAPI server. Usada por render.yaml.
# Build: docker build -t umbra-ml ./ml
# Run:   docker run -p 8000:8000 umbra-ml

FROM python:3.11-slim

# Sistema base mínimo para torch + transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar deps primero (capa cacheable)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código del módulo
COPY src/ ./src/
COPY models/ ./models/
COPY eval_metrics.json* ./
COPY metrics.json* ./

# Pre-descargar DistilBERT al build para evitar cold start en inferencia
RUN python -c "from src.extract_embeddings import EmbeddingExtractor; EmbeddingExtractor()._ensure_loaded()"

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.api_server:app", "--host", "0.0.0.0", "--port", "8000"]
