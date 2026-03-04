# NXT Command Reference v3.6.0 - Ejecución Directa

> **DOCUMENTO ACTUALIZADO v3.4.0**: El sistema ahora usa "ejecución directa".
> Los slash commands instruyen a Claude para leer archivos de agentes y actuar.

## Modelo de Ejecución v3.4.0

### Cambio Fundamental

| Versión | Modelo | Cómo Funcionaba |
|---------|--------|-----------------|
| v3.3.0 | Claude CLI Externo | `python ... run-agent` llamaba a `claude -p` (requería API key) |
| **v3.4.0** | Ejecución Directa | Slash commands instruyen a Claude para leer y actuar |

### ¿Por Qué el Cambio?

- El modo headless de Claude CLI (`claude -p`) **requiere API key**
- Ya estamos en una sesión de Claude Code, no necesitamos otro proceso
- La ejecución directa es más simple y **no requiere configuración adicional**

---

## CÓMO EJECUTAR AGENTES (v3.4.0)

### Opción 1: Slash Commands (Recomendado)

```
/nxt/orchestrator           # Coordina análisis del proyecto
/nxt/dev mi tarea           # Activa desarrollador con tarea
/nxt/qa revisar código      # Activa QA
/nxt/architect diseñar API  # Activa arquitecto
```

**Qué hace Claude al recibir un slash command:**
1. Lee las instrucciones del archivo `.claude/commands/nxt/*.md`
2. Lee el archivo del agente `agentes/nxt-*.md`
3. Sigue las instrucciones usando sus herramientas (Read, Write, Edit, Bash, etc.)

### Opción 2: Python CLI (Para Información)

```bash
# Ver estado del sistema
python herramientas/nxt_orchestrator_v3.py status

# Analizar proyecto (stack, TODOs, estructura)
python herramientas/nxt_orchestrator_v3.py analyze

# Clasificar nivel de una tarea (0-4 BMAD)
python herramientas/nxt_orchestrator_v3.py classify "descripción"

# Planificar ejecución
python herramientas/nxt_orchestrator_v3.py plan "descripción"

# Ver cómo ejecutar agentes
python herramientas/nxt_orchestrator_v3.py how-to

# Información de un agente específico
python herramientas/nxt_orchestrator_v3.py agent-info nxt-dev

# Listar todos los agentes
python herramientas/nxt_orchestrator_v3.py agents

# Listar skills disponibles
python herramientas/nxt_orchestrator_v3.py skills

# Listar workflows
python herramientas/nxt_orchestrator_v3.py workflows
```

---

## COMANDOS DEPRECADOS (v3.3.0)

Los siguientes comandos **YA NO FUNCIONAN** porque requerían Claude CLI con API key:

```bash
# ❌ DEPRECADO - No usar
python herramientas/nxt_orchestrator_v3.py run-agent nxt-dev "tarea"
python herramientas/nxt_orchestrator_v3.py parallel --agents "x,y" --task "z"
python herramientas/nxt_orchestrator_v3.py all-agents "tarea"
python herramientas/nxt_orchestrator_v3.py auto "tarea"

# ✅ USAR EN SU LUGAR
/nxt/dev tarea              # Slash command directo
/nxt/orchestrator           # Coordinación automática
```

---

## SLASH COMMANDS DISPONIBLES

### Comandos Principales

| Comando | Función |
|---------|---------|
| `/nxt/orchestrator` | Análisis y coordinación del proyecto |
| `/nxt/init` | Inicializar proyecto NXT |
| `/nxt/status` | Ver estado actual |
| `/nxt/help` | Mostrar ayuda |
| `/nxt/checkpoint` | Guardar estado |
| `/nxt/resume` | Recuperar desde checkpoint |

### Comandos de Agentes (33 total)

