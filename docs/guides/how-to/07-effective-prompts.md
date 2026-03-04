# How To: Write Effective Prompts

> **Tipo:** How-To Guide
> **Tiempo:** 15 minutos

## Problema

Tus solicitudes a los agentes no producen los resultados esperados.

## Solución

Aplicar las técnicas de prompting efectivo para NXT.

## Estructura de un Buen Prompt

```
[CONTEXTO] + [TAREA ESPECÍFICA] + [FORMATO ESPERADO] + [RESTRICCIONES]
```

## Ejemplos

### ❌ Prompt Vago
```
Haz una API
```

### ✅ Prompt Efectivo
```
Contexto: Estoy construyendo una app de e-commerce con Next.js
Tarea: Crea un endpoint POST /api/products que:
- Reciba: name, price, category, description
- Valide con Zod
- Guarde en PostgreSQL con Prisma
- Retorne el producto creado con ID

Formato: TypeScript, App Router, manejo de errores
Restricciones: Sin usar any, usar try-catch
```

## Técnicas por Agente

### Para el Architect
```
✅ "Diseña una arquitectura para [X] que soporte [requisitos].
    Considera: [restricciones técnicas]
    Prioriza: [escalabilidad/costo/velocidad]
    Output: Diagrama + decisiones clave"
```

### Para el Developer
```
✅ "Implementa [funcionalidad] siguiendo:
    - Stack: [tecnologías]
    - Patrones: [patrones a usar]
    - Tests: [tipo de tests]
    - Edge cases: [casos a manejar]"
```

### Para el QA
```
✅ "Crea tests para [componente/endpoint]:
    - Happy path: [escenarios normales]
    - Edge cases: [límites, nulls, errores]
    - Integración: [con qué sistemas]
    - Coverage objetivo: [%]"
```

## Checklist de Prompt

- [ ] ¿Tiene contexto suficiente?
- [ ] ¿La tarea es específica y medible?
- [ ] ¿El formato de salida está claro?
- [ ] ¿Las restricciones están definidas?
- [ ] ¿Es el agente correcto para esta tarea?

---

*How-To Guide 7 - Effective Prompts*
