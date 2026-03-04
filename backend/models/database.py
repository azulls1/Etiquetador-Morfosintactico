"""Conexión y operaciones con Supabase."""

import json
import logging
from typing import Optional

from config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger(__name__)

_client = None


def get_client():
    """Obtiene el cliente de Supabase (singleton)."""
    global _client
    if _client is None and SUPABASE_KEY:
        try:
            from supabase import create_client
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
            logger.info("Conexión a Supabase establecida")
        except Exception as e:
            logger.warning(f"No se pudo conectar a Supabase: {e}")
    return _client


# ── Corpus Stats ────────────────────────────────────────

def save_corpus_stats(stats: dict) -> bool:
    """Guarda las estadísticas del corpus en Supabase."""
    client = get_client()
    if not client:
        return False
    try:
        client.table("corpus_stats").delete().neq("id", 0).execute()
        client.table("corpus_stats").insert(stats).execute()
        return True
    except Exception as e:
        logger.error(f"Error guardando corpus_stats: {e}")
        return False


def load_corpus_stats() -> Optional[dict]:
    """Carga las estadísticas del corpus desde Supabase."""
    client = get_client()
    if not client:
        return None
    try:
        result = client.table("corpus_stats").select("*").limit(1).execute()
        if result.data:
            return result.data[0]
    except Exception as e:
        logger.error(f"Error cargando corpus_stats: {e}")
    return None


# ── Tag Counts ──────────────────────────────────────────

def save_tag_counts(tag_counts: dict) -> bool:
    """Guarda los conteos de etiquetas en Supabase."""
    client = get_client()
    if not client:
        return False
    try:
        client.table("tag_counts").delete().neq("id", 0).execute()
        rows = [{"tag": tag, "count": count} for tag, count in tag_counts.items()]
        # Insertar en lotes de 500
        for i in range(0, len(rows), 500):
            client.table("tag_counts").insert(rows[i:i + 500]).execute()
        return True
    except Exception as e:
        logger.error(f"Error guardando tag_counts: {e}")
        return False


def load_tag_counts() -> Optional[dict]:
    """Carga los conteos de etiquetas desde Supabase."""
    client = get_client()
    if not client:
        return None
    try:
        result = client.table("tag_counts").select("*").execute()
        if result.data:
            return {row["tag"]: row["count"] for row in result.data}
    except Exception as e:
        logger.error(f"Error cargando tag_counts: {e}")
    return None


# ── Transition Probs ────────────────────────────────────

def save_transition_probs(transition_counts: dict, transition_probs: dict) -> bool:
    """Guarda las probabilidades de transición en Supabase."""
    client = get_client()
    if not client:
        return False
    try:
        client.table("transition_probs").delete().neq("id", 0).execute()
        rows = []
        for (tag_prev, tag_next), prob in transition_probs.items():
            count = transition_counts.get((tag_prev, tag_next), 0)
            rows.append({
                "tag_prev": tag_prev,
                "tag_next": tag_next,
                "probability": prob,
                "count": count,
            })
        for i in range(0, len(rows), 500):
            client.table("transition_probs").insert(rows[i:i + 500]).execute()
        return True
    except Exception as e:
        logger.error(f"Error guardando transition_probs: {e}")
        return False


def load_transition_probs() -> Optional[tuple[dict, dict]]:
    """Carga probabilidades de transición desde Supabase."""
    client = get_client()
    if not client:
        return None
    try:
        result = client.table("transition_probs").select("*").execute()
        if result.data:
            counts = {}
            probs = {}
            for row in result.data:
                key = (row["tag_prev"], row["tag_next"])
                counts[key] = row["count"]
                probs[key] = row["probability"]
            return counts, probs
    except Exception as e:
        logger.error(f"Error cargando transition_probs: {e}")
    return None


# ── Emission Probs ──────────────────────────────────────

def save_emission_probs(emission_counts: dict, emission_probs: dict) -> bool:
    """Guarda las probabilidades de emisión agrupadas por etiqueta."""
    client = get_client()
    if not client:
        return False
    try:
        client.table("emission_probs").delete().neq("id", 0).execute()
        # Agrupar por tag
        by_tag: dict[str, dict] = {}
        for (tag, word), prob in emission_probs.items():
            if tag not in by_tag:
                by_tag[tag] = {}
            by_tag[tag][word] = {
                "p": round(prob, 10),
                "c": emission_counts.get((tag, word), 0),
            }
        rows = []
        for tag, words_data in by_tag.items():
            rows.append({
                "tag": tag,
                "probabilities": json.dumps(words_data),
            })
        for i in range(0, len(rows), 100):
            client.table("emission_probs").insert(rows[i:i + 100]).execute()
        return True
    except Exception as e:
        logger.error(f"Error guardando emission_probs: {e}")
        return False


def load_emission_probs() -> Optional[tuple[dict, dict]]:
    """Carga probabilidades de emisión desde Supabase."""
    client = get_client()
    if not client:
        return None
    try:
        result = client.table("emission_probs").select("*").execute()
        if result.data:
            counts = {}
            probs = {}
            for row in result.data:
                tag = row["tag"]
                words_data = json.loads(row["probabilities"]) if isinstance(row["probabilities"], str) else row["probabilities"]
                for word, data in words_data.items():
                    counts[(tag, word)] = data["c"]
                    probs[(tag, word)] = data["p"]
            return counts, probs
    except Exception as e:
        logger.error(f"Error cargando emission_probs: {e}")
    return None


# ── Tagging Results ─────────────────────────────────────

def save_tagging_result(sentence: str, tokens: list, tags: list) -> bool:
    """Guarda un resultado de etiquetado."""
    client = get_client()
    if not client:
        return False
    try:
        client.table("tagging_results").insert({
            "sentence": sentence,
            "tokens": json.dumps(tokens),
            "tags": json.dumps(tags),
        }).execute()
        return True
    except Exception as e:
        logger.error(f"Error guardando tagging_result: {e}")
        return False


def load_tagging_results(limit: int = 50) -> list:
    """Carga los últimos resultados de etiquetado."""
    client = get_client()
    if not client:
        return []
    try:
        result = (
            client.table("tagging_results")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []
    except Exception as e:
        logger.error(f"Error cargando tagging_results: {e}")
        return []
