# Workflow Specification Reference

> **Tipo:** Reference
> **Versión:** 3.6.0

## Estructura de un Workflow NXT

```markdown
# Workflow: [Nombre]

> **Basado en:** [Fuente]
> **Propósito:** [Descripción]

## Descripción
[Qué hace este workflow]

## Cuándo Usar
- [Caso de uso 1]
- [Caso de uso 2]

## Proceso

### Paso 1: [Nombre]
[Descripción]
```yaml
input: [qué recibe]
output: [qué produce]
```

### Paso 2: [Nombre]
[Descripción]

## Comandos
```bash
*[comando] [args]
```

## Ejemplo Práctico
[Ejemplo de uso]

---

*Workflow [Nombre] - [Tagline]*
```

## Tipos de Workflows

### Por Fase
```
workflows/
├── fase-1-descubrir/
├── fase-2-definir/
├── fase-3-disenar/
├── fase-4-planificar/
├── fase-5-construir/
└── fase-6-verificar/
```

### Especiales
```
workflows/
├── shard-doc.md        # Dividir documentos
├── brownfield.md       # Proyectos existentes
└── vendoring.md        # Bundles standalone
```

## Estructura de Comando

```
*[workflow-name] [options] [target]
```

Ejemplos:
```bash
*shard-doc docs/prd.md --strategy by_heading
*create-story --epic EPIC-123
*code-review src/api/
```

## Workflow YAML Schema

```yaml
name: string
version: string
description: string

triggers:
  - keyword: string
    action: string

steps:
  - name: string
    agent: string
    input: object
    output: object
    conditions: array

transitions:
  - from: string
    to: string
    condition: string
```

## Integración con Orchestrator

Los workflows se registran en el orchestrator:

```yaml
# .nxt/nxt.config.yaml
workflows:
  greenfield:
    - workflow-init
    - brainstorm-project
    - create-prd
    ...
  brownfield:
    - analyze-codebase
    - document-project
    ...
```

---

*Reference - Workflow Specification v3.3.0*
