# Backend — Etiquetador Morfosintactico HMM

API REST construida con **FastAPI** para etiquetado de partes del discurso (POS Tagging) en espanol, usando un Modelo Oculto de Markov (HMM) bigrama con decodificacion mediante el algoritmo de Viterbi.

## Requisitos

- Python 3.12+
- Dependencias: `pip install -r requirements.txt`

## Ejecucion

```bash
# Desarrollo
uvicorn main:app --reload --port 8000

# Produccion
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Estructura

```
backend/
├── main.py                 # Entry point FastAPI
├── config.py               # Configuracion (rutas, CORS, Supabase)
├── requirements.txt        # Dependencias con versiones fijas
├── corpus/                 # Archivos del Wikicorpus (EAGLES XML)
├── exports/                # Archivos generados (Excel, Notebook, ZIP)
├── cache/                  # Cache de datos procesados
├── models/
│   ├── schemas.py          # Modelos Pydantic (request/response)
│   └── database.py         # Integracion Supabase (opcional)
├── routers/
│   ├── corpus.py           # /api/corpus — Carga y busqueda del corpus
│   ├── probabilities.py    # /api/probabilities — Entrenamiento HMM
│   ├── viterbi.py          # /api/viterbi — Etiquetado con Viterbi
│   ├── exports.py          # /api/exports — Excel, Notebook, ZIP
│   ├── tags.py             # /api/tags — Referencia EAGLES
│   └── evaluation.py       # /api/evaluation — Metricas de evaluacion
├── services/
│   ├── corpus_parser.py    # Parseo del Wikicorpus XML
│   ├── hmm_trainer.py      # Entrenamiento del modelo HMM
│   ├── viterbi_algorithm.py# Algoritmo de Viterbi (log-probs)
│   ├── eagles_tags.py      # Descripcion de etiquetas EAGLES
│   ├── excel_exporter.py   # Generacion de archivos Excel
│   ├── notebook_generator.py# Generacion del Jupyter Notebook
│   └── evaluation.py       # Train/test split y metricas
├── utils/
│   └── helpers.py          # Tokenizador y utilidades
└── tests/
    ├── conftest.py         # Configuracion compartida de tests
    ├── test_viterbi.py     # Tests del algoritmo de Viterbi
    └── test_corpus_parser.py# Tests del parser de corpus
```

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Informacion de la API |
| GET | `/health` | Health check |
| POST | `/api/corpus/upload` | Iniciar procesamiento del corpus |
| GET | `/api/corpus/upload/status` | Estado del procesamiento |
| GET | `/api/corpus/stats` | Estadisticas del corpus |
| GET | `/api/corpus/search?word=X` | Buscar palabra en el corpus |
| GET | `/api/corpus/tags` | Distribucion de etiquetas |
| POST | `/api/probabilities/train` | Entrenar modelo HMM |
| GET | `/api/probabilities/emission` | Probabilidades de emision |
| GET | `/api/probabilities/transition` | Probabilidades de transicion |
| POST | `/api/viterbi/tag` | Etiquetar oracion con Viterbi |
| GET | `/api/viterbi/history` | Historial de etiquetados |
| GET | `/api/exports/emission/excel` | Excel de probabilidades de emision |
| GET | `/api/exports/transition/excel` | Excel de probabilidades de transicion |
| POST | `/api/exports/viterbi/excel` | Excel con matriz de Viterbi |
| GET | `/api/exports/notebook` | Jupyter Notebook del proyecto |
| GET | `/api/exports/zip` | ZIP con todos los entregables |
| GET | `/api/tags/describe/{tag}` | Descripcion de etiqueta EAGLES |
| GET | `/api/tags/categories` | Categorias EAGLES |
| POST | `/api/evaluation/evaluate` | Evaluacion con train/test split |

Documentacion interactiva disponible en `/docs` (Swagger UI).

## Tests

```bash
pytest tests/ -v
```

## Variables de entorno

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `ENV` | `development` | Entorno (`development` / `production`) |
| `SUPABASE_URL` | (ver config.py) | URL de Supabase (opcional) |
| `SUPABASE_KEY` | `""` | API key de Supabase (opcional) |
| `CORPUS_DIR` | `./corpus` | Directorio del corpus |
| `EXPORTS_DIR` | `./exports` | Directorio de exportaciones |
| `CACHE_DIR` | `./cache` | Directorio de cache |
