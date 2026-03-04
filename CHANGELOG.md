# Changelog

Todos los cambios notables en el **Etiquetador Morfosintactico** seran documentados en este archivo.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Pending
- Tests de integracion end-to-end (API + Frontend)
- Tests unitarios para frontend (Karma/Jasmine)
- Exportacion a PDF de resultados de Viterbi
- Historial de etiquetados paginado con filtros
- Validacion de entrada con limite de longitud en Viterbi (`/api/viterbi/tag`)
- Optimizacion de `get_emission_table()` y `get_transition_table()` con indice inverso
- Soporte multi-corpus (seleccionar entre diferentes corpus en la UI)
- Barra de progreso real-time via WebSocket para procesamiento de corpus
- Internacionalizacion (i18n) de la interfaz
- CI/CD pipeline (GitHub Actions)

---

## [0.5.0] - 2026-03-04

### Added
- **30 unit tests** con pytest: `test_viterbi.py` (20 tests) y `test_corpus_parser.py` (10 tests)
  - `TestTokenizer` (5 tests): tokenizacion de oraciones, puntuacion, signos de interrogacion, cadena vacia, palabra unica
  - `TestEaglesTags` (5 tests): descripcion de nombre, verbo, adjetivo, preposicion; validacion de etiquetas abiertas/cerradas
  - `TestViterbiAlgorithm` (3 tests): prevencion de underflow con log-probabilidades, equivalencia log-suma, test completo con modelo sintetico ("El gato come" -> D N V)
  - `TestLaplaceSmoothing` (3 tests): probabilidad nunca cero, preservacion de ranking, equivalencia con MLE cuando alpha=0
  - `TestFileReading` (3 tests): lectura UTF-8, Latin-1, archivo inexistente
  - `TestCorpusParsing` (6 tests): formato de lineas, deteccion de limites de oracion, extraccion de etiquetas, conteos de emision, conteos de transicion, normalizacion a minusculas
  - 1 test adicional: manejo de fronteras de documento
- **Dockerizacion completa** del proyecto
  - `docker-compose.yml` con servicios `backend` y `frontend`, health checks, volumenes persistentes
  - `backend/Dockerfile` con Python 3.12-slim, uvicorn
  - `frontend/Dockerfile` multi-stage build (Node 20-alpine + Nginx alpine)
  - `backend/.dockerignore` y `frontend/.dockerignore`
- **Documentacion completa** en `README.md`: arquitectura del proyecto, instrucciones de instalacion manual y Docker, tabla de endpoints, stack tecnologico, URLs de produccion
- **Accesibilidad (WCAG 2.4.1)**: Skip link "Saltar al contenido principal" en `AppComponent`, atributos `role="main"` y `aria-label="Contenido principal"` en el contenido, `aria-label="Navegacion principal"` en sidebar
- `.gitignore` raiz y `frontend/.gitignore`

### Changed
- **Suavizado de Laplace** en HMM Trainer (`hmm_trainer.py`): reemplaza probabilidad fija `1e-10` para palabras no vistas
  - Emision: `P(w|t) = (C(t,w) + alpha) / (C(t) + alpha * V)`
  - Transicion: `P(t_i|t_{i-1}) = (C(prev,next) + alpha) / (C(prev) + alpha * N)`
  - Parametro `smoothing` configurable (default `1.0`), `0.0` desactiva suavizado
- **Indice invertido `word_to_tags`** en Viterbi (`viterbi_algorithm.py`): busqueda O(1) de etiquetas posibles por palabra, reemplazando scan lineal O(|E|) sobre todas las emisiones
- **Migracion a `@if` de Angular 19** en navbar (`navbar.component.ts`): reemplaza directiva `*ngIf` por el nuevo control flow nativo
- **Migracion a `@for` de Angular 19** en sidebar (`sidebar.component.ts`): reemplaza directiva `*ngFor` por el nuevo control flow nativo con `track`
- `CORPUS_DIR` en `config.py` ahora lee variable de entorno `CORPUS_DIR` con fallback a ruta relativa `./corpus`

### Security
- **Fix de path traversal**: el parametro `corpus_dir` enviado por el cliente en `POST /api/corpus/upload` es ignorado; el endpoint siempre usa `CORPUS_DIR` del servidor (`config.py`), previniendo acceso a directorios arbitrarios
- Removido path absoluto de Windows hardcodeado en `config.py`

---

## [0.4.0] - 2026-03-03

