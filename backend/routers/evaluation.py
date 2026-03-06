"""Endpoints de evaluacion cuantitativa del modelo HMM."""

import logging
from fastapi import APIRouter, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.schemas import EvaluationResult
from services import evaluation

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/evaluation", tags=["Evaluacion"])


@router.post("/evaluate", response_model=EvaluationResult)
@limiter.limit("5/minute")
def run_evaluation(
    request: Request,
    test_ratio: float = Query(0.1, ge=0.01, le=0.5, description="Proporcion del corpus para test (0.01-0.5)"),
    smoothing: float = Query(1.0, ge=0.0, le=10.0, description="Parametro alpha de Laplace"),
    seed: int = Query(42, ge=0, description="Semilla para reproducibilidad del split"),
    max_files: int = Query(None, ge=1, description="Limite de archivos del corpus a procesar"),
    max_sentences: int = Query(None, ge=50, description="Limite de oraciones totales a usar del corpus"),
    top_n_tags: int = Query(20, ge=5, le=50, description="Cantidad de tags para la confusion matrix"),
):
    """Ejecuta evaluacion cuantitativa completa del modelo HMM.

    Realiza train/test split sobre el corpus, entrena un modelo HMM
    solo con los datos de entrenamiento, y evalua predicciones sobre
    los datos de test.

    Retorna:
    - **Accuracy global** del etiquetador
    - **Precision, Recall, F1-score** por etiqueta y promedios macro/weighted
    - **Confusion matrix** para los top N tags
    - **Distribucion de accuracy** por oracion
    - **Parametros del modelo** utilizado
    """
    try:
        result = evaluation.evaluate(
            test_ratio=test_ratio,
            smoothing=smoothing,
            seed=seed,
            max_files=max_files,
            max_sentences=max_sentences,
            top_n_tags=top_n_tags,
        )
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Corpus no encontrado. Verifique que esté disponible.")
    except RuntimeError:
        raise HTTPException(status_code=400, detail="Error al ejecutar la evaluación. Verifique que el corpus esté procesado.")
