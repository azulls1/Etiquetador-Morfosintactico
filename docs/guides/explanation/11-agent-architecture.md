# Agent Architecture Explained

> **Tipo:** Explanation
> **Nivel:** Intermedio

## ¿Qué es un Agente NXT?

Un agente NXT es una **personalidad AI especializada** que actúa como un miembro
del equipo de desarrollo con conocimientos y comportamientos específicos.

## Anatomía de un Agente

```
┌─────────────────────────────────────────────┐
│              AGENTE NXT                      │
├─────────────────────────────────────────────┤
│  Identidad                                   │
│  ├── Nombre: NXT Dev                        │
│  ├── Rol: Desarrollador                     │
│  └── Personalidad: Pragmático, eficiente    │
├─────────────────────────────────────────────┤
│  Conocimiento                                │
│  ├── Skills: testing, code-review           │
│  ├── Templates: componentes, hooks          │
│  └── Checklists: code quality               │
├─────────────────────────────────────────────┤
│  Comportamiento                              │
│  ├── Comandos: *scaffold, *refactor         │
│  ├── Workflows: TDD, pair programming       │
│  └── Outputs: código, tests, docs           │
├─────────────────────────────────────────────┤
│  Relaciones                                  │
│  ├── Recibe de: Architect, PM               │
│  └── Entrega a: QA, Docs                    │
└─────────────────────────────────────────────┘
```

## Ciclo de Vida

```
[Activación] → [Carga Contexto] → [Ejecución] → [Handoff]
      │              │                 │            │
   /nxt/dev    Lee archivos      Ejecuta        Pasa a
               del proyecto      tareas         siguiente
                                               agente
```

## Tipos de Agentes

### 1. Core Agents
Fundamentales para cualquier proyecto:
- Orchestrator, Analyst, PM, Architect, Dev, QA

### 2. Specialist Agents
Para necesidades específicas:
- CyberSec, Performance, Accessibility, Mobile

### 3. Support Agents
Servicios auxiliares:
- Paige (documentación), Search (web), Media (multimedia)

## Sistema de Extensión

### Archivo Base (Inmutable)
```
agentes/nxt-dev.md
```

### Sidecar (Personalizable)
```
agentes/nxt-dev.sidecar.md
```

El sidecar **extiende** sin **modificar** el agente base.

## Comunicación entre Agentes

Los agentes NO se comunican directamente. El **Orchestrator** coordina:

```
[Agent A] ──output──► [Orchestrator] ──input──► [Agent B]
```

El contexto compartido incluye:
- Estado del proyecto
- Decisiones previas
- Artefactos generados

---

*Explanation - Agent Architecture*
