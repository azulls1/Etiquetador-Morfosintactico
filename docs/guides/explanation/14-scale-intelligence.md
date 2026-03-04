# Scale Intelligence Explained

> **Tipo:** Explanation
> **Nivel:** Intermedio

## El Problema de la Escala

No todas las tareas necesitan el mismo nivel de planificación:

| Tarea | Sin Scale Intelligence | Con Scale Intelligence |
|-------|------------------------|------------------------|
| Fix typo | 30 min planificando | 0 min, ejecutar directo |
| Nueva API | 5 min planificando | 15 min, PRD + diseño |
| Migración | 1 hora planificando | 2 horas, full documentation |

## El Sistema de 5 Niveles

BMAD v6 Alpha introduce un sistema granular de clasificación:

### Nivel 0: Trivial
- **Tiempo:** < 15 minutos
- **Cambios:** 1 archivo
- **Planificación:** Ninguna
- **Ejemplo:** Corregir typo, actualizar versión

### Nivel 1: Simple
- **Tiempo:** 15 min - 1 hora
- **Cambios:** 1-3 archivos
- **Planificación:** ~5 minutos
- **Ejemplo:** Bug fix con causa conocida

### Nivel 2: Estándar
- **Tiempo:** 1-8 horas
- **Cambios:** 3-10 archivos
- **Planificación:** ~15 minutos
- **Ejemplo:** Nueva feature pequeña

### Nivel 3: Complejo
- **Tiempo:** 8-40 horas
- **Cambios:** 10-50 archivos
- **Planificación:** ~30 minutos
- **Ejemplo:** Nuevo módulo, refactor significativo

### Nivel 4: Enterprise
- **Tiempo:** 40+ horas
- **Cambios:** 50+ archivos
- **Planificación:** ~1 hora
- **Ejemplo:** Nuevo sistema, migración completa

## Cómo Funciona la Detección

El orchestrator analiza múltiples señales:

```yaml
señales:
  explicitas:
    - Palabras clave: "fix", "add", "refactor", "migrate"
    - Scope mencionado: "pequeño cambio", "sistema completo"

  implicitas:
    - Archivos detectados en el contexto
    - Complejidad técnica del dominio
    - Dependencias identificadas
    - Historial de cambios similares
```

## Algoritmo de Clasificación

```
1. Analizar texto de solicitud
2. Identificar archivos potencialmente afectados
3. Evaluar complejidad técnica
4. Calcular score de riesgo
5. Determinar nivel (0-4)
6. Seleccionar track de workflow
```

## Tracks de Workflow

| Nivel | Track | Tiempo Planificación |
|-------|-------|---------------------|
| 0 | Instant | 0 min |
| 1 | Quick Flow | ~5 min |
| 2 | BMad Method | ~15 min |
| 3 | Full Planning | ~30 min |
| 4 | Enterprise Track | ~1 hora |

## Beneficios

1. **Eficiencia:** No sobre-planificar tareas simples
2. **Calidad:** No sub-planificar tareas complejas
3. **Predictibilidad:** Tiempos estimados más precisos
4. **Adaptabilidad:** Ajuste automático por contexto

---

*Explanation - Scale Intelligence*