### Changed
- **Rediseno completo de la interfaz** con estetica glassmorphism, gradientes y micro-interacciones CSS
- **Dark mode persistente** via `localStorage`: el tema seleccionado se preserva entre sesiones; detecta `prefers-color-scheme` del sistema como fallback
- **Iconos SVG inline** (estilo Heroicons): todos los iconos migrados de HTML entities (`&#9776;`, `&#9790;`, etc.) a SVG con `stroke` y `fill`, mejorando claridad visual y accesibilidad
- **Paleta de colores unificada**: azul UNIR (#2F5496) como color primario, naranja (#f97316) como acento, con variantes para dark mode
- **Tipografia**: tamano minimo de 12px en toda la aplicacion; uso de Inter como fuente principal
- **Responsive mejorado**: layout mobile-first, sidebar colapsable con overlay en movil, breakpoints Tailwind consistentes

---

## [0.3.0] - 2026-02-15

### Added
- **Frontend Angular 19** con standalone components (sin NgModules)
- **Dashboard** (`features/dashboard/`): panel principal con estadisticas del corpus, acciones rapidas, checklist de entregables
- **Viterbi UI** (`features/viterbi/`): interfaz de etiquetado interactivo con visualizacion paso a paso del algoritmo y matriz de Viterbi
- **Corpus UI** (`features/corpus/`): explorador del corpus con estadisticas, distribucion de etiquetas y busqueda de palabras
- **Probabilities UI** (`features/probabilities/`): tablas de probabilidades de emision P(w|t) y transicion P(t_i|t_{i-1})
- **Analysis UI** (`features/analysis/`): analisis de etiquetado con explicacion de etiquetas EAGLES
- **Eagles Reference** (`features/analysis/eagles-reference.component.ts`): tabla de referencia completa del sistema de etiquetas EAGLES con categorias y subcategorias
- **Exports UI** (`features/exports/`): descarga de Excel (emision, transicion, Viterbi), Jupyter Notebook y ZIP con todos los entregables
- **Navbar** (`shared/components/navbar/`): barra superior sticky con logo, titulo, toggle de dark mode, info de usuario
- **Sidebar** (`shared/components/sidebar/`): navegacion lateral con iconos SVG, 3 grupos (Principal, Herramientas, Referencia), indicador de ruta activa, colapsable en movil
- **Loading Spinner** (`shared/components/loading-spinner/`): componente reutilizable de carga
- **API Service** (`core/services/api.service.ts`): servicio centralizado con metodos tipados para todos los endpoints del backend
- **TypeScript Models** (`core/models/`): interfaces para `CorpusStats`, `ViterbiResult`, `ProbabilityResponse`, `TagDescription`, etc.
- **Routing** con lazy loading (`app.routes.ts`): 7 rutas con `loadComponent()` para code splitting
- **Tailwind CSS 4** integrado con PostCSS y `@tailwindcss/forms`

---

## [0.2.0] - 2026-02-01

### Added
- **Backend FastAPI** con estructura modular (routers, services, models, utils)
- **Corpus Parser** (`services/corpus_parser.py`): procesamiento del Wikicorpus espanol etiquetado con formato FreeLing
  - Lectura de archivos con fallback de encoding (UTF-8, Latin-1, ISO-8859-1, CP1252)
  - Deteccion de limites de oracion y fronteras de documento (`<doc>`)
  - Conteos de etiquetas, emisiones (tag, word), transiciones (prev_tag, next_tag) y palabras
  - Busqueda de palabras en el corpus con sus etiquetas asociadas
  - Procesamiento en segundo plano con callback de progreso
- **HMM Trainer** (`services/hmm_trainer.py`): calculo de probabilidades del modelo oculto de Markov
  - Probabilidades de emision P(palabra|etiqueta)
  - Probabilidades de transicion P(etiqueta_i|etiqueta_{i-1})
  - Tablas de emision y transicion para visualizacion
  - Funciones de consulta: top emisiones y transiciones por etiqueta
- **Viterbi Algorithm** (`services/viterbi_algorithm.py`): implementacion del algoritmo de Viterbi con programacion dinamica
  - Log-probabilidades para prevenir underflow numerico
  - Inicializacion con transicion desde `<START>`
  - Recursion con maximizacion sobre etiquetas previas
  - Terminacion con transicion a `<END>` y fallback
  - Backtrace para reconstruir la secuencia optima de etiquetas
  - Matriz de Viterbi y backpointers serializables para la UI
- **Eagles Tags** (`services/eagles_tags.py`): diccionario completo de etiquetas EAGLES para espanol
  - 12 categorias principales (A, C, D, F, I, N, P, R, S, V, W, Z)
  - Subcategorias, modo/tiempo verbal, genero, numero, persona, grado
  - Funcion `describe_tag()` para descripcion legible de cualquier etiqueta
  - Identificacion de etiquetas de clase abierta vs. cerrada
- **Excel Exporter** (`services/excel_exporter.py`): generacion de archivos .xlsx con openpyxl
  - Tabla de emision con top palabras por etiqueta
  - Tabla de transicion con formato de lista y matriz
  - Resultado de Viterbi con ruta optima resaltada
  - Estilos profesionales: encabezados azul UNIR, bordes, auto-width
- **Notebook Generator** (`services/notebook_generator.py`): generacion de Jupyter Notebook (.ipynb) autocontenido con el pipeline completo
- **API REST endpoints** organizados en 5 routers:
  - `POST /api/corpus/upload` - Procesar corpus en segundo plano
  - `GET /api/corpus/upload/status` - Estado del procesamiento
  - `GET /api/corpus/stats` - Estadisticas del corpus
  - `POST /api/corpus/search` - Buscar palabra en el corpus
  - `GET /api/corpus/tags` - Distribucion de etiquetas
  - `POST /api/probabilities/train` - Entrenar modelo HMM
  - `GET /api/probabilities/emission` - Probabilidades de emision
  - `GET /api/probabilities/transition` - Probabilidades de transicion
  - `GET /api/probabilities/emission/table` - Tabla completa de emision
  - `GET /api/probabilities/transition/table` - Tabla completa de transicion
  - `POST /api/viterbi/tag` - Etiquetar oracion con Viterbi
  - `GET /api/viterbi/history` - Historial de etiquetados
  - `GET /api/exports/emission/excel` - Descargar Excel de emision
  - `GET /api/exports/transition/excel` - Descargar Excel de transicion
  - `POST /api/exports/viterbi/excel` - Descargar Excel de Viterbi
  - `GET /api/exports/notebook` - Descargar Jupyter Notebook
  - `GET /api/exports/zip` - Descargar ZIP con todos los entregables
  - `GET /api/tags/describe/{tag}` - Describir etiqueta EAGLES
  - `GET /api/tags/categories` - Categorias EAGLES
  - `POST /api/tags/describe-batch` - Describir multiples etiquetas
- **Pydantic Schemas** (`models/schemas.py`): modelos de request/response tipados (ViterbiRequest, ViterbiResult, CorpusStats, etc.)
- **Supabase Integration** (`models/database.py`): persistencia opcional de estadisticas, probabilidades e historial de etiquetados
- **Tokenizador para espanol** (`utils/helpers.py`): separacion de signos de puntuacion (`.!?;:,` y signos invertidos espanoles `¡¿`)
- **Cache local con pickle** (`utils/helpers.py`): serializacion del corpus procesado y probabilidades para carga rapida
- **Health check endpoint** (`GET /health`): verificacion de estado del corpus y modelo
- **Configuracion centralizada** (`config.py`): rutas, CORS origins, credenciales Supabase

---

## [0.1.0] - 2026-01-15

### Added
- Estructura inicial del proyecto (monorepo `frontend/` + `backend/`)
- Definicion de arquitectura: HMM Bigrama + Viterbi para POS Tagging del espanol
- Seleccion de stack tecnologico: Angular 19 + FastAPI + Python 3.12 + Tailwind CSS 4
- Seleccion del corpus: Wikicorpus espanol con etiquetas EAGLES (FreeLing)

---

## Tecnologias

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | Angular 19.2, TypeScript 5.7, Tailwind CSS 4.2 |
| Backend | FastAPI 0.100+, Python 3.12, Uvicorn, Pydantic 2.0 |
| Modelo NLP | HMM Bigrama + Viterbi (programacion dinamica) |
| Corpus | Wikicorpus espanol (formato FreeLing/EAGLES) |
| Exportacion | openpyxl (Excel), nbformat (Jupyter Notebook) |
| Persistencia | Supabase (opcional), pickle (cache local) |
| Tests | pytest 30 tests (backend) |
| Contenedores | Docker Compose, Python 3.12-slim, Node 20-alpine, Nginx alpine |

---

*Etiquetador Morfosintactico HMM - Maestria en Inteligencia Artificial, UNIR 2026*
*Autor: Samael Hernandez*
