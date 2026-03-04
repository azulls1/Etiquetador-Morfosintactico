# Agent Specification Reference

> **Tipo:** Reference
> **Versión:** 3.6.0

## Estructura de un Agente NXT

```markdown
# NXT [Nombre] - [Título del Rol]

> **Basado en:** [Fuente/Metodología]
> **Rol:** [Descripción corta]

## Mensaje de Bienvenida
[Banner ASCII con información del agente]

## Identidad
[Quién es el agente y su propósito]

## Personalidad
"[Nombre corto]" - [Características de personalidad]

## Responsabilidades
### 1. [Área 1]
- Tarea
- Tarea

### 2. [Área 2]
- Tarea
- Tarea

## Comandos
| Código | Comando | Descripción |
|--------|---------|-------------|
| `xx` | `*comando` | Descripción |

## Templates
[Templates específicos del agente]

## Integración con Otros Agentes
| Agente | Relación |
|--------|----------|
| nxt-xxx | Descripción |

## Activación
`/nxt/[nombre]`

---
*NXT [Nombre] - [Tagline]*
```

## Campos Requeridos

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| Nombre | ✅ | Identificador único |
| Título | ✅ | Rol del agente |
| Identidad | ✅ | Descripción de quién es |
| Responsabilidades | ✅ | Qué hace el agente |
| Comandos | ✅ | Comandos disponibles |
| Activación | ✅ | Cómo activar |

## Campos Opcionales

| Campo | Descripción |
|-------|-------------|
| Basado en | Fuente o metodología |
| Personalidad | Características de comportamiento |
| Templates | Plantillas específicas |
| Integración | Relación con otros agentes |

## Convenciones de Nomenclatura

- **Archivo**: `nxt-[nombre].md` (kebab-case)
- **Comando**: `/nxt/[nombre]` (lowercase)
- **Banner**: ASCII art con nombre y versión

## Banner Template

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   [EMOJI] NXT [NOMBRE] v[X.X] - [Descripción]                   ║
║                                                                  ║
║   "[Tagline del agente]"                                        ║
║                                                                  ║
║   Capacidades:                                                   ║
║   • [Capacidad 1]                                               ║
║   • [Capacidad 2]                                               ║
║   • [Capacidad 3]                                               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Códigos de Comando

Los códigos de comando siguen el patrón de 2 letras de BMAD v6:

| Patrón | Ejemplos |
|--------|----------|
| Primera + última letra | `to` (tour), `qs` (quickstart) |
| Dos primeras letras | `ag` (agents), `wf` (workflows) |
| Abreviatura común | `fq` (FAQ), `gl` (glossary) |

## Ejemplo Completo

Ver: `agentes/nxt-paige.md`

---

*Reference - Agent Specification v3.3.0*
