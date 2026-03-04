# Project Brief: NXT AI Development Framework v3.6.0

> **Generado por:** NXT Analyst
> **Fecha:** 2026-01-27
> **Versión Actual:** 3.6.0

## 1. Resumen Ejecutivo

**NXT AI Development Framework** es un sistema de orquestación multi-agente para desarrollo de software que integra 33 agentes especializados, 21 skills y 26 workflows basados en BMAD Method v6. El framework permite desarrollo autónomo coordinado usando Claude como motor de ejecución.

El proyecto se encuentra en estado funcional pero requiere sincronización de versiones, mejoras en testing, configuración de CI/CD y actualización de documentación para alcanzar una versión production-ready.

## 2. Problema a Resolver

### Problemas Detectados

1. **Inconsistencia de Versiones**
   - `version.txt`: 3.4.0
   - `nxt.config.yaml`: 3.3.0
   - `state.json`: framework_version 3.3.0
   - Agentes muestran versión 3.3.0 en banners

2. **Falta de CI/CD**
   - No hay GitHub Actions configurados
   - No hay Dockerfile para el proyecto
   - No hay validación automática de agentes

3. **Testing Incompleto**
   - Solo 7 archivos de tests
   - Sin cobertura de todos los agentes
   - Tests del CLI v3 incompletos

4. **Documentación Desactualizada**
   - CLAUDE.md menciona características de v3.4.0
   - Agentes no reflejan cambios de ejecución directa
   - Falta documentación de migración

5. **Estado Inconsistente**
   - `state.json` muestra 33 agentes fallidos en última ejecución
   - Tareas pendientes no limpiadas

## 3. Solución Propuesta

Implementar **NXT AI Development Framework v3.6.0** con:

- Sincronización completa de versiones
- Sistema de CI/CD con GitHub Actions
- Cobertura de tests al 80%
- Documentación actualizada al 100%
- Validación automática de consistencia

## 4. Usuarios Objetivo

| Persona | Descripción | Necesidades |
|---------|-------------|-------------|
| **Solo Developer** | Desarrollador individual usando NXT | CLI simple, docs claros, agentes confiables |
| **Tech Lead** | Líder técnico coordinando equipo | Orquestación, métricas, workflows |
| **DevOps Engineer** | Ingeniero de operaciones | CI/CD, containers, deployment |
| **Contributor** | Contribuidor al proyecto NXT | Testing, guidelines, PR process |

## 5. Análisis de Mercado

### Competencia Indirecta
- **Auto-GPT**: Framework autónomo general
- **MetaGPT**: Multi-agentes para desarrollo
- **GPT-Engineer**: Generación de código
- **Aider**: Pair programming con IA

### Diferenciadores NXT
- Integración nativa con Claude Code
- 33 agentes especializados en ciclo completo
- Sistema BMAD v6 de 5 niveles
- Soporte multi-LLM (Claude + Gemini)
- Skills modulares con MCP

## 6. Alcance v3.6.0

### Incluido (Sprint 1-3)

#### Sprint 1: Sincronización y Estabilidad
- [ ] Sincronizar todas las versiones a 3.5.0
- [ ] Limpiar state.json
- [ ] Actualizar banners de agentes
- [ ] Corregir imports y dependencias

#### Sprint 2: CI/CD y Testing
- [ ] Configurar GitHub Actions (CI/CD)
- [ ] Dockerfile multi-stage
- [ ] Tests para agentes críticos
- [ ] Validación de consistencia

#### Sprint 3: Documentación y UX
- [ ] Actualizar CLAUDE.md
- [ ] README.md renovado
- [ ] Guía de migración 3.4→3.5
- [ ] Mejoras de UX en CLI

### Excluido
- Nuevos agentes
- Cambios arquitectónicos mayores
- Integraciones con nuevos LLMs
- Breaking changes en API

## 7. Métricas de Éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Versiones sincronizadas | 50% | 100% |
| Cobertura de tests | ~30% | 80% |
| GitHub Actions workflows | 0 | 3 (CI, CD, Validation) |
| Documentación actualizada | 60% | 100% |
| Agentes con banner v3.6.0 | 0 | 33 |

## 8. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Breaking changes inesperados | Media | Alto | Testing extensivo antes de merge |
| Conflictos en state.json | Baja | Medio | Backup y reset limpio |
| CI/CD falla en Windows | Media | Medio | Test en múltiples plataformas |

## 9. Siguiente Fase

Recomendación: Pasar a **DEFINIR** con **NXT PM** para crear:
1. PRD detallado con requisitos
2. User Stories por sprint
3. Backlog priorizado

---

*Generado por NXT Analyst - Fase DESCUBRIR*
