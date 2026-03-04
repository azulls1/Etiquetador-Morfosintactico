# How To: Scale Adaptive Planning

> **Tipo:** How-To Guide
> **Tiempo:** 12 minutos

## Problema

No sabes cuánta planificación necesita tu tarea.

## Solución

Usar el sistema de 5 niveles (0-4) de BMAD v6 Alpha.

## Los 5 Niveles

### Nivel 0: Trivial (< 15 min)
**Indicadores:**
- Typo fix
- Cambio de comentario
- Rename simple

**Workflow:** Ejecutar directo
```
/nxt/dev
> Corrige el typo en README.md línea 45
```

### Nivel 1: Simple (15 min - 1 hora)
**Indicadores:**
- Bug con causa clara
- 1-3 archivos afectados
- Sin cambios de arquitectura

**Workflow:** Quick Flow (~5 min planificación)
```
/nxt/orchestrator
> Fix: el botón de login no funciona en Safari
```

### Nivel 2: Estándar (1-8 horas)
**Indicadores:**
- Feature nueva pequeña
- 3-10 archivos
- Requiere tests

**Workflow:** BMad Method (~15 min planificación)
```
/nxt/orchestrator
> Agregar dark mode toggle al dashboard
```

### Nivel 3: Complejo (8-40 horas)
**Indicadores:**
- Módulo completo
- 10-50 archivos
- Cambios de arquitectura

**Workflow:** Full Planning (~30 min)
```
/nxt/orchestrator
> Implementar sistema de notificaciones con push, email y SMS
```

### Nivel 4: Enterprise (40+ horas)
**Indicadores:**
- Sistema completo
- 50+ archivos
- Múltiples equipos

**Workflow:** Enterprise Track (~1 hora planificación)
```
/nxt/orchestrator
> Migrar de monolito a microservicios
```

## Cómo el Orchestrator Decide

```yaml
criterios:
  archivos_afectados: conteo
  complejidad_tecnica: análisis
  dependencias: grafo
  riesgo: evaluación
  tiempo_estimado: cálculo
```

## Forzar un Nivel

Si necesitas más/menos planificación:
```
/nxt/orchestrator --level 3
> Mi tarea aquí
```

---

*How-To Guide 9 - Scale Planning*
