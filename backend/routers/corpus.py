"""Endpoints de corpus: carga, estadísticas y búsqueda."""

import logging
import shutil
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, Request, UploadFile
from slowapi import Limiter
from slowapi.util import get_remote_address

from config import CORPUS_DIR
from models.schemas import (
    CorpusUploadRequest, CorpusStats, CorpusSearchRequest,
    CorpusSearchResult, StatusResponse, TagDistributionResponse,
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
        # Guardar en Supabase
        stats = result["stats"].copy()
        stats["total_files"] = stats.pop("processed_files", 0)
        database.save_corpus_stats(stats)
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
        None,  # Siempre usa CORPUS_DIR del servidor
        body.max_files,
    )

    return StatusResponse(
        status="started",
        message="Procesamiento del corpus iniciado en segundo plano.",
        detail={"max_files": body.max_files},
    )


@router.post("/upload-file", response_model=StatusResponse)
async def upload_single_file(
    request: Request,
    file: UploadFile = File(...),
):
    """Recibe un solo archivo del corpus y lo guarda en el directorio."""
    if not file.filename or not file.filename.startswith("spanishEtiquetado"):
        raise HTTPException(
            status_code=400,
            detail=f"Archivo '{file.filename}' no es un archivo válido del corpus."
        )

    corpus_path = Path(CORPUS_DIR)
    corpus_path.mkdir(parents=True, exist_ok=True)

    dest = corpus_path / file.filename
    CHUNK_SIZE = 1024 * 1024  # 1 MB chunks
    total_bytes = 0
    with open(dest, "wb") as out:
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            out.write(chunk)
            total_bytes += len(chunk)
    await file.close()

    logger.info(f"Archivo guardado: {dest} ({total_bytes / 1024 / 1024:.1f} MB)")

    return StatusResponse(
        status="ok",
        message=f"Archivo '{file.filename}' guardado.",
        detail={"filename": file.filename, "size_bytes": total_bytes},
    )


@router.post("/process", response_model=StatusResponse)
@limiter.limit("3/minute")
async def process_corpus_endpoint(
    request: Request,
    background_tasks: BackgroundTasks,
    max_files: int | None = None,
):
    """Inicia el procesamiento de los archivos ya guardados en el directorio del corpus."""
    if _upload_status["running"]:
        raise HTTPException(
            status_code=409,
            detail="Ya hay un procesamiento de corpus en curso."
        )

    corpus_path = Path(CORPUS_DIR)
    if not corpus_path.exists():
        raise HTTPException(status_code=400, detail="No hay archivos del corpus para procesar.")

    files = [f for f in corpus_path.iterdir() if f.is_file() and f.name.startswith("spanishEtiquetado")]
    if not files:
        raise HTTPException(status_code=400, detail="No se encontraron archivos spanishEtiquetado.")

    background_tasks.add_task(_process_corpus, None, max_files)

    return StatusResponse(
        status="started",
        message=f"Procesamiento iniciado con {len(files)} archivos.",
        detail={"files_count": len(files), "max_files": max_files},
    )


@router.get("/scan", response_model=StatusResponse)
async def scan_corpus_dir():
    """Escanea el directorio del corpus y retorna info de archivos disponibles."""
    corpus_path = Path(CORPUS_DIR)
    if not corpus_path.exists():
        return StatusResponse(
            status="empty",
            message="Directorio del corpus no existe.",
            detail={"path": str(corpus_path), "files_count": 0, "files": []},
        )

    files = sorted([
        f.name for f in corpus_path.iterdir()
        if f.is_file() and f.name.startswith("spanishEtiquetado")
    ])

    if not files:
        return StatusResponse(
            status="empty",
            message="No se encontraron archivos del corpus.",
            detail={"path": str(corpus_path), "files_count": 0, "files": []},
        )

    return StatusResponse(
        status="ready",
        message=f"{len(files)} archivos del corpus detectados.",
        detail={"path": str(corpus_path), "files_count": len(files), "files": files},
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
    word: str = Query(..., min_length=1, max_length=100, description="Palabra a buscar"),
    limit: int = Query(20, ge=1, le=100, description="Máximo de etiquetas a retornar"),
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


@router.get("/tags", response_model=TagDistributionResponse)
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
