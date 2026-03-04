"""Endpoints de exportación: Excel, Notebook, ZIP."""

import logging
import zipfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from models.schemas import ExportRequest, ViterbiRequest
from services import excel_exporter, notebook_generator, viterbi_algorithm
from config import EXPORTS_DIR

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/exports", tags=["Exportación"])


@router.get("/emission/excel")
async def export_emission_excel(top_n: int = 30):
    """Genera y descarga el Excel de probabilidades de emisión."""
    try:
        filepath = excel_exporter.generate_emission_excel(top_n)
        return FileResponse(
            filepath,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="tabla_emision.xlsx",
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transition/excel")
async def export_transition_excel():
    """Genera y descarga el Excel de probabilidades de transición."""
    try:
        filepath = excel_exporter.generate_transition_excel()
        return FileResponse(
            filepath,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="tabla_transicion.xlsx",
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/viterbi/excel")
async def export_viterbi_excel(request: ViterbiRequest):
    """Ejecuta Viterbi y genera el Excel con la matriz."""
    try:
        result = viterbi_algorithm.viterbi(request.sentence)
        filepath = excel_exporter.generate_viterbi_excel(result)
        return FileResponse(
            filepath,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="viterbi_resultado.xlsx",
        )
    except (RuntimeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/notebook")
async def export_notebook():
    """Genera y descarga el Jupyter Notebook del proyecto."""
    try:
        filepath = notebook_generator.generate_notebook()
        return FileResponse(
            filepath,
            media_type="application/x-ipynb+json",
            filename="etiquetador_hmm_viterbi.ipynb",
        )
    except Exception as e:
        logger.error(f"Error generando notebook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/zip")
async def export_all_zip():
    """Genera y descarga un ZIP con todos los archivos exportados."""
    try:
        # Generar todos los archivos
        files_to_zip = []

        try:
            filepath = excel_exporter.generate_emission_excel()
            files_to_zip.append(filepath)
        except Exception as e:
            logger.warning(f"No se pudo generar Excel de emisión: {e}")

        try:
            filepath = excel_exporter.generate_transition_excel()
            files_to_zip.append(filepath)
        except Exception as e:
            logger.warning(f"No se pudo generar Excel de transición: {e}")

        try:
            filepath = notebook_generator.generate_notebook()
            files_to_zip.append(filepath)
        except Exception as e:
            logger.warning(f"No se pudo generar notebook: {e}")

        if not files_to_zip:
            raise HTTPException(
                status_code=400,
                detail="No se pudo generar ningún archivo. Verifique que el corpus esté procesado."
            )

        # Crear ZIP
        zip_path = EXPORTS_DIR / "etiquetador_hmm_entregables.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for fp in files_to_zip:
                zf.write(fp, Path(fp).name)

        return FileResponse(
            str(zip_path),
            media_type="application/zip",
            filename="etiquetador_hmm_entregables.zip",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando ZIP: {e}")
        raise HTTPException(status_code=500, detail=str(e))
