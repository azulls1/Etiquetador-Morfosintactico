# NXT AI Development Framework v3.6.0

> **"Construyendo el futuro, un sprint a la vez"**

Este proyecto utiliza el marco de desarrollo **NXT AI Development** de Grupo NXT.

---

## MODELO DE EJECUCIÓN v3.6.0 - EJECUCIÓN DIRECTA + PERSISTENCIA AUTOMÁTICA

> **Cambio fundamental en v3.4.0+**: Los slash commands ahora instruyen a Claude
> para leer archivos de agentes y ejecutar directamente usando sus herramientas.
> **No se requiere Claude CLI externo ni API keys adicionales.**
>
> **Nuevo en v3.5.1**: Agentes de persistencia AUTOMÁTICOS que se ejecutan en cada interacción.

### Cómo Funciona

| Comando | Qué Hace | Cómo Usarlo |
|---------|----------|-------------|
| `/nxt/orchestrator` | Coordina análisis del proyecto | Escribe el comando |
| `/nxt/dev` | Activa agente desarrollador | Claude lee `agentes/nxt-dev.md` |
| `/nxt/qa` | Activa agente QA | Claude lee `agentes/nxt-qa.md` |
| **Python CLI** | Información y planificación | `python herramientas/nxt_orchestrator_v3.py status` |

### Slash Commands = Ejecución Directa

Los slash commands instruyen a Claude para:
1. **Leer** el archivo del agente (`agentes/nxt-*.md`)
2. **Seguir** las instrucciones del agente
3. **Usar** herramientas disponibles: Read, Write, Edit, Bash, Grep, Glob

### CLI Python (Información y Planificación)

```bash
# Ver estado del sistema
python herramientas/nxt_orchestrator_v3.py status

# Analizar proyecto automáticamente
python herramientas/nxt_orchestrator_v3.py analyze

# Clasificar una tarea
python herramientas/nxt_orchestrator_v3.py classify "implementar auth"

# Planificar ejecución
python herramientas/nxt_orchestrator_v3.py plan "nueva feature"

# Ver cómo ejecutar agentes
python herramientas/nxt_orchestrator_v3.py how-to

# Listar agentes disponibles
python herramientas/nxt_orchestrator_v3.py agents
```

---

## REGLAS CRÍTICAS - LEER PRIMERO

### REGLA #1: AUTONOMÍA TOTAL - NUNCA PREGUNTAR

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AL RECIBIR CUALQUIER TAREA O COMANDO /nxt/:                                │
│                                                                             │
│  1. EJECUTAR: python herramientas/nxt_orchestrator_v3.py analyze           │
│  2. LEER archivos del proyecto (package.json, README.md, etc.)             │
│  3. BUSCAR TODOs con Grep                                                   │
│  4. MOSTRAR resumen y plan de acción                                        │
│  5. EJECUTAR plan sin preguntar                                             │
│                                                                             │
│  ❌ PROHIBIDO: "¿Quieres que...?", "¿Procedo?", "¿Tarea a ejecutar?"       │
│  ✅ CORRECTO: "Analizando...", "Ejecutando...", "Delegando a..."           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### REGLA #2: AL ACTIVAR /nxt/orchestrator - EJECUTAR INMEDIATAMENTE

**PASO 1** - Ejecutar con Bash:
```bash
python herramientas/nxt_orchestrator_v3.py analyze
```

**PASO 2** - Leer archivos clave del proyecto (en paralelo con Read):
- package.json, requirements.txt, README.md, CLAUDE.md

**PASO 3** - Buscar tareas pendientes (con Grep):
```
TODO:|FIXME:|HACK:|XXX:
```

**PASO 4** - Mostrar resumen con plan de acción

**PASO 5** - Si hay tarea específica, leer el agente apropiado y ejecutar

### REGLA #3: LEER AGENTES ANTES DE ACTUAR

Cada agente tiene instrucciones específicas en `agentes/nxt-*.md`.
**SIEMPRE** leer el archivo del agente antes de ejecutar su especialidad.

### REGLA #4: AGENTES DE PERSISTENCIA - EJECUCIÓN EN CADA INTERACCIÓN (v3.5.1)

```
╔═════════════════════════════════════════════════════════════════════════════╗
║  🔄 AGENTES DE PERSISTENCIA - CORAZÓN DEL FRAMEWORK                         ║
╠═════════════════════════════════════════════════════════════════════════════╣
║                                                                             ║
║  ⚠️  REGLA CRÍTICA: EJECUTAR EN CADA MENSAJE DEL USUARIO                    ║
║                                                                             ║
║  CADA VEZ que el usuario envía un mensaje o hace una petición,              ║
║  Claude DEBE ejecutar TODOS estos agentes:                                  ║
║                                                                             ║
║  ┌─────────────────┬────────────────────────────────────────────────────┐  ║
║  │ nxt-context     │ Cargar/guardar contexto de la sesión               │  ║
║  │ nxt-multicontext│ Mantener checkpoints y estado persistente          │  ║
║  │ nxt-changelog   │ Documentar cambios realizados (con anti-loop)      │  ║
║  │ nxt-ralph       │ Evaluar si hay tareas iterativas pendientes        │  ║
║  └─────────────────┴────────────────────────────────────────────────────┘  ║
║                                                                             ║
║  FLUJO DE CADA INTERACCIÓN:                                                 ║
║  ┌─────────────────────────────────────────────────────────────────────┐   ║
║  │  1. Usuario envía mensaje                                           │   ║
║  │  2. Claude lee .nxt/state.json (contexto previo)                    │   ║
║  │  3. Claude ejecuta la tarea solicitada                              │   ║
║  │  4. Claude actualiza contexto (nxt-context)                         │   ║
║  │  5. Claude crea checkpoint si hay cambios (nxt-multicontext)        │   ║
║  │  6. Claude documenta cambios significativos (nxt-changelog)         │   ║
║  │  7. Claude evalúa tareas pendientes (nxt-ralph)                     │   ║
║  └─────────────────────────────────────────────────────────────────────┘   ║
║                                                                             ║
║  TRIGGER "always" = TODOS los agentes en CADA interacción                   ║
║                                                                             ║
╚═════════════════════════════════════════════════════════════════════════════╝
```

