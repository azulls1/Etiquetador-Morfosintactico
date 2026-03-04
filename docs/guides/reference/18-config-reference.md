# Configuration Reference

> **Tipo:** Reference
> **Versión:** 3.6.0

## Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `.nxt/nxt.config.yaml` | Configuración principal |
| `.nxt/version.txt` | Versión del framework |
| `.nxt/state.json` | Estado persistente |
| `.env` | Variables de entorno |
| `.claude/mcp.json` | MCP servers |

## nxt.config.yaml

### Framework
```yaml
framework:
  nombre: "NXT AI Development"
  version: "3.6.0"
  base: "BMAD v6 Alpha + Claude Skills + Multi-LLM"
  idioma: "es"  # es, en
```

### Empresa
```yaml
empresa:
  nombre: "Mi Empresa"
  colores:
    primario: "#3B82F6"
    secundario: "#F97316"
```

### Desarrollador
```yaml
desarrollador:
  nombre: "Tu Nombre"
  rol: "Full-Stack Developer"
  nivel_tecnico: "advanced"  # beginner, intermediate, advanced
```

### Orquestador
```yaml
orquestador:
  llm_principal: "claude"
  modelo_claude: "claude-opus-4-5-20251101"
  delegacion:
    busquedas: "gemini"
    multimedia: "gemini"
    documentos: "claude"
    codigo: "claude"
```

### Agentes
```yaml
agentes:
  habilitados:
    - nxt-orchestrator
    - nxt-analyst
    - nxt-pm
    - nxt-architect
    - nxt-dev
    - nxt-qa
    - nxt-paige  # v1.3.1
```

### Escala (BMAD v6 Alpha)
```yaml
escala:
  default_track: "auto"
  niveles:
    nivel_0:
      nombre: "Trivial"
      tiempo: "< 15min"
      track: "instant"
    nivel_1:
      nombre: "Simple"
      tiempo: "15min-1h"
      track: "quick_flow"
    nivel_2:
      nombre: "Estandar"
      tiempo: "1-8h"
      track: "bmad_method"
    nivel_3:
      nombre: "Complejo"
      tiempo: "8-40h"
      track: "full_planning"
    nivel_4:
      nombre: "Enterprise"
      tiempo: "40h+"
      track: "enterprise_track"
```

### Skills
```yaml
skills:
  documentos:
    - docx
    - pdf
    - pptx
    - xlsx
  desarrollo:
    - testing
    - code-review
    - security
```

### Tech Stack
```yaml
tech_stack:
  frontend:
    preferidos: ["react", "next", "vue"]
    default: "react"
  backend:
    preferidos: ["node", "python", "fastapi"]
    default: "node"
  database:
    preferidos: ["postgresql", "mongodb"]
    default: "postgresql"
```

### Salidas
```yaml
salidas:
  directorios:
    docs: "./docs"
    codigo: "./src"
    tests: "./tests"
  nomenclatura: "kebab-case"
```

## Variables de Entorno (.env)

```bash
# LLM APIs
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
OPENAI_API_KEY=sk-...

# MCP Servers
GITHUB_TOKEN=ghp_...
DATABASE_URL=postgresql://...
SLACK_TOKEN=xoxb-...

# Configuración
NXT_DEBUG=false
NXT_LOG_LEVEL=info
```

## MCP Config (.claude/mcp.json)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

*Reference - Configuration v3.3.0*
