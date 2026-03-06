"""Entrenador HMM: cálculo de probabilidades de emisión y transición."""

import logging
from typing import Optional

from services.corpus_parser import get_corpus_data
from utils.helpers import save_cache, load_cache

logger = logging.getLogger(__name__)

# Estado global de probabilidades
_emission_probs: Optional[dict] = None
_transition_probs: Optional[dict] = None
_word_to_tags: Optional[dict] = None


def get_emission_probs() -> Optional[dict]:
    """Retorna las probabilidades de emisión (singleton).

    Cadena de carga: cache local → Supabase → None.
    """
    global _emission_probs
    if _emission_probs is not None:
        return _emission_probs

    _emission_probs = load_cache("emission_probs")
    if _emission_probs is not None:
        return _emission_probs

    # Fallback: cargar desde Supabase
    from models import database
    result = database.load_emission_probs()
    if result:
        counts, probs = result
        _emission_probs = probs
        save_cache("emission_probs", probs)
        logger.info("Emission probs restauradas desde Supabase (%d pares)", len(probs))
    return _emission_probs


def get_transition_probs() -> Optional[dict]:
    """Retorna las probabilidades de transición (singleton).

    Cadena de carga: cache local → Supabase → None.
    """
    global _transition_probs
    if _transition_probs is not None:
        return _transition_probs

    _transition_probs = load_cache("transition_probs")
    if _transition_probs is not None:
        return _transition_probs

    # Fallback: cargar desde Supabase
    from models import database
    result = database.load_transition_probs()
    if result:
        counts, probs = result
        _transition_probs = probs
        save_cache("transition_probs", probs)
        logger.info("Transition probs restauradas desde Supabase (%d pares)", len(probs))
    return _transition_probs


def get_word_to_tags() -> Optional[dict]:
    """Retorna índice invertido palabra -> {etiquetas} (singleton).

    Cadena de carga: cache local → reconstruir desde emission_probs → None.
    """
    global _word_to_tags
    if _word_to_tags is not None:
        return _word_to_tags

    _word_to_tags = load_cache("word_to_tags")
    if _word_to_tags is not None:
        return _word_to_tags

    # Fallback: reconstruir desde emission_probs (local o Supabase)
    probs = get_emission_probs()
    if probs:
        w2t: dict[str, list] = {}
        for tag, word in probs:
            if word not in w2t:
                w2t[word] = []
            w2t[word].append(tag)
        _word_to_tags = w2t
        save_cache("word_to_tags", w2t)
        logger.info("word_to_tags reconstruido desde emission_probs (%d palabras)", len(w2t))
    return _word_to_tags


def train(smoothing: float = 1.0) -> dict:
    """Calcula probabilidades de emisión y transición a partir del corpus.

    Usa suavizado de Laplace (add-alpha):
    P(word|tag)        = (C(tag, word) + α) / (C(tag) + α * V)
    P(tag_i|tag_{i-1}) = (C(prev, next) + α) / (C(prev) + α * N)

    Args:
        smoothing: Parámetro alpha para suavizado de Laplace (default=1.0).
                   Usar 0.0 para desactivar el suavizado.

    Returns:
        dict con emission_probs, transition_probs y estadísticas.
    """
    global _emission_probs, _transition_probs, _word_to_tags

    data = get_corpus_data()
    if not data:
        raise RuntimeError("El corpus no ha sido procesado. Ejecute primero /api/corpus/upload")

    tag_counts = data["tag_counts"]
    emission_counts = data["emission_counts"]
    transition_counts = data["transition_counts"]
    word_counts = data.get("word_counts", {})

    alpha = smoothing
    vocab_size = len(word_counts) if word_counts else 1
    n_tags = len(tag_counts)

    logger.info(
        f"Calculando probabilidades (Laplace α={alpha}, "
        f"V={vocab_size:,}, N_tags={n_tags})..."
    )

    # ── Probabilidades de emisión: P(word|tag) = (C(tag,word) + α) / (C(tag) + α*V) ──
    emission_probs = {}
    word_to_tags: dict[str, set] = {}

    for (tag, word), count in emission_counts.items():
        tag_total = tag_counts.get(tag, 1)
        emission_probs[(tag, word)] = (count + alpha) / (tag_total + alpha * vocab_size)
        # Construir índice invertido word -> tags
        if word not in word_to_tags:
            word_to_tags[word] = set()
        word_to_tags[word].add(tag)

    # Convertir sets a listas para serialización
    word_to_tags_serializable = {w: list(tags) for w, tags in word_to_tags.items()}

    # ── Probabilidades de transición: P(tag_i|tag_{i-1}) = (C(prev,next) + α) / (C(prev) + α*N) ──
    transition_totals = {}
    for (prev_tag, next_tag), count in transition_counts.items():
        transition_totals[prev_tag] = transition_totals.get(prev_tag, 0) + count

    transition_probs = {}
    for (prev_tag, next_tag), count in transition_counts.items():
        total = transition_totals.get(prev_tag, 1)
        transition_probs[(prev_tag, next_tag)] = (count + alpha) / (total + alpha * n_tags)

    # Guardar en caché
    save_cache("emission_probs", emission_probs)
    save_cache("transition_probs", transition_probs)
    save_cache("word_to_tags", word_to_tags_serializable)
    _emission_probs = emission_probs
    _transition_probs = transition_probs
    _word_to_tags = word_to_tags_serializable

    stats = {
        "emission_count": len(emission_probs),
        "transition_count": len(transition_probs),
        "unique_tags": n_tags,
        "total_tags_in_transitions": len(transition_totals),
        "vocabulary_size": vocab_size,
        "smoothing_alpha": alpha,
    }

    logger.info(
        f"Entrenamiento completado: {len(emission_probs):,} emisiones, "
        f"{len(transition_probs):,} transiciones, Laplace α={alpha}"
    )

    return {
        "emission_probs": emission_probs,
        "transition_probs": transition_probs,
        "stats": stats,
    }