**¿POR QUÉ ES CRÍTICO?**
Estos agentes son el **sistema de memoria** del framework:
- Sin `nxt-context`: Claude olvida decisiones y preferencias entre mensajes
- Sin `nxt-multicontext`: No hay recovery si el contexto se compacta
- Sin `nxt-changelog`: No hay documentación automática de cambios
- Sin `nxt-ralph`: Las tareas complejas no se iteran correctamente

**EJECUCIÓN OBLIGATORIA EN CADA MENSAJE:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AL RECIBIR CUALQUIER MENSAJE DEL USUARIO:                                  │
│                                                                             │
│  PASO 0 (ANTES de cualquier otra cosa):                                     │
│  → Leer .nxt/state.json                                                     │
│  → Verificar contexto de agentes/nxt-context.md                             │
│  → Verificar checkpoints de agentes/nxt-multicontext.md                     │
│                                                                             │
│  PASO FINAL (DESPUÉS de completar la tarea):                                │
│  → Actualizar .nxt/state.json con nuevo contexto                            │
│  → Documentar cambios si son significativos (nxt-changelog)                 │
│  → Crear checkpoint si hubo cambios importantes (nxt-multicontext)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**COMANDOS MANUALES (si se necesita forzar):**
```
/nxt/context      → Gestionar contexto manualmente
/nxt/checkpoint   → Crear checkpoint manual
/nxt/resume       → Recuperar desde checkpoint
/nxt/changelog    → Generar changelog de cambios
```

**CLI:**
```bash
python herramientas/nxt_orchestrator_v3.py persistence
python herramientas/nxt_orchestrator_v3.py persistence --trigger always
```

---

## Novedades v3.6.0 - FUSION UX + UI = PRODUCT DESIGNER

### Cambios principales
- **FUSION**: Agentes `nxt-ux` y `nxt-uidev` fusionados en `nxt-design`
- **NUEVO**: Agente `nxt-design` - Product Designer & Design Engineer
- **MEJORADO**: Ciclo completo de diseno (Research -> UX -> UI -> Code)
- **ELIMINADO**: `/nxt/ux` y `/nxt/uidev` (usar `/nxt/design`)

### Nuevo Agente: NXT Design
| Capacidad | Descripcion |
|-----------|-------------|
| UX Research | Personas, journey maps, user insights |
| UX Architecture | User flows, wireframes, prototipos |
| Visual Design | UI design, design systems, mockups |
| Implementation | Componentes React/Vue, responsive, a11y |
| Performance | Core Web Vitals, optimizacion frontend |

### Comando
```bash
/nxt/design        # Activa Product Designer completo
```

### Filosofia
> "Design is not just how it looks, it's how it works"
> - Cada pixel tiene proposito
> - Accesibilidad no es feature, es requisito
> - Performance es UX

---

## Novedades v3.5.1 - AGENTES DE PERSISTENCIA AUTOMATICOS

### Cambios principales
- **NUEVO**: Agentes de persistencia ejecutados automáticamente
- **NUEVO**: Sistema de triggers para activación automática
- **NUEVO**: Comando CLI `persistence` para gestionar agentes de persistencia
- **MEJORADO**: Documentación automática con nxt-changelog en cada sesión
- **MEJORADO**: Recovery automático con nxt-multicontext

### Agentes de Persistencia
| Agente | Propósito | Trigger |
|--------|-----------|---------|
| `nxt-context` | Contexto entre sesiones | always, on_session_start, on_session_end |
| `nxt-multicontext` | Checkpoints y recovery | on_session_start, on_agent_switch, on_checkpoint |
| `nxt-changelog` | Documentar cambios | on_task_complete, on_session_end |
| `nxt-ralph` | Desarrollo autónomo | on_checkpoint |

### Nuevos Comandos
```bash
# Ver agentes de persistencia
python herramientas/nxt_orchestrator_v3.py persistence

# Ver agentes para un trigger específico
python herramientas/nxt_orchestrator_v3.py persistence --trigger on_task_complete

# Ver estado con información de persistencia
python herramientas/nxt_orchestrator_v3.py status
```

---

## Novedades v3.5.0 - CI/CD + SINCRONIZACIÓN

