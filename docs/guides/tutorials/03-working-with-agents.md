# Working with Agents

> **Tipo:** Tutorial
> **Nivel:** Intermedio
> **Tiempo:** 25 minutos

## Objetivos

- Entender cómo funcionan los agentes NXT
- Aprender a comunicarte efectivamente con cada agente
- Dominar la delegación entre agentes

## Los Agentes como Equipo

Cada agente NXT tiene una **personalidad** y **especialización**:

| Agente | Personalidad | Especialización |
|--------|--------------|-----------------|
| Analyst | Curioso, metódico | Investigación, datos |
| PM | Organizado, visionario | Requisitos, roadmap |
| Architect | Estratégico, técnico | Diseño de sistemas |
| Developer | Pragmático, eficiente | Código, implementación |
| QA | Detallista, escéptico | Testing, calidad |

## Comunicación Efectiva

### Con el Analyst
```
✅ "Investiga las mejores prácticas de autenticación en 2025"
✅ "Analiza los competidores en el mercado de fintech"
❌ "Haz algo de investigación" (muy vago)
```

### Con el Architect
```
✅ "Diseña una arquitectura para manejar 10K requests/segundo"
✅ "Evalúa si microservicios o monolito para este caso"
❌ "Haz la arquitectura" (sin contexto)
```

### Con el Developer
```
✅ "Implementa el endpoint POST /api/users con validación"
✅ "Refactoriza este código usando el patrón Repository"
❌ "Escribe código" (sin especificaciones)
```

## Flujo de Delegación

```
[Tu solicitud]
      │
      ▼
[Orchestrator] ─── Analiza complejidad
      │
      ├─── Nivel 0-1 ──► [Dev] directo
      │
      ├─── Nivel 2 ────► [PM] → [Dev] → [QA]
      │
      └─── Nivel 3-4 ──► [Analyst] → [Architect] → [Dev] → [QA] → [Docs]
```

## Ejercicio Práctico

1. Activa el orchestrator: `/nxt/orchestrator`
2. Pide: "Necesito un sistema de notificaciones push"
3. Observa cómo clasifica y delega
4. Interactúa con cada agente asignado

## Próximo Tutorial

→ [Multi-Agent Workflows](./04-multi-agent-workflows.md)

---

*Tutorial 3 de 4 - Working with Agents*
