"""Entry point de la API REST del Etiquetador Morfosintáctico HMM."""

import logging
import sys
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import CORS_ORIGINS, ENV

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Crear app (desactivar docs en producción)
_is_prod = ENV == "production"
app = FastAPI(
    title="Etiquetador Morfosintáctico HMM",
    description=(
        "API REST para etiquetado morfosintáctico (POS Tagging) basado en "
        "un Modelo Oculto de Markov (HMM) bigrama con decodificación mediante "
        "el algoritmo de Viterbi.\n\n"
        "Entrenado con el Wikicorpus en español usando etiquetas EAGLES (FreeLing).\n\n"
        "**Actividad 1** — Procesamiento del Lenguaje Natural — "
        "Máster Universitario en Inteligencia Artificial, UNIR 2026."
    ),
    version="1.0.0",
    contact={"name": "Samael Hernandez", "url": "https://github.com/shernandez"},
    license_info={"name": "MIT"},
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
    openapi_url=None if _is_prod else "/openapi.json",
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cache-Control"] = "no-store"
    return response

# Registrar routers
from routers import corpus, probabilities, viterbi, exports, tags, evaluation

app.include_router(corpus.router)
app.include_router(probabilities.router)
app.include_router(viterbi.router)
app.include_router(exports.router)
app.include_router(tags.router)
app.include_router(evaluation.router)


@app.get("/")
async def root():
    """Endpoint raíz con información de la API."""
    return {
        "name": "Etiquetador Morfosintáctico HMM",
        "version": "1.0.0",
        "description": "API REST para etiquetado POS con HMM bigrama y Viterbi",
        "docs": "/docs",
        "endpoints": {
            "corpus": "/api/corpus",
            "probabilities": "/api/probabilities",
            "viterbi": "/api/viterbi",
            "exports": "/api/exports",
            "tags": "/api/tags",
            "evaluation": "/api/evaluation",
        },
    }


@app.get("/health")
async def health():
    """Health check."""
    from services.corpus_parser import get_corpus_data
    from services.hmm_trainer import get_emission_probs

    corpus_loaded = get_corpus_data() is not None
    model_trained = get_emission_probs() is not None

    return {
        "status": "ok",
        "corpus_loaded": corpus_loaded,
        "model_trained": model_trained,
    }