### Cambios principales
- **NUEVO**: GitHub Actions CI (multi-OS, multi-Python)
- **NUEVO**: GitHub Actions Release (changelog automático)
- **NUEVO**: Dockerfile multi-stage
- **NUEVO**: requirements.txt
- **MEJORADO**: Todas las versiones sincronizadas a 3.5.0
- **MEJORADO**: State.json limpio sin tareas pendientes antiguas

### Documentación generada
- `docs/1-analysis/project-brief.md` - Análisis de negocio
- `docs/2-planning/prd.md` - Product Requirements Document
- `docs/3-solutioning/architecture.md` - Arquitectura técnica
- `docs/3-solutioning/ux-audit.md` - Auditoría UX
- `docs/4-implementation/qa-report.md` - Reporte de QA

---

## Novedades v3.4.0 - EJECUCIÓN DIRECTA

### Cambio de Arquitectura
- **ELIMINADO**: Claude CLI externo (`claude -p`) que requería API key
- **NUEVO**: Ejecución directa via slash commands
- **NUEVO**: Claude lee archivos de agentes y actúa con sus herramientas

### Cómo Usar
```bash
# ✅ USAR slash commands
/nxt/dev mi tarea           # Slash command
/nxt/orchestrator           # Coordinación automática
```

---

## Novedades v3.3.0 - INTEGRACIÓN COMPLETA + PERSISTENCIA DE CONTEXTO

### Sistema de Persistencia de Contexto (NUEVO)
- **MultiContext Agent**: Gestión de checkpoints y recovery
- **SKILL Context Persistence**: Serialización de estado
- **CLI context_manager.py**: Herramienta para gestión de checkpoints
- **Auto-checkpoints**: Triggers on_agent_switch, on_step_complete, on_decision
- **Recovery System**: Recuperación automática tras compactación de contexto

### Nuevos Agentes (v3.3.0)
- `nxt-context`: Gestión de contexto entre sesiones
- `nxt-changelog`: Generación automática de changelogs
- `nxt-ralph`: Desarrollo autónomo iterativo (hasta 50 iteraciones)
- `nxt-multicontext`: Persistencia y recovery de contexto

### Integración Total
- **33 Agentes NXT** completamente integrados
- **19 Skills** mapeados a MCP servers
- **Mappings actualizados**: BMAD↔NXT, Skills→MCP, Capabilities
- **Orquestador v3**: Soporta 25+ TaskTypes
- **Claude CLI Integration**: Ejecución REAL de agentes via CLI

### Stats
- **Agentes**: 33 (+4)
- **Skills**: 19 (+2)
- **Comandos avanzados**: 23 (+6)

---

## Novedades v3.1.0 - SISTEMA AUTÓNOMO COMPLETO

### Self-Healing y Autonomía (NUEVO)
- **SelfHealingManager**: Auto-recuperación con circuit breaker
- **HealthMetrics**: Monitoreo de salud en tiempo real
- **Learning from Decisions**: Aprendizaje de patrones históricos
- **Predictive Classification**: Clasificación basada en historial
- **4 Recovery Strategies**: retry, skip, fallback, reset

### Scores del Sistema
- **Integración**: 98/100
- **Autonomía**: 95/100

---

## Novedades v2.0.0 - INTEGRACIÓN TOTAL

### Sistema Completamente Integrado

- **Orquestador v3**: Sistema autónomo con 5 niveles BMAD, Event Bus y ejecución automática
- **Event Bus**: Comunicación pub/sub entre todos los componentes
- **MCP Manager**: Habilitación dinámica de 16 servidores MCP
- **Agent Executor**: Ejecución autónoma de workflows con retry y checkpoints
- **Hooks System**: 4 hooks (on_init, on_agent_switch, on_step_complete, on_workflow_complete)
- **Registries Dinámicos**: Carga automática de agentes, skills y workflows

### Nuevos Archivos de Integración

| Archivo | Propósito |
|---------|-----------|
| `herramientas/nxt_orchestrator_v3.py` | Orquestador con 5 niveles BMAD |
| `herramientas/event_bus.py` | Sistema de eventos pub/sub |
| `herramientas/mcp_manager.py` | Gestión dinámica de MCP servers |
| `herramientas/agent_executor.py` | Ejecución autónoma de agentes |
| `.nxt/bmad-nxt-mapping.yaml` | Mapeo BMAD ↔ NXT |
| `.nxt/skill-mcp-mapping.yaml` | Mapeo Skills → MCP servers |
| `.nxt/capabilities.yaml` | Capacidades por agente |
| `plugins/nxt-core/hooks/*.py` | 4 hooks de sistema |

### Arquitectura Integrada

```
┌─────────────────────────────────────────────────────────────┐
│                    NXT ORCHESTRATOR v3                       │
│  • 5 niveles BMAD  • Auto-delegación  • State sync          │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ AGENT REGISTRY│   │ SKILL REGISTRY│   │WORKFLOW REGIST│
│ 29 NXT + 12   │   │ 19 Skills     │   │ BMAD + NXT    │
│ BMAD agents   │   │ Auto-load     │   │ workflows     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        └───────────────────┼───────────────────┘
                            ▼
                    ┌───────────────┐
                    │   EVENT BUS   │
                    │  Pub/Sub      │
                    └───────┬───────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    ▼                       ▼                       ▼
┌────────┐           ┌────────────┐           ┌────────┐
│ HOOKS  │           │    MCP     │           │ STATE  │
│4 scripts│           │ 16 servers │           │Persist │
└────────┘           └────────────┘           └────────┘
```