| Agente | Comando | Especialidad |
|--------|---------|--------------|
| Analyst | `/nxt/analyst` | Análisis de negocio |
| PM | `/nxt/pm` | Gestión de producto |
| Architect | `/nxt/architect` | Arquitectura de software |
| UX | `/nxt/ux` | Diseño de experiencia |
| Developer | `/nxt/dev` | Desarrollo full-stack |
| QA | `/nxt/qa` | Testing y calidad |
| DevOps | `/nxt/devops` | CI/CD y deploy |
| CyberSec | `/nxt/cybersec` | Seguridad OWASP |
| Tech Writer | `/nxt/docs` | Documentación |
| Scrum Master | `/nxt/scrum` | Gestión ágil |
| Design | `/nxt/design` | Product Design (UX+UI) |
| API Dev | `/nxt/api` | Backend y APIs |
| Database | `/nxt/database` | Base de datos |
| Integrations | `/nxt/integrations` | Integraciones externas |
| Flows | `/nxt/flows` | Flujos de datos |
| Search | `/nxt/search` | Búsquedas web (Gemini) |
| Media | `/nxt/media` | Multimedia (Gemini) |
| Migrator | `/nxt/migrator` | Migración de código |
| Performance | `/nxt/performance` | Optimización |
| Accessibility | `/nxt/accessibility` | WCAG a11y |
| Infrastructure | `/nxt/infra` | Terraform, K8s |
| Mobile | `/nxt/mobile` | React Native, Flutter |
| Data | `/nxt/data` | Data Engineering |
| AI/ML | `/nxt/aiml` | Machine Learning |
| Compliance | `/nxt/compliance` | GDPR, SOC 2 |
| Realtime | `/nxt/realtime` | WebSockets, SSE |
| Localization | `/nxt/localization` | i18n, L10n |
| Paige | `/nxt/paige` | Documentación y onboarding |
| Context | `/nxt/context` | Gestión de contexto |
| Changelog | `/nxt/changelog` | Generación de changelogs |
| Ralph | `/nxt/ralph` | Desarrollo iterativo |
| MultiContext | `/nxt/multicontext` | Persistencia de contexto |

---

## CÓMO FUNCIONAN LOS SLASH COMMANDS (v3.4.0)

### Estructura de un Slash Command

Cada archivo en `.claude/commands/nxt/*.md` tiene este formato:

```markdown
# AGENTE NXT-[NOMBRE] - EJECUCIÓN DIRECTA

**INSTRUCCIÓN:** Lee y ejecuta las instrucciones del agente.

## PASO 1: Cargar agente
Lee el archivo `agentes/nxt-[nombre].md` con la herramienta Read.

## PASO 2: Ejecutar tarea
Tarea: **$ARGUMENTS**

Si no hay tarea específica, [acción por defecto].

## PASO 3: Usar herramientas
Tienes acceso a: Read, Write, Edit, Bash, Grep, Glob

**NO PREGUNTES. LEE EL AGENTE Y EJECUTA.**
```

### Flujo de Ejecución

```
Usuario: /nxt/dev implementar auth

Claude:
  1. Lee .claude/commands/nxt/dev.md
  2. Ve las instrucciones de "ejecución directa"
  3. Lee agentes/nxt-dev.md
  4. Sigue las instrucciones del agente
  5. Usa herramientas (Read, Write, Edit, Bash, etc.)
  6. Implementa la tarea sin preguntar
```

---

## MATRIZ DE FUNCIONALIDAD v3.4.0

| Acción | Método | Funciona? |
|--------|--------|-----------|
| Ver estado | `python ... status` | ✅ |
| Analizar proyecto | `python ... analyze` | ✅ |
| Clasificar tarea | `python ... classify "x"` | ✅ |
| Planificar | `python ... plan "x"` | ✅ |
| Ejecutar agente | `/nxt/[agente]` | ✅ |
| Coordinación | `/nxt/orchestrator` | ✅ |
| Ver ayuda | `python ... how-to` | ✅ |

**Nota**: Todo funciona sin necesidad de API keys adicionales.

---

## CONCLUSIÓN

### En v3.4.0:

1. **Usa slash commands** para ejecutar agentes: `/nxt/dev tarea`
2. **Usa Python CLI** para información: `python ... status`
3. **No necesitas** API keys ni configuración adicional
4. **Claude lee** archivos de agentes y **actúa** directamente

### La Regla de Oro v3.4.0

> **Para ejecutar cualquier agente, usa su slash command: `/nxt/[nombre]`**
> **Para obtener información, usa el CLI Python: `python herramientas/nxt_orchestrator_v3.py`**

---

*NXT Command Reference v3.6.0 - Ejecución Directa*
