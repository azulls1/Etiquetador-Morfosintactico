# Multi-Agent Workflows

> **Tipo:** Tutorial
> **Nivel:** Avanzado
> **Tiempo:** 30 minutos

## Objetivos

- Orquestar múltiples agentes en un proyecto complejo
- Manejar handoffs entre agentes
- Optimizar el flujo de trabajo del equipo

## Cuándo Usar Multi-Agent

| Escenario | Agentes Involucrados |
|-----------|---------------------|
| Nueva feature compleja | PM → Architect → Dev → QA |
| Rediseño de sistema | Analyst → Architect → Dev → DevOps |
| Migración de stack | Analyst → Architect → Dev → QA → Docs |
| MVP completo | Analyst → PM → Architect → UX → Dev → QA |

## Ejemplo: Sistema de Pagos

### Fase 1: Discovery
```
/nxt/analyst
> Investiga opciones de payment gateways (Stripe, PayPal, MercadoPago)
> Analiza requisitos de PCI compliance
```

### Fase 2: Planning
```
/nxt/pm
> Crea PRD para el módulo de pagos
> Define user stories para checkout flow
```

### Fase 3: Architecture
```
/nxt/architect
> Diseña integración con payment gateway
> Define manejo de webhooks y estados
```

### Fase 4: Implementation
```
/nxt/api
> Implementa endpoints de payment
> Integra con Stripe SDK

/nxt/design
> Diseña y crea componentes de checkout
> Implementa formulario de tarjeta
```

### Fase 5: Verification
```
/nxt/qa
> Crea tests para flujo de pago
> Verifica edge cases (declined, timeout)

/nxt/cybersec
> Audita seguridad de datos de tarjeta
> Verifica compliance PCI
```

## Coordinación con Orchestrator

El orchestrator maneja automáticamente:

1. **Secuenciación** - Qué agente va primero
2. **Paralelización** - Qué puede ejecutarse en paralelo
3. **Handoffs** - Pasar contexto entre agentes
4. **Checkpoints** - Validar antes de continuar

## Tips Avanzados

1. **Contexto compartido**: Los agentes comparten el contexto del proyecto
2. **Iteración**: Puedes volver a un agente anterior si necesitas ajustes
3. **Especialistas**: Usa agentes específicos (cybersec, performance) cuando aplique

---

*Tutorial 4 de 4 - Multi-Agent Workflows*
