"""Parser del Wikicorpus en español etiquetado con FreeLing (formato EAGLES)."""

import os
import logging
from collections import Counter, defaultdict
from pathlib import Path
from typing import Optional

from config import CORPUS_DIR
from utils.helpers import save_cache, load_cache, cache_exists

logger = logging.getLogger(__name__)

# Estado global del corpus procesado
_corpus_data: Optional[dict] = None


def get_corpus_data() -> Optional[dict]:
    """Retorna los datos del corpus procesado (singleton)."""
    global _corpus_data
    if _corpus_data is None:
        _corpus_data = load_cache("corpus_data")
    return _corpus_data


def _try_read_file(filepath: str) -> Optional[list[str]]:
    """Intenta leer un archivo con diferentes codificaciones."""
    for encoding in ["utf-8", "latin-1", "iso-8859-1", "cp1252"]:
        try:
            with open(filepath, "r", encoding=encoding) as f:
                return f.readlines()
        except (UnicodeDecodeError, UnicodeError):
            continue
    logger.error(f"No se pudo leer el archivo: {filepath}")
    return None


def parse_corpus(
    corpus_dir: Optional[str] = None,
    max_files: Optional[int] = None,
    progress_callback=None,
) -> dict:
    """Procesa todos los archivos del corpus y construye los conteos.

    Args:
        corpus_dir: Directorio con los archivos del corpus.
        max_files: Límite de archivos a procesar (None = todos).
        progress_callback: Función para reportar progreso.

    Returns:
        dict con tag_counts, emission_counts, transition_counts y stats.
    """
    global _corpus_data

    corpus_path = Path(corpus_dir or CORPUS_DIR)
    if not corpus_path.exists():
        raise FileNotFoundError(f"Directorio del corpus no encontrado: {corpus_path}")

    # Encontrar archivos del corpus
    files = sorted([
        f for f in corpus_path.iterdir()
        if f.is_file() and f.name.startswith("spanishEtiquetado")
    ])
    if not files:
        raise FileNotFoundError(f"No se encontraron archivos spanishEtiquetado en: {corpus_path}")

    if max_files:
        files = files[:max_files]

    logger.info(f"Procesando {len(files)} archivos del corpus en: {corpus_path}")

    # Contadores
    tag_counts: Counter = Counter()
    emission_counts: Counter = Counter()
    transition_counts: Counter = Counter()
    word_counts: Counter = Counter()

    total_tokens = 0
    total_sentences = 0
    total_documents = 0

    for file_idx, filepath in enumerate(files):
        lines = _try_read_file(str(filepath))
        if lines is None:
            continue

        in_sentence = False
        prev_tag = None

        for line in lines:
            line = line.strip()

            # Saltar líneas de documento
            if line.startswith("<doc") or line.startswith("</doc"):
                if line.startswith("<doc"):
                    total_documents += 1
                # Reiniciar estado de oración al cambiar de documento
                if in_sentence and prev_tag is not None:
                    transition_counts[(prev_tag, "<END>")] += 1
                in_sentence = False
                prev_tag = None
                continue

            # Línea en blanco = separador de oración
            if not line:
                if in_sentence and prev_tag is not None:
                    # Transición al final de oración
                    transition_counts[(prev_tag, "<END>")] += 1
                    total_sentences += 1
                in_sentence = False
                prev_tag = None
                continue

            # Parsear línea de token
            parts = line.split()
            if len(parts) < 3:
                continue

            word = parts[0].lower()  # Token en minúsculas
            tag = parts[2]           # Etiqueta POS (columna 3, index 2)

            # Saltar tokens especiales
            if word == "endofarticle":
                continue

            # Inicio de oración
            if not in_sentence:
                transition_counts[("<START>", tag)] += 1
                in_sentence = True
            elif prev_tag is not None:
                transition_counts[(prev_tag, tag)] += 1

            # Conteos
            tag_counts[tag] += 1
            emission_counts[(tag, word)] += 1
            word_counts[word] += 1
            total_tokens += 1
            prev_tag = tag

        # Cerrar última oración del archivo si quedó abierta
        if in_sentence and prev_tag is not None:
            transition_counts[(prev_tag, "<END>")] += 1
            total_sentences += 1

        if progress_callback:
            progress_callback(file_idx + 1, len(files), filepath.name)

        if (file_idx + 1) % 5 == 0 or file_idx == len(files) - 1:
            logger.info(
                f"Progreso: {file_idx + 1}/{len(files)} archivos | "
                f"{total_tokens:,} tokens | {total_sentences:,} oraciones"
            )

    # Construir resultado
    result = {
        "tag_counts": dict(tag_counts),
        "emission_counts": dict(emission_counts),
        "transition_counts": dict(transition_counts),
        "word_counts": dict(word_counts),
        "stats": {
            "total_tokens": total_tokens,
            "total_sentences": total_sentences,
            "total_documents": total_documents,
            "unique_tags": len(tag_counts),
            "unique_words": len(word_counts),
            "processed_files": len(files),
        },
    }

    # Guardar en caché
    save_cache("corpus_data", result)
    _corpus_data = result

    logger.info(
        f"Corpus procesado: {total_tokens:,} tokens, "
        f"{total_sentences:,} oraciones, {total_documents:,} documentos, "
        f"{len(tag_counts)} etiquetas únicas, {len(word_counts):,} palabras únicas"
    )

    return result


def search_word(word: str, limit: int = 20) -> Optional[dict]:
    """Busca una palabra en el corpus y retorna sus etiquetas."""
    data = get_corpus_data()
    if not data:
        return None

    word_lower = word.lower()
    emission_counts = data["emission_counts"]

    # Buscar todas las etiquetas para esta palabra
    tags = {}
    total = 0
    for (tag, w), count in emission_counts.items():
        if w == word_lower:
            tags[tag] = count
            total += count

    if not tags:
        return None

    # Ordenar por frecuencia
    sorted_tags = dict(sorted(tags.items(), key=lambda x: x[1], reverse=True)[:limit])

    return {
        "word": word_lower,
        "tags": sorted_tags,
        "total_occurrences": total,
    }


def get_stats() -> dict:
    """Retorna las estadísticas del corpus."""
    data = get_corpus_data()
    if data:
        stats = data["stats"].copy()
        stats["is_loaded"] = True
        return stats
    return {
        "total_tokens": 0,
        "total_sentences": 0,
        "total_documents": 0,
        "unique_tags": 0,
        "unique_words": 0,
        "processed_files": 0,
        "is_loaded": False,
    }