---

## REGLA OBLIGATORIA - Comportamiento AUTÓNOMO

**IMPORTANTE: El framework NXT opera de forma AUTÓNOMA. NO PREGUNTES, ACTÚA.**

> **Reglas detalladas:** Ver `.claude/rules/agent-usage.md` para la guia completa de delegacion.

### Principio Fundamental: AUTONOMÍA TOTAL

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  PROHIBIDO TERMINANTEMENTE:                                                ║
║  ❌ "¿Quieres que ejecute...?"    ❌ "¿Continúo con...?"                  ║
║  ❌ "¿Deseas que analice...?"     ❌ "¿Procedo con...?"                   ║
║  ❌ "¿Te gustaría que...?"        ❌ "¿Debería...?"                       ║
║                                                                            ║
║  OBLIGATORIO:                                                              ║
║  ✅ "Ejecutando..."  ✅ "Analizando..."  ✅ "Delegando a..."              ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**REGLA DE COMPLETITUD:** SIEMPRE ejecutar los 33 agentes.
Cada uno aporta perspectiva única. No hay tareas "simples" que solo necesiten 3 agentes.

**Comandos para ejecutar todos los agentes:**
```bash
# Ejecutar TODOS los agentes (regla de completitud)
python herramientas/nxt_orchestrator_v3.py all-agents "tu tarea"

# Ejecución 100% autónoma (analiza + ejecuta todos)
python herramientas/nxt_orchestrator_v3.py auto "tu tarea"
```

### Comportamiento Autónomo Requerido

1. **SIEMPRE actuar sin esperar confirmación** para:
   - Leer y analizar archivos del proyecto
   - Detectar stack tecnológico y arquitectura
   - Clasificar tareas (nivel 0-4)
   - Crear planes de ejecución
   - Llamar a agentes especializados
   - Ejecutar tareas de nivel 0-2 automáticamente

2. **SOLO preguntar** cuando hay:
   - Ambigüedad REAL que no se puede resolver con contexto
   - Decisiones destructivas (eliminar archivos, resetear DB)
   - Nivel 4 (Enterprise) - validación de hitos críticos

3. **Al activar el Orquestador**, INMEDIATAMENTE:
   - Detectar tipo de proyecto (package.json, requirements.txt, etc.)
   - Analizar estructura del codebase
   - Identificar TODOs, issues, deuda técnica
   - Proponer y EJECUTAR plan de acción

4. **SIEMPRE delegar al agente apropiado** segun el tipo de tarea:
   | Tipo de Tarea | Agente | Comando |
   |---------------|--------|---------|
   | Analisis/Investigacion | Analyst | `/nxt/analyst` |
   | PRD/Requisitos | PM | `/nxt/pm` |
   | Arquitectura/Diseno tecnico | Architect | `/nxt/architect` |
   | UX/UI/Design | Product Designer | `/nxt/design` |
   | Desarrollo general | Developer | `/nxt/dev` |
   | Backend/APIs | API Developer | `/nxt/api` |
   | Base de datos | Database | `/nxt/database` |
   | Testing/QA | QA Engineer | `/nxt/qa` |
   | Seguridad | CyberSec | `/nxt/cybersec` |
   | DevOps/Deploy | DevOps | `/nxt/devops` |
   | Documentacion | Tech Writer | `/nxt/docs` |
   | Integraciones | Integrations | `/nxt/integrations` |
   | Flujos de datos | Flows | `/nxt/flows` |
   | Busquedas web | Search (Gemini) | `/nxt/search` |
   | Multimedia | Media (Gemini) | `/nxt/media` |
   | Migracion/Modernizacion | Migrator | `/nxt/migrator` |
   | Performance/Optimizacion | Performance | `/nxt/performance` |
   | Accesibilidad (a11y) | Accessibility | `/nxt/accessibility` |
   | IaC/Kubernetes | Infrastructure | `/nxt/infra` |
   | Mobile (RN/Flutter) | Mobile | `/nxt/mobile` |
   | Data Engineering | Data | `/nxt/data` |
   | AI/ML Engineering | AI/ML | `/nxt/aiml` |
   | Compliance/GDPR | Compliance | `/nxt/compliance` |
   | Realtime/WebSockets | Realtime | `/nxt/realtime` |
   | i18n/Localization | Localization | `/nxt/localization` |

3. **SIEMPRE leer el archivo del agente** antes de ejecutar tareas
   - Los agentes estan en `agentes/nxt-*.md`
   - Seguir las instrucciones, plantillas y checklists del agente

4. **SIEMPRE usar el workflow por fases**:
   ```
   Descubrir -> Definir -> Disenar -> Planificar -> Construir -> Verificar
   ```

5. **SIEMPRE mostrar el banner NXT** al inicio de cada sesion

### Ejemplo de Flujo AUTÓNOMO Correcto

