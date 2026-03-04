"""Endpoint de etiquetado con el algoritmo de Viterbi."""

import logging
from fastapi import APIRouter, HTTPException

from models.schemas import ViterbiRequest, ViterbiResult
from services import viterbi_algorithm
from models import database

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/viterbi", tags=["Viterbi"])


@router.post("/tag", response_model=ViterbiResult)
async def tag_sentence(request: ViterbiRequest):
    """Etiqueta una oración usando el algoritmo de Viterbi.

    Body:
        sentence: Oración a etiquetar.

    Returns:
        Resultado completo con tokens, etiquetas, matriz de Viterbi, etc.
    """
    if not request.sentence.strip():
        raise HTTPException(status_code=400, detail="La oración no puede estar vacía.")

    if len(request.sentence) > 1000:
        raise HTTPException(status_code=400, detail="La oración excede el límite de 1000 caracteres.")

    try:
        result = viterbi_algorithm.viterbi(request.sentence)

        # Guardar resultado en Supabase
        database.save_tagging_result(
            result["sentence"],
            result["tokens"],
            result["tags"],
        )

        return ViterbiResult(**result)

    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history")
async def get_history(limit: int = 50):
    """Retorna el historial de oraciones etiquetadas."""
    results = database.load_tagging_results(limit)
    return {"results": results}
