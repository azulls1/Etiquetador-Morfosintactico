"""Conexión y operaciones con Supabase via SQL directo."""

import json
import logging
from typing import Optional

import requests

from config import SUPABASE_URL, SUPABASE_KEY, TABLE_PREFIX

logger = logging.getLogger(__name__)

# Nombres de tablas con prefijo
T_CORPUS_STATS = f"{TABLE_PREFIX}corpus_stats"
T_TAG_COUNTS = f"{TABLE_PREFIX}tag_counts"
T_TRANSITION_PROBS = f"{TABLE_PREFIX}transition_probs"
T_EMISSION_PROBS = f"{TABLE_PREFIX}emission_probs"
T_TAGGING_RESULTS = f"{TABLE_PREFIX}tagging_results"


def _sql(query: str, params: dict | None = None) -> list[dict] | None:
    """Ejecuta SQL contra Supabase via /pg/query y devuelve filas."""
    if not SUPABASE_KEY:
        return None
    try:
        resp = requests.post(
            f"{SUPABASE_URL}/pg/query",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
            },
            json={"query": query},
            timeout=30,
        )
        if resp.status_code == 200:
            return resp.json()
        logger.error("SQL error %d: %s", resp.status_code, resp.text[:200])
        return None
    except Exception as e:
        logger.error("SQL request failed: %s", e)
        return None


def _escape(value: str) -> str:
    """Escapa comillas simples para SQL."""
    return value.replace("'", "''")


# ── Corpus Stats ────────────────────────────────────────


def save_corpus_stats(stats: dict) -> bool:
    """Guarda las estadísticas del corpus en Supabase."""
    _sql(f"DELETE FROM {T_CORPUS_STATS}")
    cols = ["total_tokens", "total_sentences", "unique_words", "unique_tags", "total_files"]
    vals = [str(stats.get(c, 0)) for c in cols]
    result = _sql(
        f"INSERT INTO {T_CORPUS_STATS} ({', '.join(cols)}) "
        f"VALUES ({', '.join(vals)}) RETURNING id"
    )
    if result:
        logger.info("Corpus stats guardados en Supabase")
        return True
    return False


def load_corpus_stats() -> Optional[dict]:
    """Carga las estadísticas del corpus desde Supabase."""
    result = _sql(f"SELECT * FROM {T_CORPUS_STATS} ORDER BY id DESC LIMIT 1")
    if result:
        return result[0]
    return None


# ── Tag Counts ──────────────────────────────────────────


def save_tag_counts(tag_counts: dict) -> bool:
    """Guarda los conteos de etiquetas en Supabase."""
    _sql(f"DELETE FROM {T_TAG_COUNTS}")
    if not tag_counts:
        return True
    rows = []
    for tag, count in tag_counts.items():
        rows.append(f"('{_escape(tag)}', {count})")
    # Insert in batches of 500
    for i in range(0, len(rows), 500):
        batch = rows[i:i + 500]
        result = _sql(
            f"INSERT INTO {T_TAG_COUNTS} (tag, count) VALUES {', '.join(batch)}"
        )
        if result is None:
            return False
    logger.info("Tag counts guardados: %d etiquetas", len(tag_counts))
    return True


def load_tag_counts() -> Optional[dict]:
    """Carga los conteos de etiquetas desde Supabase."""
    result = _sql(f"SELECT tag, count FROM {T_TAG_COUNTS}")
    if result:
        return {row["tag"]: row["count"] for row in result}
    return None


# ── Transition Probs ────────────────────────────────────


def save_transition_probs(transition_counts: dict, transition_probs: dict) -> bool:
    """Guarda las probabilidades de transición en Supabase."""
    _sql(f"DELETE FROM {T_TRANSITION_PROBS}")
    if not transition_probs:
        return True
    rows = []
    for (tag_prev, tag_next), prob in transition_probs.items():
        count = transition_counts.get((tag_prev, tag_next), 0)
        rows.append(
            f"('{_escape(tag_prev)}', '{_escape(tag_next)}', {prob}, {count})"
        )
    for i in range(0, len(rows), 500):
        batch = rows[i:i + 500]
        result = _sql(
            f"INSERT INTO {T_TRANSITION_PROBS} (tag_prev, tag_next, probability, count) "
            f"VALUES {', '.join(batch)}"
        )
        if result is None:
            return False
    logger.info("Transition probs guardadas: %d filas", len(rows))
    return True


