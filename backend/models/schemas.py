"""Modelos Pydantic para requests y responses de la API."""

from pydantic import BaseModel, Field
from typing import Optional


# -- Corpus --

class CorpusUploadRequest(BaseModel):
    max_files: Optional[int] = Field(None, ge=1, description="Limite de archivos a procesar (None = todos)")


class CorpusStats(BaseModel):
    total_tokens: int = Field(0, description="Total de tokens procesados")
    total_sentences: int = Field(0, description="Total de oraciones detectadas")
    total_documents: int = Field(0, description="Total de documentos en el corpus")
    unique_tags: int = Field(0, description="Cantidad de etiquetas POS unicas")
    unique_words: int = Field(0, description="Cantidad de palabras unicas (vocabulario)")
    processed_files: int = Field(0, description="Cantidad de archivos procesados")
    is_loaded: bool = Field(False, description="Indica si el corpus esta cargado en memoria")


class CorpusSearchRequest(BaseModel):
    word: str = Field(..., min_length=1, description="Palabra a buscar en el corpus")
    limit: int = Field(20, ge=1, le=100, description="Numero maximo de etiquetas a retornar")


class CorpusSearchResult(BaseModel):
    word: str = Field(..., description="Palabra buscada (normalizada a minusculas)")
    tags: dict[str, int] = Field(..., description="Mapa etiqueta -> frecuencia")
    total_occurrences: int = Field(..., description="Total de apariciones de la palabra")


# -- Probabilidades --

class ProbabilityResponse(BaseModel):
    total_entries: int = Field(..., description="Total de entradas retornadas")
    entries: list[dict] = Field(..., description="Lista de entradas de probabilidad")


# -- Viterbi --

class ViterbiRequest(BaseModel):
    sentence: str = Field(..., min_length=1, max_length=1000, description="Oracion a etiquetar (max 1000 caracteres)")


class ViterbiStep(BaseModel):
    token: str = Field(..., description="Token de la oracion")
    tag: str = Field(..., description="Etiqueta EAGLES asignada")
    probability: float = Field(..., description="Probabilidad del paso")
    description: str = Field(..., description="Descripcion de la etiqueta")


class ViterbiResult(BaseModel):
    sentence: str = Field(..., description="Oracion original")
    tokens: list[str] = Field(..., description="Tokens extraidos")
    tags: list[str] = Field(..., description="Etiquetas asignadas")
    descriptions: list[str] = Field(..., description="Descripciones de las etiquetas")
    steps: list[ViterbiStep] = Field(..., description="Pasos del algoritmo")
    viterbi_matrix: list[dict] = Field(..., description="Matriz de Viterbi serializada")
    backpointers: list[dict] = Field(..., description="Backpointers para backtrace")
    best_path_prob: float = Field(..., description="Probabilidad del mejor camino")


# -- Etiquetas EAGLES --

class TagDescription(BaseModel):
    tag: str = Field(..., description="Codigo de la etiqueta EAGLES")
    category: str = Field(..., description="Categoria gramatical principal")
    description: str = Field(..., description="Descripcion corta")
    full_description: str = Field(..., description="Descripcion completa")


# -- Exportacion --

class ExportRequest(BaseModel):
    sentence: Optional[str] = Field(None, description="Oracion para exportar resultado Viterbi")
    include_emission: bool = Field(True, description="Incluir tabla de emision")
    include_transition: bool = Field(True, description="Incluir tabla de transicion")
    top_n: int = Field(50, ge=1, le=500, description="Top N tags a incluir")


# -- General --

class StatusResponse(BaseModel):
    status: str = Field(..., description="Estado de la operacion (ok, error, running, completed)")
    message: str = Field(..., description="Mensaje descriptivo")
    detail: Optional[dict] = Field(None, description="Detalles adicionales")
