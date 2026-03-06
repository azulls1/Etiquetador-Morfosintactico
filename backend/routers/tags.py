"""Endpoint de referencia de etiquetas EAGLES."""

import logging
from fastapi import APIRouter

from models.schemas import TagDescriptionResponse, CategoriesResponse, DescribeBatchResponse
from services.eagles_tags import describe_tag, get_all_categories, get_tag_colors

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tags", tags=["Etiquetas EAGLES"])


@router.get("/describe/{tag}", response_model=TagDescriptionResponse)
async def describe_eagles_tag(tag: str):
    """Describe una etiqueta EAGLES.

    Path params:
        tag: Etiqueta EAGLES (ej: "VMIP3S0", "NCMS000", "Fp").
    """
    result = describe_tag(tag)
    return result


@router.get("/categories", response_model=CategoriesResponse)
async def get_categories():
    """Retorna todas las categorías EAGLES principales con subcategorías."""
    return {"categories": get_all_categories()}


@router.post("/describe-batch", response_model=DescribeBatchResponse)
async def describe_batch(tags: list[str]):
    """Describe múltiples etiquetas EAGLES (máx. 50 etiquetas)."""
    if len(tags) > 50:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Máximo 50 etiquetas por solicitud.")
    return {"descriptions": [describe_tag(tag) for tag in tags]}


@router.get("/colors")
async def get_colors():
    """Retorna el mapa de colores por familia de etiquetas EAGLES."""
    return get_tag_colors()
