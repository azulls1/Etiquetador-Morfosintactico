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


# -- Tablas de probabilidad (endpoints sin tipo) --

class ProbabilityTableResponse(BaseModel):
    entries: list[dict] = Field(..., description="Entradas de la tabla de probabilidad")


class ViterbiHistoryResponse(BaseModel):
    results: list[dict] = Field(default_factory=list, description="Historial de etiquetados")


class TagDistributionResponse(BaseModel):
    total_tokens: int = Field(..., description="Total de tokens en el corpus")
    tags: list[dict] = Field(..., description="Distribucion de etiquetas")


class TagDescriptionResponse(BaseModel):
    tag: str = Field(..., description="Codigo de la etiqueta EAGLES")
    category: str = Field("", description="Categoria gramatical principal")
    description: str = Field("", description="Descripcion corta")
    full_description: str = Field("", description="Descripcion completa")
    positions: list[dict] = Field(default_factory=list, description="Descripcion de cada posicion")


class DescribeBatchResponse(BaseModel):
    descriptions: list[dict] = Field(..., description="Descripciones de las etiquetas solicitadas")


class CategoriesResponse(BaseModel):
    categories: list[dict] = Field(..., description="Categorias EAGLES principales")


class EvaluationResult(BaseModel):
    split: dict = Field(..., description="Info del train/test split")
    global_metrics: dict = Field(..., description="Accuracy global, tokens evaluados, palabras desconocidas")
    macro_avg: dict = Field(..., description="Precision, recall, F1 promedio macro")
    weighted_avg: dict = Field(..., description="Precision, recall, F1 promedio ponderado")
    per_tag_metrics: list[dict] = Field(default_factory=list, description="Metricas por etiqueta")
    confusion_matrix: Optional[dict] = Field(None, description="Matriz de confusion con tags y matrix")
    sentence_accuracy_distribution: Optional[dict] = Field(None, description="Distribucion de accuracy por oracion")
    model_params: Optional[dict] = Field(None, description="Parametros del modelo utilizado")


# -- Quick Sentences --

class AnalysisQuestion(BaseModel):
    id: int = Field(..., description="ID de la pregunta")
    sort_order: int = Field(0, description="Orden de visualizacion")
    question: str = Field(..., description="Texto de la pregunta")
    answer_html: str = Field(..., description="Respuesta en formato HTML")


class AnalysisQuestionCreate(BaseModel):
    sort_order: int = Field(0, ge=0, description="Orden de visualizacion")
    question: str = Field(..., min_length=1, max_length=500, description="Texto de la pregunta")
    answer_html: str = Field(..., min_length=1, description="Respuesta en formato HTML")


class AnalysisQuestionUpdate(BaseModel):
    sort_order: Optional[int] = Field(None, ge=0, description="Orden de visualizacion")
    question: Optional[str] = Field(None, min_length=1, max_length=500, description="Texto de la pregunta")
    answer_html: Optional[str] = Field(None, min_length=1, description="Respuesta en formato HTML")


class AnalysisQuestionsResponse(BaseModel):
    questions: list[AnalysisQuestion] = Field(default_factory=list, description="Lista de preguntas de analisis")


class QuickSentence(BaseModel):
    id: int = Field(..., description="ID de la oracion")
    sentence: str = Field(..., description="Texto de la oracion")
    sort_order: int = Field(0, description="Orden de visualizacion")


class QuickSentenceCreate(BaseModel):
    sentence: str = Field(..., min_length=1, max_length=500, description="Texto de la oracion")
    sort_order: int = Field(0, ge=0, description="Orden de visualizacion")


class QuickSentenceUpdate(BaseModel):
    sentence: Optional[str] = Field(None, min_length=1, max_length=500, description="Texto de la oracion")
    sort_order: Optional[int] = Field(None, ge=0, description="Orden de visualizacion")


class QuickSentencesResponse(BaseModel):
    sentences: list[QuickSentence] = Field(default_factory=list, description="Lista de oraciones rapidas")


# -- EAGLES Reference Data --