```
Usuario: "Necesito agregar autenticacion OAuth"

Claude (INMEDIATAMENTE, sin preguntar):

🎯 NXT ORCHESTRATOR - Modo Autónomo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Clasificando tarea...
→ Nivel 3 (Complejo): Feature de autenticación OAuth
→ Agentes requeridos: Architect, API, CyberSec, QA

📋 Plan de ejecución:
1. Arquitectura de auth (nxt-architect)
2. Implementación backend (nxt-api)
3. Validación seguridad (nxt-cybersec)
4. Tests (nxt-qa)

🚀 Ejecutando Fase 1: Arquitectura
[Lee agentes/nxt-architect.md]
[Analiza codebase existente]
[Diseña flujo OAuth]

✓ Arquitectura propuesta:
  - OAuth 2.0 + PKCE
  - Providers: Google, GitHub
  - JWT tokens con refresh

🚀 Ejecutando Fase 2: Implementación...
[Lee agentes/nxt-api.md]
[Crea endpoints /auth/*]
[Implementa middleware]

✓ Implementado:
  - src/api/auth/oauth.ts
  - src/middleware/auth.ts
  - src/config/oauth-providers.ts

🚀 Ejecutando Fase 3: Seguridad...
[Validación OWASP automática]
...
```

### Anti-Patrones (NO HACER NUNCA)

❌ "¿Qué te gustaría hacer hoy?"
❌ "¿En qué puedo ayudarte?"
❌ "¿Quieres que analice el proyecto?"
❌ "¿Debería crear un plan primero?"
❌ Esperar confirmación para leer archivos
❌ Preguntar qué agente usar
❌ Pedir permiso para ejecutar tareas triviales

### Patrones Correctos (HACER SIEMPRE)

✅ "Analizando proyecto automáticamente..."
✅ "Detecté [stack], ejecutando [análisis]..."
✅ "Clasificado como nivel [X], delegando a [agente]..."
✅ "Plan creado. Ejecutando fase 1..."
✅ Actuar primero, reportar después
✅ Tomar decisiones basadas en contexto

---

## Novedades v1.3.1

- **BMAD v6 Alpha Integration**:
  - Sistema de 5 niveles (0-4) reemplaza Bug Fix/Feature/Epic/Enterprise
  - Workflow Shard-Doc para dividir documentos grandes
  - Sistema Agent Sidecar para personalización sin modificar core
  - Stack Detection mejorado con detección de 50+ tecnologías
  - Documentation Guides con estructura Diátaxis (4 categorías)
- **Nuevo Agente NXT Paige**:
  - Asistente de documentación y onboarding
  - Tour guiado del framework
  - FAQ y glosario integrados
  - Navegación inteligente por documentación
- **30 Agentes Total**: Cobertura completa del ciclo de desarrollo
- **Workflow Vendoring**:
  - Bundles standalone de workflows para distribución
  - Análisis automático de dependencias
  - Instalación en otros proyectos
- **Herramientas CLI**:
  - `stack_detector.py` - Detección automática de stack
  - `vendor.py` - Crear bundles de workflows
  - Soporte para sidecars en agentes

## Novedades v1.3.0

- **10 Nuevos Agentes Especializados**:
  - `nxt-migrator`: Migracion y modernizacion de codigo
  - `nxt-performance`: Optimizacion y Web Vitals
  - `nxt-accessibility`: Accesibilidad WCAG 2.1
  - `nxt-infra`: Terraform, Kubernetes, IaC
  - `nxt-mobile`: React Native, Flutter, iOS/Android
  - `nxt-data`: ETL, Airflow, dbt, Data Engineering
  - `nxt-aiml`: MLOps, LLM Engineering, RAG
  - `nxt-compliance`: GDPR, SOC 2, Licencias
  - `nxt-realtime`: WebSockets, SSE, Presence
  - `nxt-localization`: i18n, RTL, Traducciones
- **8 Nuevos Skills**:
  - `SKILL-refactoring`: Code smells y patrones
  - `SKILL-migrations`: Database migrations
  - `SKILL-monitoring`: APM, logging, alertas
  - `SKILL-containers`: Docker avanzado, Kubernetes
  - `SKILL-api-docs`: OpenAPI, Postman
  - `SKILL-markdown-advanced`: MDX, Mermaid, Docusaurus
  - `SKILL-mcp`: Model Context Protocol
  - `SKILL-webhooks`: Inbound/outbound webhooks
- **29 Agentes Total**: Cobertura completa del ciclo de desarrollo
- **17 Skills Total**: Capacidades especializadas
- **15 MCP Servers**: Integraciones extendidas
- **Mensajes de bienvenida** en todos los agentes

## Novedades v1.2.3

- **Migración completa a Gemini para multimedia** (antes OpenAI)
- **Nuevos modelos**:
  - `gemini-3-pro-preview` - Búsquedas y razonamiento
  - `nano-banana-pro-preview` - Imágenes (mejor que DALL-E)
  - `veo-3.0-generate-001` - Videos con audio nativo
  - `gemini-2.5-pro-preview-tts` - TTS (30 voces)
- **Arquitectura simplificada**: Solo Claude + Gemini

## Novedades v1.2.2

- **6 Nuevos Agentes Especializados**:
  - `nxt-cybersec`: Seguridad y auditoria OWASP
  - `nxt-uidev`: Desarrollo de interfaces UI
  - `nxt-api`: Desarrollo backend y APIs
  - `nxt-database`: Gestion de bases de datos
  - `nxt-integrations`: Integraciones externas
  - `nxt-flows`: Flujos de datos y jobs
