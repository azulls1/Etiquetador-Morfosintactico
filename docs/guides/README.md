# NXT Documentation Guides

> **Basado en:** BMAD v6 Alpha Documentation System (Diátaxis)
> **Versión:** 3.6.0
> **Total:** 18 guías (7000+ líneas)

## Estructura de Guías

Las guías están organizadas en 4 categorías siguiendo el patrón Diátaxis:

```
docs/guides/
├── tutorials/          # 4 guías - Aprendizaje paso a paso
├── how-to/             # 6 guías - Tareas específicas
├── explanation/        # 4 guías - Conceptos profundos
└── reference/          # 4 guías - Especificaciones técnicas
```

## Guías Disponibles (18)

### Tutorials (Aprendizaje) - 4 guías

| # | Guía | Descripción | Nivel |
|---|------|-------------|-------|
| 01 | [Getting Started](./tutorials/01-getting-started.md) | Primeros pasos con NXT | Principiante |
| 02 | [Your First Project](./tutorials/02-first-project.md) | Crear un proyecto desde cero | Principiante |
| 03 | [Working with Agents](./tutorials/03-working-with-agents.md) | Usar agentes efectivamente | Principiante |
| 04 | [Multi-Agent Workflows](./tutorials/04-multi-agent-workflows.md) | Coordinar múltiples agentes | Intermedio |

### How-To (Tareas) - 6 guías

| # | Guía | Descripción |
|---|------|-------------|
| 05 | [Create Custom Agent](./how-to/05-create-custom-agent.md) | Crear tu propio agente |
| 06 | [Configure MCP](./how-to/06-configure-mcp.md) | Configurar MCP Servers |
| 07 | [Effective Prompts](./how-to/07-effective-prompts.md) | Escribir prompts efectivos |
| 08 | [Debug Agents](./how-to/08-debug-agents.md) | Depurar problemas de agentes |
| 09 | [Scale Planning](./how-to/09-scale-planning.md) | Planificar según escala 0-4 |
| 10 | [Document Sharding](./how-to/10-document-sharding.md) | Dividir documentos grandes |

### Explanation (Conceptos) - 4 guías

| # | Guía | Descripción | Nivel |
|---|------|-------------|-------|
| 11 | [Agent Architecture](./explanation/11-agent-architecture.md) | Anatomía de un agente NXT | Intermedio |
| 12 | [BMAD Methodology](./explanation/12-bmad-methodology.md) | Filosofía BMAD v6 Alpha | Intermedio |
| 13 | [LangGraph Patterns](./explanation/13-langgraph-patterns.md) | Patrones de orquestación | Avanzado |
| 14 | [Scale Intelligence](./explanation/14-scale-intelligence.md) | Sistema de 5 niveles | Intermedio |

### Reference (Especificaciones) - 4 guías

| # | Guía | Descripción |
|---|------|-------------|
| 15 | [Agent Specification](./reference/15-agent-spec.md) | Formato y estructura de agentes |
| 16 | [Skill Specification](./reference/16-skill-spec.md) | Formato y estructura de skills |
| 17 | [Workflow Specification](./reference/17-workflow-spec.md) | Formato y estructura de workflows |
| 18 | [Config Reference](./reference/18-config-reference.md) | Referencia de configuración |

## Quick Navigation

### Por Nivel de Experiencia

**Principiante:**
```
01-Getting Started → 02-First Project → 03-Working with Agents
```

**Intermedio:**
```
04-Multi-Agent Workflows → 11-Agent Architecture → 14-Scale Intelligence
```

**Avanzado:**
```
05-Create Custom Agent → 13-LangGraph Patterns → 10-Document Sharding
```

### Por Objetivo

| Quiero... | Ir a... |
|-----------|---------|
| Empezar rápido | [01-Getting Started](./tutorials/01-getting-started.md) |
| Crear mi primer proyecto | [02-First Project](./tutorials/02-first-project.md) |
| Entender los agentes | [03-Working with Agents](./tutorials/03-working-with-agents.md) |
| Crear un agente custom | [05-Create Custom Agent](./how-to/05-create-custom-agent.md) |
| Configurar MCP | [06-Configure MCP](./how-to/06-configure-mcp.md) |
| Escribir buenos prompts | [07-Effective Prompts](./how-to/07-effective-prompts.md) |
| Depurar problemas | [08-Debug Agents](./how-to/08-debug-agents.md) |
| Entender la metodología | [12-BMAD Methodology](./explanation/12-bmad-methodology.md) |
| Ver especificaciones | [15-Agent Spec](./reference/15-agent-spec.md) |

### Por Rol

| Rol | Guías Recomendadas |
|-----|-------------------|
| **Developer** | 01, 02, 05, 08, 15 |
| **Tech Lead** | 04, 11, 13, 14, 17 |
| **Product Owner** | 01, 12, 14 |
| **DevOps** | 06, 18 |

## Estadísticas

| Categoría | Guías | Líneas (aprox) |
|-----------|-------|----------------|
| Tutorials | 4 | ~1500 |
| How-To | 6 | ~2500 |
| Explanation | 4 | ~1800 |
| Reference | 4 | ~1200 |
| **Total** | **18** | **~7000** |

## Contribuir

Para agregar nuevas guías:

1. Identifica la categoría correcta (tutorial/how-to/explanation/reference)
2. Usa el template correspondiente en `plantillas/guias/`
3. Sigue la numeración existente (próximo: 19, 20, ...)
4. Actualiza este índice
5. Mantén el nivel de detalle consistente

---

*NXT Documentation Guides v3.3.0 - 18 guías, 7000+ líneas, patrón Diátaxis*
