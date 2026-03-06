"""CRUD de oraciones rápidas (quick sentences)."""

import logging
from fastapi import APIRouter, HTTPException

from models.schemas import QuickSentence, QuickSentenceCreate, QuickSentenceUpdate, QuickSentencesResponse
from models.database import load_quick_sentences, save_quick_sentence, update_quick_sentence, delete_quick_sentence

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/sentences", tags=["Oraciones rápidas"])


@router.get("", response_model=QuickSentencesResponse)
async def list_sentences():
    """Retorna todas las oraciones rápidas ordenadas."""
    rows = load_quick_sentences()
    return {"sentences": rows}


@router.post("", response_model=QuickSentence, status_code=201)
async def create_sentence(body: QuickSentenceCreate):
    """Crea una nueva oración rápida."""
    result = save_quick_sentence(body.sentence, body.sort_order)
    if not result:
        raise HTTPException(status_code=500, detail="No se pudo guardar la oración.")
    return result


@router.put("/{sentence_id}", response_model=QuickSentence)
async def edit_sentence(sentence_id: int, body: QuickSentenceUpdate):
    """Actualiza una oración rápida existente."""
    result = update_quick_sentence(sentence_id, sentence=body.sentence, sort_order=body.sort_order)
    if not result:
        raise HTTPException(status_code=404, detail="Oración no encontrada.")
    return result


@router.delete("/{sentence_id}")
async def remove_sentence(sentence_id: int):
    """Elimina una oración rápida por ID."""
    deleted = delete_quick_sentence(sentence_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Oración no encontrada.")
    return {"status": "ok", "message": f"Oración {sentence_id} eliminada."}