- **19 Agentes Total**: Equipo completo de desarrollo

## Novedades v1.2.1

- **Quick Start**: Guia de 5 minutos (`QUICKSTART.md`)
- **Validador**: `validate_setup.py` para verificar configuracion
- **9 Plantillas**: Entregables por fase en `plantillas/entregables/`
- **80+ Tests**: Tests automatizados en `tests/`
- **Ejemplos**: Bug fix y Feature auth en `ejemplos/`
- **Homologacion**: Formato unificado `/nxt/[agente]` en todo el proyecto
- **MCP Servers**: GitHub, Filesystem, Memory, PostgreSQL, Slack
- **Orquestador v2**: Patrones LangGraph + CrewAI + BMAD v6
- **4 Nuevos Agentes**: Tech Writer, Scrum Master, DevOps, Orchestrator v2

## Inicio Rapido

```
/nxt/init          -> Inicializar proyecto
/nxt/orchestrator  -> Activar orquestador principal
/nxt/help          -> Ver todos los comandos
```

## Comandos Disponibles

### Generales
| Comando | Descripcion |
|---------|-------------|
| `/nxt/init` | Inicializar proyecto NXT |
| `/nxt/orchestrator` | Activar orquestador (director del equipo) |
| `/nxt/status` | Ver estado del proyecto |
| `/nxt/help` | Ayuda completa |

### Por Agente (32 agentes)
| Comando | Rol | Fase |
|---------|-----|------|
| `/nxt/analyst` | Analista de negocio | Descubrir |
| `/nxt/pm` | Product Manager | Definir/Planificar |
| `/nxt/architect` | Arquitecto de software | Disenar |
| `/nxt/design` | Product Designer (UX+UI) | Disenar/Construir |
| `/nxt/dev` | Desarrollador | Construir |
| `/nxt/qa` | QA Engineer | Verificar |
| `/nxt/docs` | Tech Writer | Documentar |
| `/nxt/scrum` | Scrum Master | Gestionar |
| `/nxt/devops` | DevOps Engineer | Deploy |
| `/nxt/cybersec` | Seguridad OWASP | Verificar |
| `/nxt/api` | Backend Developer | Construir |
| `/nxt/database` | Database Admin | Construir |
| `/nxt/integrations` | Integraciones | Construir |
| `/nxt/flows` | Data Flows | Construir |
| `/nxt/search` | Busquedas web (Gemini) | Cualquiera |
| `/nxt/media` | Multimedia (Gemini) | Cualquiera |
| `/nxt/migrator` | Migracion y modernizacion | Construir |
| `/nxt/performance` | Optimizacion y Web Vitals | Verificar |
| `/nxt/accessibility` | Accesibilidad WCAG 2.1 | Verificar |
| `/nxt/infra` | Terraform/Kubernetes | Deploy |
| `/nxt/mobile` | React Native/Flutter | Construir |
| `/nxt/data` | Data Engineering | Construir |
| `/nxt/aiml` | AI/ML Engineering | Construir |
| `/nxt/compliance` | GDPR/SOC 2/Licencias | Verificar |
| `/nxt/realtime` | WebSockets/SSE | Construir |
| `/nxt/localization` | i18n/L10n | Construir |
| `/nxt/paige` | Documentacion y Onboarding | Cualquiera |

## MCP Servers Integrados (19 total)

```json
// .claude/mcp.json
{
  "github": "Repos, PRs, issues, workflows",
  "filesystem": "Acceso avanzado al proyecto",
  "memory": "Memoria persistente entre sesiones",
  "postgres": "Conexion directa a PostgreSQL",
  "sqlite": "Base de datos SQLite local",
  "slack": "Notificaciones y comunicacion",
  "sentry": "Error tracking y monitoring",
  "notion": "Knowledge base y docs",
  "linear": "Project management",
  "docker": "Container management",
  "fetch": "HTTP requests externos",
  "redis": "Cache y pub/sub",
  "brave-search": "Busquedas web",
  "puppeteer": "Browser automation",
  "jira": "Gestion de tickets y sprints (Atlassian)",
  "figma": "Design handoff y tokens",
  "kubernetes": "Cluster y pod management",
  "cloudflare": "Edge deployment, Workers, CDN",
  "stripe": "Pagos, subscripciones, billing"
}
```

Para habilitar MCP servers, configura las API keys en `.env`

## Orquestacion Multi-Agente

### Inteligencia Adaptativa por Nivel (BMAD v6 Alpha)

| Nivel | Nombre | Tiempo | Agentes | Documentacion | Track |
|-------|--------|--------|---------|---------------|-------|
| **0** | Trivial | < 15min | Solo Dev | Ninguna | Instant |
| **1** | Simple | 15min-1h | Dev + QA | Minima | Quick Flow (~5 min) |
| **2** | Estandar | 1-8h | Dev, QA, PM | Story + Tests | BMad Method (~15 min) |
| **3** | Complejo | 8-40h | Full Team | PRD + Arch | Full Planning |
| **4** | Enterprise | 40h+ | Multi-Team | Full Documentation | Enterprise (~30 min) |

