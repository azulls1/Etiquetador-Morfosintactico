"""Configuración del backend del Etiquetador Morfosintáctico."""

import os
from pathlib import Path

# Entorno
ENV = os.getenv("ENV", "development")

# Rutas
BASE_DIR = Path(__file__).parent
CORPUS_DIR = os.getenv("CORPUS_DIR", str(BASE_DIR / "corpus"))
EXPORTS_DIR = Path(os.getenv("EXPORTS_DIR", str(BASE_DIR / "exports")))
CACHE_DIR = Path(os.getenv("CACHE_DIR", str(BASE_DIR / "cache")))

# Crear directorios si no existen
EXPORTS_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)

# Supabase
SUPABASE_URL = os.getenv(
    "SUPABASE_URL",
    "https://supabase-maestria.iagentek.com.mx"
)
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# CORS
_PRODUCTION_ORIGINS = [
    "https://etiqmorfsintac.iagentek.com.mx",
]

_DEVELOPMENT_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:4200",
    "http://localhost:5173",
    "http://localhost:8000",
]

CORS_ORIGINS = _PRODUCTION_ORIGINS + (_DEVELOPMENT_ORIGINS if ENV != "production" else [])
