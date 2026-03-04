# Etiquetador Morfosintactico HMM

Aplicacion web para el etiquetado morfosintactico automatico del espanol utilizando un **Modelo Oculto de Markov (HMM)** con el algoritmo de **Viterbi**.

> Maestria en Inteligencia Artificial — Procesamiento del Lenguaje Natural — UNIR 2026
> Desarrollado por **Samael Hernandez**

---

## Descripcion

El sistema procesa el **Wikicorpus** en espanol etiquetado con el juego de etiquetas **EAGLES** (FreeLing) para:

1. **Extraer estadisticas** del corpus (frecuencias de etiquetas, palabras, bigramas)
2. **Entrenar un HMM bigrama** calculando probabilidades de emision P(palabra|etiqueta) y transicion P(etiqueta_i|etiqueta_{i-1})
3. **Etiquetar oraciones** nuevas con el algoritmo de Viterbi (programacion dinamica)
4. **Exportar resultados** en Excel, Jupyter Notebook y ZIP

## Arquitectura

```
Etiquetador-Morfosintactico/
├── backend/          # API REST (Python + FastAPI)
│   ├── main.py              # Punto de entrada, configuracion CORS
│   ├── config.py            # Rutas de corpus, cache y exports
│   ├── requirements.txt     # Dependencias Python
│   ├── routers/             # Endpoints de la API
│   │   ├── corpus.py           # /api/corpus/*
│   │   ├── probabilities.py    # /api/probabilities/*
│   │   ├── viterbi.py          # /api/viterbi/*
│   │   ├── exports.py          # /api/exports/*
│   │   └── tags.py             # /api/tags/*
│   ├── services/            # Logica de negocio
│   │   ├── corpus_parser.py    # Procesamiento del Wikicorpus
│   │   ├── hmm_trainer.py      # Calculo de probabilidades HMM
│   │   ├── viterbi_algorithm.py# Algoritmo de Viterbi
│   │   ├── eagles_tags.py      # Taxonomia EAGLES completa
│   │   ├── excel_exporter.py   # Generacion de archivos Excel
│   │   └── notebook_generator.py# Generacion de Jupyter Notebook
│   ├── models/
│   │   ├── schemas.py          # Modelos Pydantic (request/response)
│   │   └── database.py         # Integracion con Supabase
│   ├── utils/
│   │   └── helpers.py          # Utilidades (cache, tokenizacion)
│   ├── cache/               # Datos procesados (pickle)
│   └── exports/             # Archivos generados (Excel, notebooks)
│
├── frontend/         # Aplicacion web (Angular 19 + Tailwind CSS 4)
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts     # Layout principal
│   │   │   ├── app.routes.ts        # Configuracion de rutas
│   │   │   ├── core/
│   │   │   │   ├── services/
│   │   │   │   │   └── api.service.ts   # Comunicacion con la API
│   │   │   │   └── models/              # Interfaces TypeScript
│   │   │   ├── features/
│   │   │   │   ├── dashboard/       # Pagina principal
│   │   │   │   ├── corpus/          # Gestion del corpus
│   │   │   │   ├── probabilities/   # Tablas de probabilidades
│   │   │   │   ├── viterbi/         # Etiquetado interactivo
│   │   │   │   ├── analysis/        # Analisis y referencia EAGLES
│   │   │   │   └── exports/         # Descargas
│   │   │   └── shared/
│   │   │       └── components/      # Navbar, Sidebar, Loading
│   │   └── environments/            # Configuracion por entorno
│   ├── angular.json
│   └── package.json
│
├── docker-compose.yml    # Levantar todo con un comando
├── .gitignore            # Reglas globales
└── README.md             # Este archivo
```

## Requisitos Previos

- **Python** 3.10+
- **Node.js** 18+ y npm
- **Corpus:** Wikicorpus espanol etiquetado (`spanishEtiquetado*.txt`) — opcional, configurable en `backend/config.py`

## Instalacion y Ejecucion

### Opcion 1: Manual (desarrollo)

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

### Opcion 2: Docker Compose

```bash
docker-compose up --build
```

### URLs de Desarrollo

| Servicio         | URL                           |
| ---------------- | ----------------------------- |
| Frontend         | http://localhost:4200          |
| API              | http://localhost:8000          |
| Documentacion API| http://localhost:8000/docs     |
| Health Check     | http://localhost:8000/health   |

## Endpoints Principales de la API

| Metodo | Ruta                          | Descripcion                                  |
| ------ | ----------------------------- | -------------------------------------------- |
| POST   | `/api/corpus/upload`          | Procesar corpus en segundo plano             |
| GET    | `/api/corpus/stats`           | Estadisticas del corpus procesado            |
| POST   | `/api/probabilities/train`    | Entrenar modelo HMM                          |
| GET    | `/api/probabilities/emission` | Probabilidades de emision P(w\|t)            |
| GET    | `/api/probabilities/transition`| Probabilidades de transicion P(t_i\|t_{i-1})|
| POST   | `/api/viterbi/tag`            | Etiquetar oracion con Viterbi                |
| GET    | `/api/exports/zip`            | Descargar todo en ZIP                        |

## Stack Tecnologico

**Backend:**
- FastAPI 0.100+ — Framework web asincrono
- Pydantic 2.0 — Validacion de datos
- openpyxl — Generacion de Excel
- nbformat — Generacion de Jupyter Notebooks
- Supabase — Persistencia de datos (opcional)

**Frontend:**
- Angular 19.2 — Framework de componentes standalone
- Tailwind CSS 4.2 — Utilidades CSS
- RxJS 7.8 — Programacion reactiva

## Despliegue (Produccion)

| Servicio  | URL                                          |
| --------- | -------------------------------------------- |
| Frontend  | https://etiqmorfsintac.iagentek.com.mx       |
| API       | https://api-etiqmorfsintac.iagentek.com.mx   |

## Licencia

Proyecto academico — UNIR 2026
