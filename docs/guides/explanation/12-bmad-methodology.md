# BMAD Methodology Explained

> **Tipo:** Explanation
> **Nivel:** Intermedio

## ¿Qué es BMAD?

**BMAD** (Breakthrough Method for Agile AI-Driven Development) es una metodología
que transforma cómo desarrollamos software con asistencia de IA.

## Filosofía Core

### Documentación como Fuente de Verdad

En BMAD, la documentación (PRDs, arquitectura, user stories) es la **fuente principal
de verdad**. El código es un derivado de estas especificaciones.

```
Tradicional:
Código → Documentación (si hay tiempo)

BMAD:
Documentación → Código → Verificación contra docs
```

### Inteligencia Adaptativa

BMAD ajusta automáticamente el nivel de planificación según la complejidad:

| Nivel | Planificación | Documentación |
|-------|---------------|---------------|
| 0 | Ninguna | Ninguna |
| 1 | Mínima (~5 min) | Commit message |
| 2 | Estándar (~15 min) | User story |
| 3 | Completa (~30 min) | PRD + Architecture |
| 4 | Extensiva (~1h) | Full documentation |

## Los 5 Niveles

### Nivel 0: Trivial
- Typos, comentarios, renames
- No requiere planificación
- Ejecutar directamente

### Nivel 1: Simple
- Bug fix con causa clara
- Quick flow de 5 minutos
- Dev + QA básico

### Nivel 2: Estándar
- Feature pequeña
- BMad Method completo
- Story + Tests + Docs

### Nivel 3: Complejo
- Módulo completo
- Full team planning
- PRD + Architecture + Stories

### Nivel 4: Enterprise
- Sistema completo
- Multi-team coordination
- Full documentation suite

## Agentes como Equipo

BMAD organiza los agentes AI como un equipo de desarrollo real:

```
                    ┌─────────────┐
                    │ Orchestrator │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
     ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
     │  Analyst  │   │ Architect │   │    Dev    │
     │    PM     │   │    UX     │   │    QA     │
     └───────────┘   └───────────┘   └───────────┘
```

## Workflows por Fase

1. **Discover** - Brainstorm, research, analysis
2. **Define** - PRD, requirements, backlog
3. **Design** - Architecture, UX, tech spec
4. **Plan** - Epics, stories, sprints
5. **Build** - Code, tests, docs
6. **Verify** - QA, validation, deploy

## Por Qué Funciona

1. **Contexto Preservado**: Documentación mantiene el "por qué"
2. **Escalabilidad**: Ajuste automático por complejidad
3. **Calidad**: Verificación contra especificaciones
4. **Velocidad**: Menos retrabajo por malentendidos

## Referencias

- [BMAD-METHOD GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMad Codes](https://bmadcodes.com/)

---

*Explanation - BMAD Methodology*