### Workflow como Grafos (LangGraph)
```
[INICIO] -> [CLASIFICAR NIVEL] -> [DECISION]
                                      |
                +----------+----------+----------+----------+
                |          |          |          |          |
            [NIV 0]    [NIV 1]    [NIV 2]    [NIV 3]    [NIV 4]
            Instant    Quick     Standard   Complex   Enterprise
                |          |          |          |          |
            [DEV]     [DEV+QA]   [DESIGN]  [FULL]    [MULTI]
                |          |          |          |          |
                +----------+----------+----------+----------+
                                      |
                                  [REVIEW] -> [QA] -> [DEPLOY]
```

### CLI de Orquestación v3 (NUEVO)

```bash
# ====== EJECUCIÓN VIA CLAUDE CLI (REAL) ======

# Ejecutar TODOS los agentes (REGLA DE COMPLETITUD)
python herramientas/nxt_orchestrator_v3.py all-agents "tu tarea"

# Ejecución 100% AUTÓNOMA (analiza + ejecuta todos)
python herramientas/nxt_orchestrator_v3.py auto "tu tarea"

# Ejecutar un agente individual via Claude CLI
python herramientas/nxt_orchestrator_v3.py run-agent nxt-dev "tu tarea"

# Ejecutar agentes en paralelo via Claude CLI
python herramientas/nxt_orchestrator_v3.py parallel \
  --agents 'nxt-analyst,nxt-dev,nxt-qa' \
  --task 'tu tarea'

# ====== PLANIFICACIÓN Y CLASIFICACIÓN ======

# Planificar tarea (usa 5 niveles BMAD)
python herramientas/nxt_orchestrator_v3.py plan "implementar autenticación"

# Clasificar escala (nivel_0 a nivel_4)
python herramientas/nxt_orchestrator_v3.py classify "fix typo in readme"

# Delegar a agente específico
python herramientas/nxt_orchestrator_v3.py delegate "crear API REST" --type implementation

# ====== INFORMACIÓN DEL SISTEMA ======

# Ver estado del orquestador
python herramientas/nxt_orchestrator_v3.py status

# Listar agentes (NXT + BMAD)
python herramientas/nxt_orchestrator_v3.py agents

# Listar skills disponibles
python herramientas/nxt_orchestrator_v3.py skills

# Listar workflows
python herramientas/nxt_orchestrator_v3.py workflows

# ====== HERRAMIENTAS AUXILIARES ======

# Ejecutar tarea autónomamente (dry-run)
python herramientas/agent_executor.py execute "add search feature" --dry-run

# Ver eventos del sistema
python herramientas/event_bus.py --demo

# Gestionar MCP servers
python herramientas/mcp_manager.py status
python herramientas/mcp_manager.py enable github
python herramientas/mcp_manager.py list --enabled
```

### CLI Legacy (compatible)
```bash
python herramientas/orchestrator.py plan "implementar autenticacion"
python herramientas/orchestrator.py status
python herramientas/orchestrator.py classify "fix typo in readme"
python herramientas/orchestrator.py delegate implementation
```

## Estructura del Proyecto

