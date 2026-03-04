"""Endpoints de probabilidades de emisión y transición."""

import logging
from fastapi import APIRouter, HTTPException

from models.schemas import ProbabilityResponse, StatusResponse
from services import hmm_trainer
from services.corpus_parser import get_corpus_data
from models import database

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/probabilities", tags=["Probabilidades"])


@router.post("/train", response_model=StatusResponse)
async def train_model(smoothing: float = 1.0):
    """Calcula las probabilidades de emisión y transición.

    Query params:
        smoothing: Parámetro alpha de Laplace (default=1.0). Usar 0.0 para MLE puro.
    """
    try:
        result = hmm_trainer.train(smoothing=smoothing)

        # Guardar en Supabase
        data_from_corpus = get_corpus_data()
        if data_from_corpus:
            database.save_transition_probs(
                data_from_corpus["transition_counts"],
                result["transition_probs"],
            )

        return StatusResponse(
            status="completed",
            message="Modelo HMM entrenado exitosamente.",
            detail=result["stats"],
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/emission", response_model=ProbabilityResponse)
async def get_emission_probs(tag: str = None, limit: int = 20):
    """Retorna probabilidades de emisión.

    Query params:
        tag: Filtrar por etiqueta específica.
        limit: Número de resultados por etiqueta.
    """
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
async def get_transition_probs(tag: str = None, direction: str = "from", limit: int = 20):
    """Retorna probabilidades de transición.

    Query params:
        tag: Filtrar por etiqueta.
        direction: 'from' (desde) o 'to' (hacia) la etiqueta.
        limit: Número de resultados.
    """
    if tag:
        entries = hmm_trainer.get_top_transitions(tag, direction, limit)
        if not entries:
            raise HTTPException(status_code=404, detail=f"Etiqueta '{tag}' no encontrada.")
        return ProbabilityResponse(total_entries=len(entries), entries=entries)

    table = hmm_trainer.get_transition_table()
    if not table:
        raise HTTPException(status_code=404, detail="No hay datos de transición. Entrene el modelo primero.")

    # Limitar resultados
    limited = table[:500]
    return ProbabilityResponse(total_entries=len(table), entries=limited)


@router.get("/emission/table")
async def get_emission_table(top_n: int = 30):
    """Retorna la tabla completa de emisión para exportación."""
    table = hmm_trainer.get_emission_table(top_n)
    if not table:
        raise HTTPException(status_code=404, detail="No hay datos de emisión.")
    return {"entries": table}


@router.get("/transition/table")
async def get_transition_table():
    """Retorna la tabla completa de transición para exportación."""
    table = hmm_trainer.get_transition_table()
    if not table:
        raise HTTPException(status_code=404, detail="No hay datos de transición.")
    return {"entries": table[:2000]}
