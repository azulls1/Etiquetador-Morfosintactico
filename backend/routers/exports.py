"""Endpoints de exportación: Excel, Notebook, ZIP, Checklist."""

import logging
import zipfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.schemas import (
    ViterbiRequest,
    ExportChecklistResponse, ExportChecklistItem,
    ExportChecklistItemCreate, ExportChecklistItemUpdate,
)
from models.database import (
    load_export_checklist, save_export_checklist_item,
    update_export_checklist_item, delete_export_checklist_item,
)
from services import excel_exporter, notebook_generator, viterbi_algorithm
from config import EXPORTS_DIR

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/exports", tags=["Exportación"])


@router.get("/emission/excel")
@limiter.limit("10/minute")
def export_emission_excel(request: Request, top_n: int = 30):
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
@limiter.limit("10/minute")
def export_transition_excel(request: Request):
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
@limiter.limit("10/minute")
def export_viterbi_excel(body: ViterbiRequest, request: Request):
    """Ejecuta Viterbi y genera el Excel con la matriz."""
    try:
        result = viterbi_algorithm.viterbi(body.sentence)
        filepath = excel_exporter.generate_viterbi_excel(result)
        return FileResponse(
            filepath,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename="viterbi_resultado.xlsx",
        )
    except (RuntimeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/notebook")
@limiter.limit("10/minute")
def export_notebook(request: Request):
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
        raise HTTPException(status_code=500, detail="Error interno al generar el notebook.")


@router.get("/zip")
@limiter.limit("5/minute")
def export_all_zip(request: Request):
    """Genera y descarga un ZIP con todos los archivos exportados.

    Archivos generados (6 total, cubren los 9 ítems del checklist):
    1. tabla_emision.xlsx            — Checklist ítem 2
    2. tabla_transicion.xlsx         — Checklist ítem 3
    3. viterbi_oracion_1.xlsx        — Checklist ítems 4 y 5
    4. viterbi_oracion_2.xlsx        — Checklist ítems 5 y 6
    5. comparacion_etiquetados.xlsx  — Checklist ítem 7
    6. etiquetador_hmm_viterbi.ipynb — Checklist ítems 1, 8 y 9
    """
    try:
        files_to_zip = []

        # ── 1. Excel de emisión ──
        try:
            filepath = excel_exporter.generate_emission_excel()
            files_to_zip.append(filepath)
        except Exception as e:
            logger.warning(f"No se pudo generar Excel de emisión: {e}")

        # ── 2. Excel de transición ──
        try:
            filepath = excel_exporter.generate_transition_excel()
            files_to_zip.append(filepath)
        except Exception as e:
            logger.warning(f"No se pudo generar Excel de transición: {e}")

        # ── 3 y 4. Viterbi de las oraciones obligatorias ──
        oraciones_obligatorias = [
            ("Habla con el enfermo grave de trasplantes .", "viterbi_oracion_1.xlsx"),
            ("El enfermo grave habla de trasplantes .", "viterbi_oracion_2.xlsx"),
        ]
        viterbi_results = []
        for oracion, filename in oraciones_obligatorias:
            try:
                result = viterbi_algorithm.viterbi(oracion)
                viterbi_results.append(result)
                filepath = excel_exporter.generate_viterbi_excel(result, filename=filename)
                files_to_zip.append(filepath)
            except Exception as e:
                logger.warning(f"No se pudo generar Viterbi Excel para '{oracion}': {e}")

        # ── 5. Comparación de ambos etiquetados ──
        if len(viterbi_results) == 2:
            try:
                filepath = excel_exporter.generate_comparison_excel(
                    viterbi_results[0], viterbi_results[1]
                )
                files_to_zip.append(filepath)
            except Exception as e:
                logger.warning(f"No se pudo generar Excel de comparación: {e}")

        # ── 6. Notebook completo ──
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
        raise HTTPException(status_code=500, detail="Error interno al generar el ZIP.")


# ── Checklist CRUD ─────────────────────────────────────


@router.get("/checklist", response_model=ExportChecklistResponse)
async def get_checklist():
    """Lista todos los items del checklist de entregables."""
    return {"items": load_export_checklist()}


@router.post("/checklist", response_model=ExportChecklistItem, status_code=201)
async def create_checklist_item(body: ExportChecklistItemCreate):
    """Crea un nuevo item en el checklist de entregables."""
    result = save_export_checklist_item(body.label, body.sort_order)
    if not result:
        raise HTTPException(status_code=500, detail="No se pudo crear el item")
    return result


@router.put("/checklist/{item_id}", response_model=ExportChecklistItem)
async def update_checklist_item(item_id: int, body: ExportChecklistItemUpdate):
    """Actualiza un item del checklist de entregables."""
    result = update_export_checklist_item(item_id, label=body.label, sort_order=body.sort_order)
    if not result:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return result


@router.delete("/checklist/{item_id}")
async def delete_checklist_item(item_id: int):
    """Elimina un item del checklist de entregables."""
    if not delete_export_checklist_item(item_id):
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return {"status": "ok", "message": "Item eliminado"}
