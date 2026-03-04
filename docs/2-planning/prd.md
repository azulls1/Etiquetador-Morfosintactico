# PRD: NXT AI Development Framework v3.6.0

> **Generado por:** NXT PM
> **Fecha:** 2026-01-27
> **Estado:** Draft

## 1. Visión del Producto

Transformar NXT AI Development Framework en una herramienta **production-ready** que permita a desarrolladores individuales y equipos orquestar desarrollo de software autónomo con 33 agentes especializados, testing robusto, CI/CD integrado y documentación completa.

**Tagline:** "Del código a producción, con agentes que trabajan por ti"

## 2. Objetivos v3.6.0

### Objetivos Primarios
1. **O1**: Sincronizar 100% de versiones del framework
2. **O2**: Alcanzar 80% de cobertura de tests
3. **O3**: Implementar CI/CD completo con GitHub Actions
4. **O4**: Actualizar 100% de documentación

### OKRs

| Objetivo | Key Result | Métrica |
|----------|------------|---------|
| O1: Consistencia | Todas las versiones = 3.5.0 | 100% archivos actualizados |
| O2: Calidad | Tests pasan en CI | 80% coverage, 0 failures |
| O3: Automatización | Pipeline completo | 3 workflows activos |
| O4: Documentación | Docs actualizados | 100% agentes, README, guides |

## 3. Requisitos Funcionales

### RF-001: Sincronización de Versiones
- **Descripción**: Todas las referencias de versión deben mostrar 3.5.0
- **Prioridad**: MUST
- **Archivos afectados**:
  - `.nxt/version.txt`
  - `.nxt/nxt.config.yaml`
  - `.nxt/state.json`
  - `herramientas/nxt_orchestrator_v3.py`
  - `agentes/nxt-orchestrator.md`
  - Todos los banners de agentes
- **Criterios de Aceptación**:
  - [ ] `cat .nxt/version.txt` retorna "3.5.0"
  - [ ] `python herramientas/nxt_orchestrator_v3.py status` muestra "3.5.0"
  - [ ] Todos los agentes muestran "v3.6.0" en banner

### RF-002: Reset de Estado
- **Descripción**: Limpiar state.json con estado inicial correcto
- **Prioridad**: MUST
- **Criterios de Aceptación**:
  - [ ] `framework_version`: "3.5.0"
  - [ ] `pending_tasks`: []
  - [ ] `completed_tasks`: []
  - [ ] `decisions_log`: [] o últimas 10

### RF-003: GitHub Actions CI
- **Descripción**: Pipeline de integración continua
- **Prioridad**: MUST
- **Workflows**:
  - `ci.yml`: Lint, Tests, Build
  - `validate.yml`: Validar consistencia de agentes
- **Criterios de Aceptación**:
  - [ ] CI corre en push a main y PRs
  - [ ] Tests Python ejecutan con pytest
  - [ ] Validación de agentes pasa

### RF-004: GitHub Actions CD
- **Descripción**: Pipeline de deployment/release
- **Prioridad**: SHOULD
- **Workflows**:
  - `release.yml`: Crear release en tags
- **Criterios de Aceptación**:
  - [ ] Release automático en tags v*
  - [ ] Changelog incluido en release

### RF-005: Dockerfile Multi-stage
- **Descripción**: Container para ejecutar herramientas CLI
- **Prioridad**: SHOULD
- **Criterios de Aceptación**:
  - [ ] Build exitoso
  - [ ] `docker run nxt-dev status` funciona
  - [ ] Imagen < 500MB

### RF-006: Tests de Agentes
- **Descripción**: Tests unitarios para agentes críticos
- **Prioridad**: MUST
- **Agentes a testear**:
  - Orchestrator, Dev, QA, PM, Architect
- **Criterios de Aceptación**:
  - [ ] 80% coverage en orchestrator
  - [ ] Tests de clasificación
  - [ ] Tests de delegación

### RF-007: Validador de Consistencia
- **Descripción**: Script que valida versiones y estructura
- **Prioridad**: MUST
- **Criterios de Aceptación**:
  - [ ] `python herramientas/validator.py` retorna 0 si OK
  - [ ] Valida versiones en todos los archivos
  - [ ] Valida que todos los agentes tengan banner

### RF-008: Actualizar CLAUDE.md
- **Descripción**: Documentación principal actualizada
- **Prioridad**: MUST
- **Criterios de Aceptación**:
  - [ ] Versión 3.6.0 reflejada
  - [ ] Tabla de comandos actualizada
  - [ ] Nuevas features documentadas

### RF-009: README Renovado
- **Descripción**: README.md profesional y completo
- **Prioridad**: SHOULD
- **Criterios de Aceptación**:
  - [ ] Quick Start funcional
  - [ ] Badges de CI
  - [ ] Screenshots/GIFs

### RF-010: Guía de Migración
- **Descripción**: Documento para migrar de 3.4 a 3.5
- **Prioridad**: COULD
- **Criterios de Aceptación**:
  - [ ] Pasos claros de migración
  - [ ] Breaking changes documentados

