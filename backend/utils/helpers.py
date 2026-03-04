"""Funciones auxiliares."""

import json
import pickle
import logging
from pathlib import Path
from typing import Any

from config import CACHE_DIR

logger = logging.getLogger(__name__)


def save_cache(name: str, data: Any) -> bool:
    """Guarda datos en caché local usando pickle."""
    try:
        path = CACHE_DIR / f"{name}.pkl"
        with open(path, "wb") as f:
            pickle.dump(data, f, protocol=pickle.HIGHEST_PROTOCOL)
        logger.info(f"Caché guardado: {path} ({path.stat().st_size / 1024 / 1024:.1f} MB)")
        return True
    except Exception as e:
        logger.error(f"Error guardando caché {name}: {e}")
        return False


def load_cache(name: str) -> Any:
    """Carga datos de caché local."""
    path = CACHE_DIR / f"{name}.pkl"
    if not path.exists():
        return None
    try:
        with open(path, "rb") as f:
            data = pickle.load(f)
        logger.info(f"Caché cargado: {path}")
        return data
    except Exception as e:
        logger.error(f"Error cargando caché {name}: {e}")
        return None


def cache_exists(name: str) -> bool:
    """Verifica si un caché existe."""
    return (CACHE_DIR / f"{name}.pkl").exists()


def format_number(n: int) -> str:
    """Formatea un número con separador de miles."""
    return f"{n:,}".replace(",", ".")


def tokenize_sentence(sentence: str) -> list[str]:
    """Tokeniza una oración de forma simple.

    Separa puntuación del texto de forma básica.
    """
    import re
    # Separar signos de puntuación como tokens independientes
    sentence = re.sub(r'([.!?;:,¡¿\(\)\[\]\"\'«»—\-])', r' \1 ', sentence)
    tokens = sentence.split()
    return [t for t in tokens if t.strip()]
