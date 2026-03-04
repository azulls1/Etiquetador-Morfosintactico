"""Endpoint de referencia de etiquetas EAGLES."""

import logging
from fastapi import APIRouter

from services.eagles_tags import describe_tag, get_all_categories

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tags", tags=["Etiquetas EAGLES"])


@router.get("/describe/{tag}")
async def describe_eagles_tag(tag: str):
    """Describe una etiqueta EAGLES.

    Path params:
        tag: Etiqueta EAGLES (ej: "VMIP3S0", "NCMS000", "Fp").
    """
    result = describe_tag(tag)
    return result


@router.get("/categories")
async def get_categories():
    """Retorna todas las categorías EAGLES principales con subcategorías."""
    return {"categories": get_all_categories()}


@router.post("/describe-batch")
async def describe_batch(tags: list[str]):
    """Describe múltiples etiquetas EAGLES."""
    return {"descriptions": [describe_tag(tag) for tag in tags]}
