"""Celery task for async HMM training."""

import json
import logging
import uuid

from celery_app import celery
from services.redis_cache import (
    invalidate_probabilities,
    set_cached,
    set_train_status,
    KEY_EMISSION_TABLE,
    KEY_TRANSITION_TABLE,
)

logger = logging.getLogger(__name__)


@celery.task(bind=True, name="tasks.train_hmm_model")
def train_hmm_model(self, smoothing: float = 1.0):
    """Run HMM training in background, then invalidate + pre-warm Redis cache."""
    task_id = self.request.id or str(uuid.uuid4())

    set_train_status(task_id, {"state": "RUNNING", "progress": "Training model..."})

    try:
        from services import hmm_trainer
        from services.corpus_parser import get_corpus_data
        from models import database

        result = hmm_trainer.train(smoothing=smoothing)

        set_train_status(task_id, {"state": "RUNNING", "progress": "Saving to Supabase..."})

        data_from_corpus = get_corpus_data()
        if data_from_corpus:
            database.save_transition_probs(
                data_from_corpus["transition_counts"],
                result["transition_probs"],
            )
            database.save_emission_probs(
                data_from_corpus["emission_counts"],
                result["emission_probs"],
            )

        # Invalidate old cache
        invalidate_probabilities()

        # Pre-warm: compute tables and store in Redis
        set_train_status(task_id, {"state": "RUNNING", "progress": "Pre-warming cache..."})

        emission_table = hmm_trainer.get_emission_table(top_n=30)
        transition_table = hmm_trainer.get_transition_table()

        set_cached(KEY_EMISSION_TABLE, json.dumps({"entries": emission_table}))
        set_cached(KEY_TRANSITION_TABLE, json.dumps({"entries": transition_table[:2000]}))

        stats = result["stats"]
        set_train_status(task_id, {
            "state": "COMPLETED",
            "stats": stats,
            "message": "Modelo HMM entrenado exitosamente.",
        })

        return {"status": "completed", "stats": stats}

    except Exception as exc:
        logger.exception("Training task failed")
        set_train_status(task_id, {
            "state": "FAILED",
            "error": str(exc),
        })
        raise
