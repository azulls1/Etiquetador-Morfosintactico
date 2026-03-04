# How To: Configure MCP Servers

> **Tipo:** How-To Guide
> **Tiempo:** 10 minutos

## Problema

Necesitas conectar NXT con servicios externos como GitHub, Slack, o bases de datos.

## Solución

Configurar MCP (Model Context Protocol) servers en `.claude/mcp.json`.

## Pasos

### 1. Ubicar el archivo de configuración

```bash
.claude/mcp.json
```

### 2. Agregar un MCP Server

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

### 3. Configurar variables de entorno

En `.env`:
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### 4. Verificar conexión

```
/nxt/status
# Debería mostrar MCP servers conectados
```

## MCP Servers Disponibles

| Server | Uso | Configuración |
|--------|-----|---------------|
| github | PRs, issues, repos | `GITHUB_TOKEN` |
| postgres | Base de datos | `DATABASE_URL` |
| slack | Notificaciones | `SLACK_TOKEN` |
| filesystem | Archivos avanzados | Path config |
| memory | Persistencia | Automático |

## Ejemplo Completo

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

## Troubleshooting

| Error | Solución |
|-------|----------|
| Token inválido | Verificar permisos del token |
| Server no conecta | Revisar `npx` está instalado |
| Timeout | Aumentar timeout en config |

---

*How-To Guide 6 - Configure MCP*
