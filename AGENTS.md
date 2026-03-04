# NXT Agents Context

> **Version:** 3.6.0
> **Total Agentes:** 29 (28 activos + 1 deprecated)
> **Ubicacion:** `agentes/nxt-*.md`

Este archivo proporciona contexto rapido sobre todos los agentes del framework NXT.

---

## Indice por Categoria

### Core Team (10 agentes)
| Agente | Comando | Fase | Descripcion |
|--------|---------|------|-------------|
| **Orchestrator** | `/nxt/orchestrator` | Todas | Director del equipo, coordina agentes |
| **Analyst** | `/nxt/analyst` | Descubrir | Investigacion y analisis de negocio |
| **PM** | `/nxt/pm` | Definir | Product Manager, PRD, backlog |
| **Architect** | `/nxt/architect` | Disenar | Arquitectura de software, decisiones tecnicas |
| **UX** | `/nxt/ux` | Disenar | Experiencia de usuario, wireframes |
| **Dev** | `/nxt/dev` | Construir | Desarrollo general de codigo |
| **QA** | `/nxt/qa` | Verificar | Testing y validacion |
| **Tech Writer** | `/nxt/docs` | Documentar | Documentacion tecnica |
| **Scrum Master** | `/nxt/scrum` | Gestionar | Facilitador agile, sprints |
| **DevOps** | `/nxt/devops` | Deploy | CI/CD, Docker, operaciones |

### Especialistas Desarrollo (8 agentes)
| Agente | Comando | Especialidad |
|--------|---------|--------------|
| **API** | `/nxt/api` | Backend, REST, GraphQL, WebSockets |
| **Design** | `/nxt/design` | UX Research, UI Design, Frontend, React, Vue, componentes |
| **Database** | `/nxt/database` | PostgreSQL, MongoDB, migraciones |
| **CyberSec** | `/nxt/cybersec` | Seguridad, OWASP, auditorias |
| **Integrations** | `/nxt/integrations` | APIs externas, OAuth, webhooks |
| **Flows** | `/nxt/flows` | Jobs, cron, queues (app-level) |
| **Data** | `/nxt/data` | ETL, Airflow, Data Warehouse |
| **Realtime** | `/nxt/realtime` | WebSockets, SSE, streaming |

### Especialistas Infraestructura (4 agentes)
| Agente | Comando | Especialidad |
|--------|---------|--------------|
| **Infra** | `/nxt/infra` | Terraform, Kubernetes, Helm, Cloud |
| **Performance** | `/nxt/performance` | Optimizacion, profiling, caching |
| **Mobile** | `/nxt/mobile` | React Native, Flutter, PWA |
| **Migrator** | `/nxt/migrator` | Migraciones de codigo, upgrades |

### Especialistas Calidad (3 agentes)
| Agente | Comando | Especialidad |
|--------|---------|--------------|
| **Accessibility** | `/nxt/accessibility` | WCAG, a11y, lectores de pantalla |
| **Compliance** | `/nxt/compliance` | GDPR, HIPAA, SOC2, auditorias |
| **Localization** | `/nxt/localization` | i18n, l10n, traducciones |

### Multi-LLM (2 agentes)
| Agente | Comando | LLM | Uso |
|--------|---------|-----|-----|
| **Search** | `/nxt/search` | Gemini | Busquedas web, informacion actual |
| **Media** | `/nxt/media` | Gemini | Imagenes, videos, audio, TTS |

### AI/ML (1 agente)
| Agente | Comando | Especialidad |
|--------|---------|--------------|
| **AI/ML** | `/nxt/aiml` | Machine Learning, modelos, MLOps |

### Orquestador
| Agente | Estado | Archivo |
|--------|--------|---------|
| **Orchestrator** | ✅ ACTIVO | `nxt-orchestrator.md` (LangGraph + CrewAI + BMAD v6) |

---

## Matriz de Delegacion

### Cuando usar cada agente

```
Tarea de Negocio/Requisitos
└── /nxt/analyst -> /nxt/pm

Tarea de Arquitectura
└── /nxt/architect

Tarea de Codigo
├── Frontend -> /nxt/design
├── Backend -> /nxt/api
├── Database -> /nxt/database
├── General -> /nxt/dev
└── Mobile -> /nxt/mobile

Tarea de Infraestructura
├── CI/CD, Docker -> /nxt/devops
├── Terraform, K8s -> /nxt/infra
└── Performance -> /nxt/performance

Tarea de Datos
├── Jobs app-level -> /nxt/flows
├── Data Warehouse -> /nxt/data
└── Real-time -> /nxt/realtime

Tarea de Seguridad/Compliance
├── Seguridad codigo -> /nxt/cybersec
├── Regulaciones -> /nxt/compliance
└── Accesibilidad -> /nxt/accessibility

Tarea de Integracion
├── APIs externas -> /nxt/integrations
└── Migraciones -> /nxt/migrator

Tarea de AI/ML
└── /nxt/aiml

Tarea con info actual
└── /nxt/search (Gemini)

Tarea multimedia
└── /nxt/media (Gemini)
```

---

## Flujo por Fases

```
FASE 1: DESCUBRIR
└── /nxt/analyst

FASE 2: DEFINIR
└── /nxt/pm

FASE 3: DISENAR
├── /nxt/architect (tecnico)
└── /nxt/ux (experiencia)

FASE 4: PLANIFICAR
├── /nxt/pm (backlog)
└── /nxt/scrum (sprints)

FASE 5: CONSTRUIR
├── /nxt/dev (general)
├── /nxt/api (backend)
├── /nxt/design (UX+UI+frontend)
├── /nxt/database (datos)
└── /nxt/devops (deploy)

FASE 6: VERIFICAR
├── /nxt/qa (testing)
├── /nxt/cybersec (seguridad)
└── /nxt/docs (documentacion)
```

---

## Referencia Rapida de Archivos

| Archivo | Lineas | Contenido Principal |
|---------|--------|---------------------|
| `nxt-orchestrator.md` | ~400 | LangGraph, CrewAI, BMAD v6 |
| `nxt-analyst.md` | ~150 | Templates investigacion |
| `nxt-pm.md` | ~200 | PRD template, user stories |
| `nxt-architect.md` | ~350 | ADR, diagramas C4 |
| `nxt-ux.md` | ~300 | WCAG checklist, wireframes |
| `nxt-dev.md` | ~200 | Coding standards |
| `nxt-api.md` | ~400 | REST, GraphQL, OpenAPI |
| `nxt-design.md` | ~450 | UX Research, UI Design, React, componentes |
| `nxt-database.md` | ~300 | SQL, migraciones |
| `nxt-devops.md` | ~380 | GitHub Actions, Docker |
| `nxt-infra.md` | ~530 | Terraform, K8s, Helm |
| `nxt-cybersec.md` | ~400 | OWASP, auditorias |
| `nxt-data.md` | ~420 | Airflow, dbt, Kafka |
| `nxt-flows.md` | ~400 | BullMQ, cron jobs |

---

## Notas de Uso

1. **Siempre iniciar con el Orquestador**: `/nxt/orchestrator`
2. **Seguir el flujo de fases**: Descubrir -> Verificar
3. **Delegar al especialista**: No hacer todo con Dev general
4. **Leer el archivo del agente**: Contiene templates y checklists

---

*Generado automaticamente - NXT AI Framework v3.6.0*
