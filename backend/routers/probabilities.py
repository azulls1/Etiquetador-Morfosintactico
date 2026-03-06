"""Endpoints de probabilidades de emisión y transición."""

import json
import logging
import uuid
from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.schemas import ProbabilityResponse, ProbabilityTableResponse, StatusResponse
from services import hmm_trainer
from services.corpus_parser import get_corpus_data
from services.redis_cache import (
    get_cached,
    set_cached,
    get_train_status,
    set_train_status,
    KEY_EMISSION_TABLE,
    KEY_TRANSITION_TABLE,
)
from models import database

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/probabilities", tags=["Probabilidades"])


@router.post("/train", response_model=StatusResponse)
@limiter.limit("5/minute")
def train_model(request: Request, smoothing: float = 1.0):
    """Entrena el modelo HMM.

    Si Celery está disponible, ejecuta en background y retorna task_id.
    Si no, ejecuta síncronamente (comportamiento original).
    """
    try:
        from tasks.training import train_hmm_model
        result = train_hmm_model.delay(smoothing)
        task_id = result.id
        set_train_status(task_id, {"state": "PENDING", "progress": "Queued..."})
        return StatusResponse(
            status="running",
            message="Entrenamiento iniciado en background.",
            detail={"task_id": task_id},
        )
    except Exception as exc:
        logger.info("Celery unavailable (%s), falling back to sync training", exc)

    # Sync fallback
    try:
        result = hmm_trainer.train(smoothing=smoothing)

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

        # Pre-warm Redis cache
        _warm_cache()

        return StatusResponse(
            status="completed",
            message="Modelo HMM entrenado exitosamente.",
            detail=result["stats"],
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/train/status/{task_id}")
async def get_training_status(task_id: str):
    """Polling endpoint for async training progress."""
    status = get_train_status(task_id)
    if status:
        return status

    # Try Celery result backend as fallback
    try:
        from celery_app import celery as celery_app
        result = celery_app.AsyncResult(task_id)
        if result.state == "PENDING":
            return {"state": "PENDING", "progress": "Queued..."}
        elif result.state == "STARTED":
            return {"state": "RUNNING", "progress": "Training..."}
        elif result.state == "SUCCESS":
            return {"state": "COMPLETED", "stats": result.result.get("stats", {}),
                    "message": "Modelo HMM entrenado exitosamente."}
        elif result.state == "FAILURE":
            return {"state": "FAILED", "error": str(result.result)}
        return {"state": result.state}
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Task not found")


@router.get("/emission", response_model=ProbabilityResponse)
async def get_emission_probs(tag: str = None, limit: int = 20):
    """Retorna probabilidades de emisión."""
    if tag:
        entries = hmm_trainer.get_top_emissions(tag, limit)
        if not entries:
            raise HTTPException(status_code=404, detail=f"Etiqueta '{tag}' no encontrada.")
        return ProbabilityResponse(total_entries=len(entries), entries=entries)

    table = hmm_trainer.get_emission_table(top_n=30)
    if not table:
        raise HTTPException(status_code=404, detail="No hay datos de emisión. Entrene el modelo primero.")
    return ProbabilityResponse(total_entries=len(table), entries=table)


@router.get("/transition", response_model=ProbabilityResponse)
async def get_transition_probs(tag: str = None, direction: Literal["from", "to"] = "from", limit: int = 20):
    """Retorna probabilidades de transición."""
    if tag:
        entries = hmm_trainer.get_top_transitions(tag, direction, limit)
        if not entries:
            raise HTTPException(status_code=404, detail=f"Etiqueta '{tag}' no encontrada.")
        return ProbabilityResponse(total_entries=len(entries), entries=entries)

    table = hmm_trainer.get_transition_table()
    if not table:
        raise HTTPException(status_code=404, detail="No hay datos de transición. Entrene el modelo primero.")

    limited = table[:500]
    return ProbabilityResponse(total_entries=len(table), entries=limited)


@router.get("/emission/table", response_model=ProbabilityTableResponse)
async def get_emission_table(top_n: int = 30):
    """Retorna la tabla completa de emisión — Redis cached."""
    cached = get_cached(KEY_EMISSION_TABLE)
    if cached:
        return json.loads(cached)

    table = hmm_trainer.get_emission_table(top_n)
    if not table:
        raise HTTPException(status_code=404, detail="No hay datos de emisión.")

    payload = {"entries": table}
    set_cached(KEY_EMISSION_TABLE, json.dumps(payload))
    return payload


@router.get("/transition/table", response_model=ProbabilityTableResponse)
async def get_transition_table():
    """Retorna la tabla completa de transición — Redis cached."""
    cached = get_cached(KEY_TRANSITION_TABLE)
    if cached:
        return json.loads(cached)

    table = hmm_trainer.get_transition_table()
    if not table:
        raise HTTPException(status_code=404, detail="No hay datos de transición.")

    payload = {"entries": table[:2000]}
    set_cached(KEY_TRANSITION_TABLE, json.dumps(payload))
    return payload


def _warm_cache() -> None:
    """Pre-compute and cache both tables after training."""
    try:
        emission_table = hmm_trainer.get_emission_table(top_n=30)
        transition_table = hmm_trainer.get_transition_table()
        if emission_table:
            set_cached(KEY_EMISSION_TABLE, json.dumps({"entries": emission_table}))
        if transition_table:
            set_cached(KEY_TRANSITION_TABLE, json.dumps({"entries": transition_table[:2000]}))
    except Exception:
        logger.warning("Failed to pre-warm Redis cache", exc_info=True)
