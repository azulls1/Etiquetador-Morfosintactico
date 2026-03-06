"""CRUD endpoints para datos de referencia EAGLES (ejemplos y posiciones)."""

import logging
from fastapi import APIRouter, HTTPException

from models.schemas import (
    EaglesExamplesResponse, EaglesExampleCreate, EaglesExampleUpdate, EaglesExample,
    EaglesPositionsResponse, EaglesPositionCreate, EaglesPositionUpdate, EaglesPosition,
)
from models.database import (
    load_eagles_examples, save_eagles_example, update_eagles_example, delete_eagles_example,
    load_eagles_positions, save_eagles_position, update_eagles_position, delete_eagles_position,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/eagles", tags=["EAGLES Reference Data"])


# ── Examples CRUD ──────────────────────────────────────

@router.get("/examples", response_model=EaglesExamplesResponse)
async def get_examples():
    """Lista todos los ejemplos de etiquetas EAGLES."""
    return {"examples": load_eagles_examples()}


@router.post("/examples", response_model=EaglesExample, status_code=201)
async def create_example(body: EaglesExampleCreate):
    """Crea un nuevo ejemplo de etiqueta EAGLES."""
    result = save_eagles_example(body.tag, body.category, body.description, body.sort_order)
    if not result:
        raise HTTPException(status_code=500, detail="No se pudo crear el ejemplo")
    return result


@router.put("/examples/{example_id}", response_model=EaglesExample)
async def update_example_endpoint(example_id: int, body: EaglesExampleUpdate):
    """Actualiza un ejemplo de etiqueta EAGLES existente."""
    result = update_eagles_example(
        example_id,
        tag=body.tag, category=body.category,
        description=body.description, sort_order=body.sort_order,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Ejemplo no encontrado")
    return result


@router.delete("/examples/{example_id}")
async def delete_example_endpoint(example_id: int):
    """Elimina un ejemplo de etiqueta EAGLES."""
    if not delete_eagles_example(example_id):
        raise HTTPException(status_code=404, detail="Ejemplo no encontrado")
    return {"status": "ok", "message": "Ejemplo eliminado"}


# ── Positions CRUD ──────────────────────────────────────

@router.get("/positions", response_model=EaglesPositionsResponse)
async def get_positions():
    """Lista todas las posiciones de la estructura EAGLES."""
    return {"positions": load_eagles_positions()}


@router.post("/positions", response_model=EaglesPosition, status_code=201)
async def create_position(body: EaglesPositionCreate):
    """Crea una nueva posicion de estructura EAGLES."""
    result = save_eagles_position(
        body.position, body.attribute, body.possible_values,
        body.example_char, body.color_class, body.sort_order,
    )
    if not result:
        raise HTTPException(status_code=500, detail="No se pudo crear la posicion")
    return result


@router.put("/positions/{pos_id}", response_model=EaglesPosition)
async def update_position_endpoint(pos_id: int, body: EaglesPositionUpdate):
    """Actualiza una posicion de estructura EAGLES existente."""
    result = update_eagles_position(
        pos_id,
        position=body.position, attribute=body.attribute,
        possible_values=body.possible_values, example_char=body.example_char,
        color_class=body.color_class, sort_order=body.sort_order,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Posicion no encontrada")
    return result


@router.delete("/positions/{pos_id}")
async def delete_position_endpoint(pos_id: int):
    """Elimina una posicion de estructura EAGLES."""
    if not delete_eagles_position(pos_id):
        raise HTTPException(status_code=404, detail="Posicion no encontrada")
    return {"status": "ok", "message": "Posicion eliminada"}
