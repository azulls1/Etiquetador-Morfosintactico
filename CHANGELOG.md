# Changelog

Todos los cambios notables en este proyecto seran documentados aqui.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [0.6.0] - 2026-03-04

### Added
- Docker Swarm deployment con Traefik reverse proxy (`docker-stack.yml`) para produccion
- Configuracion de entorno de produccion (`frontend/src/environments/environment.prod.ts`) con apiUrl vacio para same-origin proxy
- File replacements en `frontend/angular.json` para build de produccion
- `@source` directives en `frontend/src/styles.css` para deteccion de contenido Tailwind v4 en Docker
- Integracion completa con Supabase para persistencia de datos del modelo HMM en produccion
- Dependencias `requests` y `python-multipart` en `backend/requirements.txt`
- Dashboard de estadisticas del modelo en la pagina de Probabilidades: 5 tarjetas con pares de emision, pares de transicion, etiquetas unicas, vocabulario y alpha de suavizado
- Mapa de calor mejorado de la matriz de transicion: fondo con gradiente oscuro, gradiente azul de 8 pasos, crosshair al hover, efecto scale(1.15) al hover, click para detalle, matriz de 25x25
- Exportacion a Excel en tablas de emision y transicion
- Filtrado por busqueda en tablas de emision y transicion
- Paginacion (10 elementos por pagina) en tablas de emision y transicion
- Descripciones de etiquetas EAGLES en la tabla de emision
- Badges de probabilidad por palabra en la tabla de emision
- Barras de progreso visuales en la tabla de transicion
- Banner animado de entrenamiento con efecto shimmer e indicador de progreso indeterminado
- Notificaciones toast de exito y error con iconos tras completar entrenamiento

### Changed
- Rediseno completo UI de todos los componentes frontend con glassmorphism design system (Apple HIG inspired)
- `frontend/Dockerfile`: removido `USER nginx`, healthcheck actualizado a `127.0.0.1`
- `frontend/nginx.conf`: agregado resolver DNS Docker (`127.0.0.11`), `proxy_pass` con variables, CSP actualizado para Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)
- `frontend/src/app/features/dashboard/dashboard.component.ts`: health check corregido a `/health`
- Backend completo refactorizado para integracion con Supabase
- Rediseno completo de la pagina de Probabilidades: eliminado layout por pestanas, reemplazado con pagina scrollable completa
- Layout de 2 columnas (emision + transiciones) con mapa de calor debajo
- Layout a ancho completo (sin restriccion max-width), tamano compacto en toda la pagina
- Reemplazado badge inline sutil de entrenamiento por banner prominente animado

### Fixed
- `.postcssrc.json` faltante en VPS que causaba CSS sin Tailwind utilities en produccion
- nginx resolver `127.0.0.11` para DNS en Docker overlay network
- CSP headers actualizados para permitir carga de Google Fonts en produccion

### Security
- Auditoria de seguridad: confirmado zero secretos expuestos en repositorio y deploy

### Removed
- Layout basado en pestanas (tabs) de la pagina de Probabilidades
- Badge de entrenamiento inline anterior (reemplazado por banner animado)

## [0.5.0] - 2026-03-04

### Added
- Suite de 30 tests unitarios con pytest (test_viterbi.py: 20 tests, test_corpus_parser.py: 10 tests)
- Dockerizacion completa con docker-compose.yml (backend Python 3.12-slim + frontend multi-stage con Nginx)
- Suavizado de Laplace (add-alpha smoothing) en el HMM Trainer para emision y transicion
- Indice invertido word_to_tags para busqueda O(1) en Viterbi (antes O(|E|))
- Skip link de accesibilidad (WCAG 2.4.1) para saltar navegacion
- Roles ARIA y labels en landmarks de navegacion y contenido principal
- Documentacion completa en README.md con arquitectura, instalacion y endpoints
- Archivos .gitignore y .dockerignore configurados

### Changed
- Migracion de directivas estructurales a Angular 19 control flow (@if, @for)
- Optimizado algoritmo de Viterbi de O(|E|) a O(1) por token con indice invertido

### Fixed
- Vulnerabilidad de path traversal en endpoint POST /api/corpus/upload (se ignora corpus_dir del cliente)
- Removido path absoluto de Windows hardcodeado en config.py, reemplazado por variable de entorno

### Security
- Corregido path traversal: el servidor siempre usa CORPUS_DIR interno, ignorando input del cliente