def get_top_emissions(tag: str, limit: int = 20) -> list[dict]:
    """Retorna las palabras más probables para una etiqueta."""
    probs = get_emission_probs()
    if not probs:
        return []

    data = get_corpus_data()
    emission_counts = data["emission_counts"] if data else {}

    entries = []
    for (t, word), prob in probs.items():
        if t == tag:
            count = emission_counts.get((t, word), 0)
            entries.append({"word": word, "probability": prob, "count": count})

    entries.sort(key=lambda x: x["probability"], reverse=True)
    return entries[:limit]


def get_top_transitions(tag: str, direction: str = "from", limit: int = 20) -> list[dict]:
    """Retorna las transiciones más probables desde/hacia una etiqueta."""
    probs = get_transition_probs()
    if not probs:
        return []

    data = get_corpus_data()
    transition_counts = data["transition_counts"] if data else {}

    entries = []
    for (prev_t, next_t), prob in probs.items():
        if direction == "from" and prev_t == tag:
            count = transition_counts.get((prev_t, next_t), 0)
            entries.append({"tag": next_t, "probability": prob, "count": count})
        elif direction == "to" and next_t == tag:
            count = transition_counts.get((prev_t, next_t), 0)
            entries.append({"tag": prev_t, "probability": prob, "count": count})

    entries.sort(key=lambda x: x["probability"], reverse=True)
    return entries[:limit]


def get_emission_table(top_n: int = 30) -> list[dict]:
    """Retorna tabla de emisión para los top-N tags y sus palabras más frecuentes.

    Optimized: builds a tag-indexed dict first (O(n)) instead of scanning
    all emission pairs per tag (O(n*m)).
    """
    probs = get_emission_probs()
    data = get_corpus_data()
    if not probs or not data:
        return []

    tag_counts = data["tag_counts"]
    emission_counts = data["emission_counts"]

    # Top tags por frecuencia
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:top_n]
    top_tag_set = {tag for tag, _ in sorted_tags}

    # Build tag-indexed dict in a single pass over probs
    tag_words: dict[str, list] = {tag: [] for tag in top_tag_set}
    for (t, w), prob in probs.items():
        if t in top_tag_set:
            tag_words[t].append({
                "word": w,
                "count": emission_counts.get((t, w), 0),
                "probability": round(prob, 8),
            })

    result = []
    for tag, tag_count in sorted_tags:
        words = tag_words[tag]
        words.sort(key=lambda x: x["count"], reverse=True)
        result.append({
            "tag": tag,
            "tag_count": tag_count,
            "top_words": words[:20],
        })

    return result


def get_transition_table() -> list[dict]:
    """Retorna la tabla completa de transiciones."""
    probs = get_transition_probs()
    data = get_corpus_data()
    if not probs or not data:
        return []

    transition_counts = data["transition_counts"]

    result = []
    for (prev_t, next_t), prob in probs.items():
        count = transition_counts.get((prev_t, next_t), 0)
        result.append({
            "tag_prev": prev_t,
            "tag_next": next_t,
            "count": count,
            "probability": round(prob, 8),
        })

    result.sort(key=lambda x: x["count"], reverse=True)
    return result
