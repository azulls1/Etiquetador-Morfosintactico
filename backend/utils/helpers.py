"""Funciones auxiliares."""

import hashlib
import hmac
import json
import pickle
import logging
from pathlib import Path
from typing import Any

from config import CACHE_DIR

logger = logging.getLogger(__name__)

# Clave para firmar caches (derivada del path del proyecto, no es un secreto criptográfico
# sino una protección contra inyección accidental de pickles maliciosos)
_CACHE_HMAC_KEY = hashlib.sha256(str(CACHE_DIR.resolve()).encode()).digest()


def _compute_hmac(data: bytes) -> str:
    """Calcula HMAC-SHA256 de los datos."""
    return hmac.new(_CACHE_HMAC_KEY, data, hashlib.sha256).hexdigest()


def save_cache(name: str, data: Any) -> bool:
    """Guarda datos en caché local usando pickle con firma HMAC."""
    try:
        path = CACHE_DIR / f"{name}.pkl"
        sig_path = CACHE_DIR / f"{name}.sig"
        payload = pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL)
        with open(path, "wb") as f:
            f.write(payload)
        sig_path.write_text(_compute_hmac(payload))
        logger.info(f"Caché guardado: {path} ({path.stat().st_size / 1024 / 1024:.1f} MB)")
        return True
    except Exception as e:
        logger.error(f"Error guardando caché {name}: {e}")
        return False


def load_cache(name: str) -> Any:
    """Carga datos de caché local verificando firma HMAC."""
    path = CACHE_DIR / f"{name}.pkl"
    sig_path = CACHE_DIR / f"{name}.sig"
    if not path.exists():
        return None
    try:
        payload = path.read_bytes()
        # Verificar firma HMAC
        if sig_path.exists():
            expected = sig_path.read_text().strip()
            actual = _compute_hmac(payload)
            if not hmac.compare_digest(expected, actual):
                logger.error(f"Firma HMAC inválida para caché {name}. Archivo posiblemente alterado.")
                return None
        else:
            # Legacy: cargar sin firma y re-firmar para futuras cargas
            logger.warning(f"Sin firma HMAC para caché {name}. Cargando y firmando.")
            data = pickle.loads(payload)
            sig_path.write_text(_compute_hmac(payload))
            logger.info(f"Caché legacy firmado: {path}")
            return data
        data = pickle.loads(payload)
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
