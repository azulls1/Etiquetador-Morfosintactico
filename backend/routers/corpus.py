"""Endpoints de corpus: carga, estadísticas y búsqueda."""

import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.schemas import (
    CorpusUploadRequest, CorpusStats, CorpusSearchRequest,
    CorpusSearchResult, StatusResponse,
)
from services import corpus_parser
from models import database

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/corpus", tags=["Corpus"])

# Estado de la carga
_upload_status = {"running": False, "progress": 0, "total": 0, "current_file": ""}


def _process_corpus(corpus_dir, max_files):
    """Tarea en segundo plano para procesar el corpus."""
    global _upload_status
    _upload_status["running"] = True

    def progress_cb(current, total, filename):
        _upload_status["progress"] = current
        _upload_status["total"] = total
        _upload_status["current_file"] = filename

    try:
        result = corpus_parser.parse_corpus(
            corpus_dir=corpus_dir,
            max_files=max_files,
            progress_callback=progress_cb,
        )
        # Guardar estadísticas en Supabase
        database.save_corpus_stats(result["stats"])
        database.save_tag_counts(result["tag_counts"])
        logger.info("Corpus procesado y guardado exitosamente")
    except Exception as e:
        logger.error(f"Error procesando corpus: {e}")
    finally:
        _upload_status["running"] = False


@router.post("/upload", response_model=StatusResponse)
@limiter.limit("3/minute")
async def upload_corpus(
    body: CorpusUploadRequest,
    request: Request,
    background_tasks: BackgroundTasks,
):
    """Inicia el procesamiento del corpus en segundo plano."""
    if _upload_status["running"]:
        raise HTTPException(
            status_code=409,
            detail="Ya hay un procesamiento de corpus en curso."
        )

    background_tasks.add_task(
        _process_corpus,
        None,  # Siempre usa CORPUS_DIR del servidor (seguridad: no aceptar paths del cliente)
        body.max_files,
    )

    return StatusResponse(
        status="started",
        message="Procesamiento del corpus iniciado en segundo plano.",
        detail={"corpus_dir": body.corpus_dir or "default"},
    )


@router.get("/upload/status", response_model=StatusResponse)
async def upload_status():
    """Consulta el estado del procesamiento del corpus."""
    if _upload_status["running"]:
        return StatusResponse(
            status="running",
            message=f"Procesando archivo {_upload_status['progress']}/{_upload_status['total']}: {_upload_status['current_file']}",
            detail=dict(_upload_status),
        )

    data = corpus_parser.get_corpus_data()
    if data:
        return StatusResponse(
            status="completed",
            message="Corpus procesado exitosamente.",
            detail=data["stats"],
        )

    return StatusResponse(
        status="idle",
        message="No se ha procesado ningún corpus.",
    )


@router.get("/stats", response_model=CorpusStats)
async def get_stats():
    """Retorna las estadísticas del corpus procesado."""
    stats = corpus_parser.get_stats()
    return CorpusStats(**stats)


@router.get("/search", response_model=CorpusSearchResult)
async def search_word_get(
    word: str,
    limit: int = 20,
):
    """Busca una palabra en el corpus y retorna sus etiquetas.

    Query params:
        word: Palabra a buscar.
        limit: Numero maximo de etiquetas a retornar.
    """
    result = corpus_parser.search_word(word, limit)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Palabra '{word}' no encontrada en el corpus."
        )
    return CorpusSearchResult(**result)


@router.post("/search", response_model=CorpusSearchResult, deprecated=True)
async def search_word_post(request: CorpusSearchRequest):
    """Busca una palabra en el corpus (deprecated: usar GET /search?word=X)."""
    result = corpus_parser.search_word(request.word, request.limit)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Palabra '{request.word}' no encontrada en el corpus."
        )
    return CorpusSearchResult(**result)


@router.get("/tags", response_model=dict)
async def get_tag_distribution():
    """Retorna la distribución de etiquetas del corpus."""
    data = corpus_parser.get_corpus_data()
    if not data:
        raise HTTPException(status_code=404, detail="Corpus no procesado.")

    tag_counts = data["tag_counts"]
    total = sum(tag_counts.values())

    distribution = []
    for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True):
        distribution.append({
            "tag": tag,
            "count": count,
            "percentage": round(count / total * 100, 4),
        })

    return {"total_tokens": total, "tags": distribution}
