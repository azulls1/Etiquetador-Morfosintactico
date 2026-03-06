"""CRUD de preguntas de analisis."""

import logging
from fastapi import APIRouter, HTTPException

from models.schemas import AnalysisQuestion, AnalysisQuestionCreate, AnalysisQuestionUpdate, AnalysisQuestionsResponse
from models.database import load_analysis_questions, save_analysis_question, update_analysis_question, delete_analysis_question

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analysis", tags=["Analisis"])


@router.get("/questions", response_model=AnalysisQuestionsResponse)
async def list_questions():
    """Retorna todas las preguntas de analisis ordenadas."""
    rows = load_analysis_questions()
    return {"questions": rows}


@router.post("/questions", response_model=AnalysisQuestion, status_code=201)
async def create_question(body: AnalysisQuestionCreate):
    """Crea una nueva pregunta de analisis."""
    result = save_analysis_question(body.sort_order, body.question, body.answer_html)
    if not result:
        raise HTTPException(status_code=500, detail="No se pudo guardar la pregunta.")
    return result


@router.put("/questions/{question_id}", response_model=AnalysisQuestion)
async def edit_question(question_id: int, body: AnalysisQuestionUpdate):
    """Actualiza una pregunta de analisis existente."""
    result = update_analysis_question(
        question_id,
        sort_order=body.sort_order,
        question=body.question,
        answer_html=body.answer_html,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada.")
    return result


@router.delete("/questions/{question_id}")
async def remove_question(question_id: int):
    """Elimina una pregunta de analisis por ID."""
    deleted = delete_analysis_question(question_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada.")
    return {"status": "ok", "message": f"Pregunta {question_id} eliminada."}