def load_transition_probs() -> Optional[tuple[dict, dict]]:
    """Carga probabilidades de transición desde Supabase."""
    result = _sql(f"SELECT tag_prev, tag_next, probability, count FROM {T_TRANSITION_PROBS}")
    if result:
        counts = {}
        probs = {}
        for row in result:
            key = (row["tag_prev"], row["tag_next"])
            counts[key] = row["count"]
            probs[key] = row["probability"]
        return counts, probs
    return None


# ── Emission Probs ──────────────────────────────────────


def save_emission_probs(emission_counts: dict, emission_probs: dict) -> bool:
    """Guarda las probabilidades de emisión agrupadas por etiqueta."""
    _sql(f"DELETE FROM {T_EMISSION_PROBS}")
    if not emission_probs:
        return True
    by_tag: dict[str, dict] = {}
    for (tag, word), prob in emission_probs.items():
        if tag not in by_tag:
            by_tag[tag] = {}
        by_tag[tag][word] = {
            "p": round(prob, 10),
            "c": emission_counts.get((tag, word), 0),
        }
    # Limit to top 500 words per tag (by count) to avoid oversized payloads
    MAX_WORDS_PER_TAG = 500
    for tag in by_tag:
        words_data = by_tag[tag]
        if len(words_data) > MAX_WORDS_PER_TAG:
            top = sorted(words_data.items(), key=lambda x: x[1]["c"], reverse=True)[:MAX_WORDS_PER_TAG]
            by_tag[tag] = dict(top)
    rows = []
    for tag, words_data in by_tag.items():
        json_str = _escape(json.dumps(words_data, ensure_ascii=False))
        rows.append(f"('{_escape(tag)}', '{json_str}'::jsonb)")
    for i in range(0, len(rows), 10):
        batch = rows[i:i + 10]
        result = _sql(
            f"INSERT INTO {T_EMISSION_PROBS} (tag, probabilities) "
            f"VALUES {', '.join(batch)}"
        )
        if result is None:
            logger.warning("Failed to insert emissions batch %d", i // 10 + 1)
            return False
    logger.info("Emission probs guardadas: %d etiquetas", len(by_tag))
    return True


def load_emission_probs() -> Optional[tuple[dict, dict]]:
    """Carga probabilidades de emisión desde Supabase."""
    result = _sql(f"SELECT tag, probabilities FROM {T_EMISSION_PROBS}")
    if result:
        counts = {}
        probs = {}
        for row in result:
            tag = row["tag"]
            words_data = row["probabilities"]
            if isinstance(words_data, str):
                words_data = json.loads(words_data)
            for word, data in words_data.items():
                counts[(tag, word)] = data["c"]
                probs[(tag, word)] = data["p"]
        return counts, probs
    return None


# ── Tagging Results ─────────────────────────────────────


def save_tagging_result(sentence: str, tokens: list, tags: list) -> bool:
    """Guarda un resultado de etiquetado."""
    tokens_json = _escape(json.dumps(tokens, ensure_ascii=False))
    tags_json = _escape(json.dumps(tags, ensure_ascii=False))
    result = _sql(
        f"INSERT INTO {T_TAGGING_RESULTS} (sentence, tokens, tags) "
        f"VALUES ('{_escape(sentence)}', '{tokens_json}'::jsonb, '{tags_json}'::jsonb) "
        f"RETURNING id"
    )
    return result is not None and len(result) > 0


def load_tagging_results(limit: int = 50) -> list:
    """Carga los últimos resultados de etiquetado."""
    result = _sql(
        f"SELECT * FROM {T_TAGGING_RESULTS} "
        f"ORDER BY created_at DESC LIMIT {limit}"
    )
    return result or []
