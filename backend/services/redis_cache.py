"""Redis cache with graceful degradation — returns None if Redis is unavailable."""

import json
import logging
from typing import Optional

import redis

from config import REDIS_URL

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None
_redis_unavailable = False

KEY_EMISSION_TABLE = "prob:emission_table"
KEY_TRANSITION_TABLE = "prob:transition_table"
KEY_TRAIN_STATUS_PREFIX = "train:status:"

DEFAULT_TTL = 86400  # 24 h


def get_redis() -> Optional[redis.Redis]:
    """Lazy singleton — returns None if Redis can't connect."""
    global _redis_client, _redis_unavailable
    if _redis_unavailable:
        return None
    if _redis_client is not None:
        return _redis_client
    try:
        client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        _redis_client = client
        logger.info("Redis connected at %s", REDIS_URL)
        return _redis_client
    except Exception as exc:
        logger.warning("Redis unavailable (%s) — falling back to direct compute", exc)
        _redis_unavailable = True
        return None


def get_cached(key: str) -> Optional[str]:
    """Get a JSON string from Redis. Returns None on miss or error."""
    r = get_redis()
    if r is None:
        return None
    try:
        return r.get(key)
    except Exception:
        return None


def set_cached(key: str, value: str, ttl: int = DEFAULT_TTL) -> bool:
    """Store a JSON string in Redis. Returns False on error."""
    r = get_redis()
    if r is None:
        return False
    try:
        r.set(key, value, ex=ttl)
        return True
    except Exception:
        return False


def invalidate_probabilities() -> None:
    """Delete all cached probability tables."""
    r = get_redis()
    if r is None:
        return
    try:
        r.delete(KEY_EMISSION_TABLE, KEY_TRANSITION_TABLE)
        logger.info("Redis probability cache invalidated")
    except Exception:
        pass


def set_train_status(task_id: str, status: dict) -> None:
    """Store training task status (TTL 1 h)."""
    r = get_redis()
    if r is None:
        return
    try:
        r.set(f"{KEY_TRAIN_STATUS_PREFIX}{task_id}", json.dumps(status), ex=3600)
    except Exception:
        pass


def get_train_status(task_id: str) -> Optional[dict]:
    """Retrieve training task status."""
    r = get_redis()
    if r is None:
        return None
    try:
        raw = r.get(f"{KEY_TRAIN_STATUS_PREFIX}{task_id}")
        return json.loads(raw) if raw else None
    except Exception:
        return None
