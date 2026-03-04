# NXT Skills Context

> **Version:** 3.6.0
> **Total Skills:** 16 activos (2 deprecated)
> **Ubicacion:** `skills/**/*.md`

Este archivo proporciona contexto rapido sobre todos los skills del framework NXT.

---

## Que son los Skills?

Los **Skills** son guias tecnicas de "como hacer" algo especifico.
A diferencia de los **Agentes** (que son "quien hace que"), los Skills son instrucciones detalladas.

| Concepto | Agente | Skill |
|----------|--------|-------|
| Naturaleza | Persona/Rol | Guia/Tutorial |
| Ejemplo | "Soy el DevOps Engineer" | "Como crear un Dockerfile" |
| Activacion | `/nxt/devops` | Automatica por contexto |
| Contenido | Responsabilidades, workflow | Paso a paso, templates |

---

## Indice por Categoria

### Desarrollo (6 skills)

| Skill | Archivo | Descripcion |
|-------|---------|-------------|
| **Code Quality** | `SKILL-code-quality.md` | Code review + refactoring unificado |
| **Testing** | `SKILL-testing.md` | Jest, Playwright, coverage |
| **Diagrams** | `SKILL-diagrams.md` | Mermaid, PlantUML, diagramas |
| **Migrations** | `SKILL-migrations.md` | Migraciones de base de datos |
| **Monitoring** | `SKILL-monitoring.md` | Prometheus, Grafana, alertas |
| **Containers** | `SKILL-containers.md` | Docker, multi-stage builds |

### Documentos (5 skills)

| Skill | Archivo | Descripcion |
|-------|---------|-------------|
| **DOCX** | `SKILL-docx.md` | Crear documentos Word |
| **XLSX** | `SKILL-xlsx.md` | Crear hojas de calculo Excel |
| **PPTX** | `SKILL-pptx.md` | Crear presentaciones PowerPoint |
| **PDF** | `SKILL-pdf.md` | Generar y manipular PDFs |
| **API Docs** | `SKILL-api-docs.md` | OpenAPI, Swagger, Redoc |
| **Markdown Advanced** | `SKILL-markdown-advanced.md` | Markdown extendido, tablas, diagramas |

### Integraciones (4 skills)

| Skill | Archivo | Descripcion |
|-------|---------|-------------|
| **MCP** | `SKILL-mcp.md` | Model Context Protocol servers |
| **Webhooks** | `SKILL-webhooks.md` | Recibir y enviar webhooks |
| **Gemini** | `SKILL-gemini.md` | Integracion con Gemini API |
| **OpenAI** | `SKILL-openai.md` | Integracion con OpenAI API |

### Deprecated (2 skills)

| Skill | Estado | Reemplazo |
|-------|--------|-----------|
| **Code Review** | DEPRECATED | Usar `SKILL-code-quality.md` |
| **Refactoring** | DEPRECATED | Usar `SKILL-code-quality.md` |

---

## Matriz Skill-Agente

Que skills usa cada agente:

| Agente | Skills Relacionados |
|--------|---------------------|
| `/nxt/dev` | code-quality, testing, diagrams |
| `/nxt/api` | api-docs, testing, webhooks |
| `/nxt/design` | testing, diagrams |
| `/nxt/database` | migrations |
| `/nxt/devops` | containers, monitoring |
| `/nxt/infra` | containers, monitoring |
| `/nxt/docs` | docx, xlsx, pptx, pdf, markdown-advanced, api-docs |
| `/nxt/integrations` | mcp, webhooks |
| `/nxt/search` | gemini |
| `/nxt/media` | gemini, openai |
| `/nxt/performance` | monitoring |
| `/nxt/qa` | testing, code-quality |

---

## Detalle de Skills

### SKILL-code-quality.md (Unificado)
```
Proposito: Garantizar calidad del codigo
Contenido:
├── PARTE 1: CODE REVIEW
│   ├── Checklist (funcionalidad, seguridad, performance)
│   ├── Formato de review
│   ├── Patrones problematicos
│   └── Feedback constructivo
└── PARTE 2: REFACTORING
    ├── Code smells
    ├── Catalogo de refactorings
    ├── Metricas de calidad
    └── Workflow
```

### SKILL-testing.md
```
Proposito: Escribir tests efectivos
Contenido:
├── Unit testing (Jest, Vitest)
├── Integration testing
├── E2E testing (Playwright, Cypress)
├── Coverage thresholds
└── Mocking strategies
```

### SKILL-containers.md
```
Proposito: Containerizacion con Docker
Contenido:
├── Dockerfile multi-stage
├── Docker Compose
├── Image optimization
├── Security scanning
└── Registry management
```

### SKILL-monitoring.md
```
Proposito: Observabilidad de aplicaciones
Contenido:
├── Prometheus metrics
├── Grafana dashboards
├── Alerting rules
├── Log aggregation
└── APM (Application Performance Monitoring)
```

### SKILL-mcp.md
```
Proposito: Integrar MCP servers
Contenido:
├── Configuracion en .claude/mcp.json
├── Servers disponibles
├── Variables de entorno
├── Troubleshooting
└── Crear servers custom
```

### SKILL-api-docs.md
```
Proposito: Documentar APIs
Contenido:
├── OpenAPI 3.0 spec
├── Swagger UI setup
├── Redoc generation
├── Examples y schemas
└── Versionado de API
```

### SKILL-gemini.md
```
Proposito: Usar Gemini API
Contenido:
├── Modelos disponibles
│   ├── gemini-3-pro-preview (busquedas)
│   ├── nano-banana-pro-preview (imagenes)
│   ├── veo-3.0-generate-001 (videos)
│   └── gemini-2.5-pro-preview-tts (audio)
├── Autenticacion
├── Rate limits
└── Best practices
```

---

## Activacion de Skills

Los skills se activan automaticamente cuando:

1. **Por contexto de tarea**:
   - "Crea un Dockerfile" → SKILL-containers
   - "Genera documentacion de la API" → SKILL-api-docs
   - "Escribe tests" → SKILL-testing

2. **Por agente activo**:
   - `/nxt/devops` activa containers, monitoring
   - `/nxt/docs` activa docx, xlsx, pptx, pdf

3. **Por mencion explicita**:
   - "Usa el skill de code-quality"
   - "Aplica SKILL-refactoring" (redirige a code-quality)

---

## Crear Nuevos Skills

Template para nuevos skills:

```markdown
# SKILL: [Nombre]

## Proposito
[Que problema resuelve]

## Cuando se Activa
- [Trigger 1]
- [Trigger 2]

## Instrucciones

### 1. [Seccion]
[Contenido]

### 2. [Seccion]
[Contenido]

## Templates
[Codigo/ejemplos]

## Referencias
[Links externos]
```

Ubicacion: `skills/[categoria]/SKILL-[nombre].md`

---

*Generado automaticamente - NXT AI Framework v3.6.0*