```
.nxt/                    # Configuracion del framework
├── nxt.config.yaml      # Config principal
├── state.json           # Estado persistente v2.0
├── version.txt          # 3.3.0
├── bmad-nxt-mapping.yaml   # v2.0: Mapeo BMAD ↔ NXT
├── skill-mcp-mapping.yaml  # v2.0: Mapeo Skills → MCP
├── capabilities.yaml       # v2.0: Capacidades por agente
└── checkpoints/            # v2.0: Checkpoints de ejecución

.claude/                 # Integracion Claude Code
├── commands/nxt/        # 21 slash commands
├── mcp.json             # MCP Servers config (nuevo)
└── settings.local.json

agentes/                 # 32 agentes NXT
├── nxt-orchestrator.md     # LangGraph + CrewAI + BMAD v6
├── nxt-analyst.md
├── nxt-pm.md
├── nxt-architect.md
├── nxt-design.md           # v3.6.0: Product Designer (fusion UX+UI)
├── nxt-dev.md
├── nxt-qa.md
├── nxt-tech-writer.md      # Documentacion
├── nxt-scrum-master.md     # Agile
├── nxt-devops.md           # CI/CD
├── nxt-cybersec.md         # Seguridad OWASP
├── nxt-api.md              # Backend/APIs
├── nxt-database.md         # Base de datos
├── nxt-integrations.md     # Integraciones
├── nxt-flows.md            # Flujos de datos
├── nxt-search.md
├── nxt-media.md
├── nxt-migrator.md         # v1.3.0: Migracion/Modernizacion
├── nxt-performance.md      # v1.3.0: Web Vitals/Optimizacion
├── nxt-accessibility.md    # v1.3.0: WCAG 2.1 a11y
├── nxt-infra.md            # v1.3.0: Terraform/K8s
├── nxt-mobile.md           # v1.3.0: React Native/Flutter
├── nxt-data.md             # v1.3.0: Data Engineering
├── nxt-aiml.md             # v1.3.0: AI/ML Engineering
├── nxt-compliance.md       # v1.3.0: GDPR/SOC 2
├── nxt-realtime.md         # v1.3.0: WebSockets/SSE
├── nxt-localization.md     # v1.3.0: i18n/L10n
└── nxt-paige.md            # v1.3.1: Documentación/Onboarding

plugins/                 # Sistema de plugins
└── nxt-core/
    ├── manifest.json
    └── hooks/              # v2.0: Hooks del sistema
        ├── on-init.py
        ├── on-agent-switch.py
        ├── on-step-complete.py
        └── on-workflow-complete.py

herramientas/            # CLI Python
├── gemini_tools.py
├── openai_tools.py
├── llm_router.py
├── orchestrator.py      # Multi-agent orchestrator (legacy)
├── nxt_orchestrator_v3.py  # v2.0: Orquestador con 5 niveles BMAD
├── event_bus.py         # v2.0: Sistema de eventos pub/sub
├── mcp_manager.py       # v2.0: Gestión dinámica de MCP
├── agent_executor.py    # v2.0: Ejecución autónoma de workflows
├── validate_setup.py    # Validador de configuracion
├── stack_detector.py    # v1.3.1: Detección de stack
├── vendor.py            # v1.3.1: Workflow Vendoring
└── utils.py

docs/guides/             # v1.3.1: Documentation Guides (Diátaxis)
├── README.md            # Índice de guías
├── tutorials/           # Tutoriales paso a paso
├── how-to/              # Guías prácticas
├── explanation/         # Conceptos profundos
└── reference/           # Especificaciones técnicas

tests/                   # Tests automatizados
├── conftest.py
├── test_llm_router.py
├── test_orchestrator.py
├── test_gemini_tools.py
└── test_openai_tools.py

plantillas/entregables/  # 9 plantillas
├── project-brief.md
├── prd.md
├── user-story.md
├── architecture.md
└── ... (tech-spec, epic, sprint, code-review, qa-report)

skills/                  # 17 skills
├── documentos/
│   ├── SKILL-docx.md
│   ├── SKILL-pdf.md
│   ├── SKILL-pptx.md
│   ├── SKILL-xlsx.md
│   ├── SKILL-api-docs.md       # v1.3.0
│   └── SKILL-markdown-advanced.md  # v1.3.0
├── desarrollo/
│   ├── SKILL-testing.md
│   ├── SKILL-code-review.md
│   ├── SKILL-diagrams.md
│   ├── SKILL-refactoring.md    # v1.3.0
│   ├── SKILL-migrations.md     # v1.3.0
│   ├── SKILL-monitoring.md     # v1.3.0
│   └── SKILL-containers.md     # v1.3.0
└── integraciones/
    ├── SKILL-gemini.md
    ├── SKILL-openai.md
    ├── SKILL-mcp.md            # v1.3.0
    └── SKILL-webhooks.md       # v1.3.0

workflows/               # 6 fases + especiales
├── fase-1-descubrir/
├── fase-2-definir/
├── fase-3-disenar/
├── fase-4-planificar/
├── fase-5-construir/
├── fase-6-verificar/
├── shard-doc.md         # v1.3.1: Document sharding
├── brownfield.md
└── vendoring.md         # v1.3.1: Workflow bundles
docs/                    # Documentacion generada
nxt/                     # BMAD Method v6
```

## Arquitectura LLM

| LLM | Uso | Modelo |
|-----|-----|--------|
| **Claude** | Codigo, documentos, razonamiento | `claude-opus-4-5-20251101` |
| **Gemini** | Busquedas, multimedia, verificacion | Ver tabla abajo |

### Modelo Claude

| Funcion | Modelo | Descripcion |
|---------|--------|-------------|
| Orquestador | `claude-opus-4-5-20251101` | Claude Opus 4.5 - El mas potente |
| Codigo | `claude-opus-4-5-20251101` | 80.9% SWE-bench |
| Documentos | `claude-opus-4-5-20251101` | 200K tokens contexto |
| Razonamiento codigo/arquitectura | `claude-opus-4-5-20251101` | Logica y decisiones tecnicas |

### Modelos Gemini

| Funcion | Modelo |
|---------|--------|
| Busquedas/Default | `gemini-3-pro-preview` |
| Razonamiento + info actual | `gemini-3-pro-preview` |
| Imagenes | `nano-banana-pro-preview` |
| Videos | `veo-3.0-generate-001` |
| TTS | `gemini-2.5-pro-preview-tts` |

## Fases de Desarrollo

1. **Descubrir** - Brainstorming, investigacion, analisis
2. **Definir** - PRD, requisitos, backlog
3. **Disenar** - Arquitectura, UX, tech spec
4. **Planificar** - Epics, stories, sprints
5. **Construir** - Codigo, tests, documentacion
6. **Verificar** - QA, validacion, regresion

## Configuracion

| Archivo | Proposito |
|---------|-----------|
| `.env` | API Keys (Gemini, OpenAI, GitHub) |
| `.nxt/nxt.config.yaml` | Config del framework |
| `.claude/mcp.json` | MCP Servers |
| `.nxt/state.json` | Estado persistente |

## Recursos

| Recurso | Ubicacion |
|---------|-----------|
| Agentes NXT | `agentes/nxt-*.md` |
| Skills | `skills/**/*.md` |
| Workflows | `workflows/` |
| Herramientas CLI | `herramientas/*.py` |
| Plugin manifest | `plugins/nxt-core/manifest.json` |
| MCP config | `.claude/mcp.json` |

## Soporte

- Documentacion: `nxt/README.md`
- Ejemplos: `ejemplos/`