## 4. Requisitos No Funcionales

### Rendimiento
- CLI debe responder en < 2 segundos
- Análisis de proyecto < 10 segundos

### Compatibilidad
- Python 3.10+
- Windows, macOS, Linux
- Claude Code v1.x+

### Seguridad
- Sin credenciales hardcodeadas
- .env para API keys

### Mantenibilidad
- Código documentado
- Type hints en Python
- Linting con ruff

## 5. User Stories

### Epic 1: Estabilidad y Consistencia

#### US-001: Sincronizar Versiones
**Como** desarrollador
**Quiero** que todas las versiones muestren 3.5.0
**Para** evitar confusión sobre qué versión estoy usando

**Criterios de Aceptación:**
- [ ] version.txt = 3.5.0
- [ ] nxt.config.yaml version = 3.5.0
- [ ] orchestrator muestra 3.5.0 en status

**Story Points:** 2

#### US-002: Reset Estado Limpio
**Como** nuevo usuario
**Quiero** empezar con un estado limpio
**Para** no heredar tareas de sesiones anteriores

**Criterios de Aceptación:**
- [ ] state.json sin tareas pendientes antiguas
- [ ] framework_version = 3.5.0

**Story Points:** 1

#### US-003: Actualizar Banners de Agentes
**Como** usuario
**Quiero** ver la versión correcta en cada agente
**Para** saber que estoy usando la versión más reciente

**Criterios de Aceptación:**
- [ ] 33 agentes con banner v3.6.0
- [ ] Script de actualización automática

**Story Points:** 3

### Epic 2: CI/CD

#### US-004: Pipeline CI
**Como** contributor
**Quiero** que mis PRs sean validados automáticamente
**Para** asegurar que no rompo nada

**Criterios de Aceptación:**
- [ ] CI corre en PRs
- [ ] Tests Python ejecutan
- [ ] Lint pasa

**Story Points:** 5

#### US-005: Pipeline CD
**Como** maintainer
**Quiero** releases automáticos
**Para** publicar versiones sin trabajo manual

**Criterios de Aceptación:**
- [ ] Release en tags v*
- [ ] Changelog generado

**Story Points:** 3

#### US-006: Dockerfile
**Como** usuario Docker
**Quiero** ejecutar NXT en container
**Para** tener un ambiente consistente

**Criterios de Aceptación:**
- [ ] Build exitoso
- [ ] CLI funciona en container

**Story Points:** 3

### Epic 3: Testing

#### US-007: Tests Orchestrator
**Como** desarrollador
**Quiero** tests para el orchestrator
**Para** asegurar que la clasificación funciona

**Criterios de Aceptación:**
- [ ] Tests de clasificación por nivel
- [ ] Tests de delegación
- [ ] 80% coverage

**Story Points:** 5

#### US-008: Validador de Consistencia
**Como** CI pipeline
**Quiero** validar consistencia automáticamente
**Para** detectar inconsistencias antes de merge

**Criterios de Aceptación:**
- [ ] Valida versiones
- [ ] Valida agentes tienen banner
- [ ] Retorna código de error apropiado

**Story Points:** 3

### Epic 4: Documentación

#### US-009: Actualizar CLAUDE.md
**Como** usuario
**Quiero** documentación actualizada
**Para** entender cómo usar el framework

**Criterios de Aceptación:**
- [ ] Versión 3.6.0
- [ ] Todos los comandos documentados

**Story Points:** 3

#### US-010: README Profesional
**Como** nuevo usuario
**Quiero** un README atractivo
**Para** entender rápidamente qué hace el proyecto

**Criterios de Aceptación:**
- [ ] Quick Start
- [ ] Badges CI
- [ ] Features list

**Story Points:** 3

## 6. Fuera de Alcance

- Nuevos agentes (será v3.6.0)
- Cambios a la arquitectura de ejecución directa
- Soporte para otros IDEs (solo Claude Code)
- Integraciones con nuevos LLMs
- Breaking changes en la API de agentes

## 7. Dependencias

| Dependencia | Tipo | Impacto |
|-------------|------|---------|
| GitHub Actions | Externa | CI/CD |
| pytest | Dev | Testing |
| ruff | Dev | Linting |
| Docker | Opcional | Containerización |

## 8. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| CI falla en Windows | Media | Alto | Matrix multi-OS |
| Coverage < 80% | Alta | Medio | Priorizar tests críticos |
| Breaking change inadvertido | Baja | Alto | Tests de regresión |

## 9. Cronograma (3 Sprints)

### Sprint 1: Estabilidad (1 semana)
- US-001, US-002, US-003

### Sprint 2: Automatización (1 semana)
- US-004, US-005, US-006, US-007, US-008

### Sprint 3: Documentación (1 semana)
- US-009, US-010

**Total Story Points:** 31
**Velocity estimada:** 10-12 pts/sprint

---

*Generado por NXT PM - Fase DEFINIR*