class EaglesExample(BaseModel):
    id: int = Field(..., description="ID del ejemplo")
    tag: str = Field(..., description="Codigo de la etiqueta EAGLES")
    category: str = Field(..., description="Categoria gramatical")
    description: str = Field(..., description="Descripcion del ejemplo")
    sort_order: int = Field(0, description="Orden de visualizacion")


class EaglesExampleCreate(BaseModel):
    tag: str = Field(..., min_length=1, max_length=20, description="Codigo de la etiqueta EAGLES")
    category: str = Field(..., min_length=1, max_length=50, description="Categoria gramatical")
    description: str = Field(..., min_length=1, description="Descripcion del ejemplo")
    sort_order: int = Field(0, ge=0, description="Orden de visualizacion")


class EaglesExampleUpdate(BaseModel):
    tag: Optional[str] = Field(None, min_length=1, max_length=20, description="Codigo de la etiqueta EAGLES")
    category: Optional[str] = Field(None, min_length=1, max_length=50, description="Categoria gramatical")
    description: Optional[str] = Field(None, min_length=1, description="Descripcion del ejemplo")
    sort_order: Optional[int] = Field(None, ge=0, description="Orden de visualizacion")


class EaglesExamplesResponse(BaseModel):
    examples: list[EaglesExample] = Field(default_factory=list, description="Lista de ejemplos EAGLES")


class EaglesPosition(BaseModel):
    id: int = Field(..., description="ID de la posicion")
    position: str = Field(..., description="Numero de posicion (1-7)")
    attribute: str = Field(..., description="Atributo que codifica")
    possible_values: str = Field(..., description="Valores posibles")
    example_char: str = Field("", description="Caracter de ejemplo")
    color_class: str = Field("", description="Clases CSS para el diagrama visual")
    sort_order: int = Field(0, description="Orden de visualizacion")


class EaglesPositionCreate(BaseModel):
    position: str = Field(..., min_length=1, max_length=5, description="Numero de posicion")
    attribute: str = Field(..., min_length=1, max_length=50, description="Atributo que codifica")
    possible_values: str = Field(..., min_length=1, description="Valores posibles")
    example_char: str = Field("", max_length=5, description="Caracter de ejemplo")
    color_class: str = Field("", description="Clases CSS para el diagrama visual")
    sort_order: int = Field(0, ge=0, description="Orden de visualizacion")


class EaglesPositionUpdate(BaseModel):
    position: Optional[str] = Field(None, min_length=1, max_length=5, description="Numero de posicion")
    attribute: Optional[str] = Field(None, min_length=1, max_length=50, description="Atributo que codifica")
    possible_values: Optional[str] = Field(None, min_length=1, description="Valores posibles")
    example_char: Optional[str] = Field(None, max_length=5, description="Caracter de ejemplo")
    color_class: Optional[str] = Field(None, description="Clases CSS para el diagrama visual")
    sort_order: Optional[int] = Field(None, ge=0, description="Orden de visualizacion")


class EaglesPositionsResponse(BaseModel):
    positions: list[EaglesPosition] = Field(default_factory=list, description="Lista de posiciones EAGLES")


# -- Export Checklist --

class ExportChecklistItem(BaseModel):
    id: int = Field(..., description="ID del item")
    label: str = Field(..., description="Texto del item del checklist")
    sort_order: int = Field(0, description="Orden de visualizacion")


class ExportChecklistItemCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=500, description="Texto del item")
    sort_order: int = Field(0, ge=0, description="Orden de visualizacion")


class ExportChecklistItemUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=500, description="Texto del item")
    sort_order: Optional[int] = Field(None, ge=0, description="Orden de visualizacion")


class ExportChecklistResponse(BaseModel):
    items: list[ExportChecklistItem] = Field(default_factory=list, description="Lista de items del checklist")


# -- General --

class StatusResponse(BaseModel):
    status: str = Field(..., description="Estado de la operacion (ok, error, running, completed)")
    message: str = Field(..., description="Mensaje descriptivo")
    detail: Optional[dict] = Field(None, description="Detalles adicionales")
