# Sprint Planning: NXT AI Development Framework v3.6.0

> **Generado por:** NXT Scrum Master
> **Fecha de creación:** 2026-01-27
> **Proyecto:** NXT AI Development Framework
> **Release:** v3.6.0

---

## 1. Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre del proyecto** | NXT AI Development Framework v3.6.0 |
| **Fecha de inicio** | 2026-01-28 |
| **Fecha de fin estimada** | 2026-02-17 |
| **Duración total** | 3 semanas (3 sprints) |
| **Total Story Points** | 31 |
| **Velocity estimada** | 10-12 pts/sprint |
| **Jornada laboral** | Lunes a Viernes, 8 horas/día |
| **Story Point** | ≈ 4 horas (medio día) |

---

## 2. Calendario de Sprints

### Vista General

| Sprint | Inicio | Desarrollo | Sprint Review | Fin | Story Points |
|--------|--------|------------|---------------|-----|--------------|
| **Sprint 1** | 2026-01-28 (Mié) | 28-30 Ene (3 días) | 2026-01-31 (Vie) | 2026-01-31 | 6 pts |
| **Sprint 2** | 2026-02-03 (Lun) | 03-07 Feb (5 días) | 2026-02-10 (Lun) | 2026-02-10 | 19 pts |
| **Sprint 3** | 2026-02-11 (Mar) | 11-13 Feb (3 días) | 2026-02-14 (Vie) | 2026-02-14 | 6 pts |
| **Release** | - | - | - | 2026-02-17 (Lun) | - |

### Detalle por Sprint

```
SPRINT 1: ESTABILIDAD (6 pts = 3 días desarrollo + 1 día review)
═══════════════════════════════════════════════════════════════════════════
Semana 1: 28 Ene - 31 Ene
────────────────────────────────────────────────────────────────────────────
Mié 28        Jue 29        Vie 30        Vie 31
────────────────────────────────────────────────────────────────────────────
[DESARROLLO ──────────────────────────────]  [SPRINT REVIEW]
US-001 (2pts) US-002 (1pt)  US-003 (3pts)    REVIEW +
US-002        US-003        US-003           RETRO
              US-003

SPRINT 2: CI/CD Y AUTOMATIZACIÓN (19 pts = 5 días desarrollo + 1 día review)
═══════════════════════════════════════════════════════════════════════════
Semana 2-3: 03 Feb - 10 Feb
────────────────────────────────────────────────────────────────────────────
Lun 03    Mar 04    Mié 05    Jue 06    Vie 07        Lun 10
────────────────────────────────────────────────────────────────────────────
[DESARROLLO ─────────────────────────────────────────]  [SPRINT REVIEW]
US-004    US-004    US-005    US-006    US-007           REVIEW +
(5pts)    US-005    US-006    US-007    US-008           RETRO
          (3pts)    (3pts)    (5pts)    (3pts)

SPRINT 3: DOCUMENTACIÓN Y UX (6 pts = 3 días desarrollo + 1 día review)
═══════════════════════════════════════════════════════════════════════════
Semana 3: 11 Feb - 14 Feb
────────────────────────────────────────────────────────────────────────────
Mar 11        Mié 12        Jue 13        Vie 14
────────────────────────────────────────────────────────────────────────────
[DESARROLLO ──────────────────────────────]  [SPRINT REVIEW]
US-009 (3pts) US-009        US-010 (3pts)    REVIEW +
              US-010        US-010           RETRO

RELEASE
═══════════════════════════════════════════════════════════════════════════
Lun 17 Feb: Tag v3.6.0 + GitHub Release
```

---

## 3. EPIC 1: Estabilidad y Consistencia

### Información del Epic

| Campo | Valor |
|-------|-------|
| **ID** | EPIC-001 |
| **Nombre** | Estabilidad y Consistencia |
| **Descripción** | Sincronizar todas las versiones del framework a 3.5.0 y limpiar el estado para una base estable |
| **Prioridad** | Alta |
| **Sprint** | Sprint 1 |
| **Fecha inicio** | 2026-01-28 |
| **Fecha fin** | 2026-01-31 (incluye Sprint Review) |
| **Responsable** | nxt-dev |
| **Estado** | En progreso |
| **Story Points Total** | 6 |

---

### TASK US-001: Sincronizar Versiones a 3.5.0

| Campo | Valor |
|-------|-------|
| **ID** | US-001 |
| **Nombre** | Sincronizar versiones a 3.5.0 |
| **Descripción** | Actualizar todas las referencias de versión en el proyecto para que muestren consistentemente 3.5.0 |
| **Prioridad** | Alta |
| **Tipo** | Tarea técnica |
| **Story Points** | 2 |
| **Sprint** | Sprint 1 |
| **Fecha inicio** | 2026-01-28 |
| **Fecha fin** | 2026-01-28 |
| **Responsable** | nxt-dev |
| **Estado** | Completada |
| **Etiquetas** | versioning, config, must-have |

**Criterios de aceptación:**
- [x] `cat .nxt/version.txt` retorna "3.5.0"
- [x] `nxt.config.yaml` framework.version = "3.5.0"
- [x] `state.json` framework_version = "3.5.0"
- [x] `nxt_orchestrator_v3.py` muestra "3.5.0" en status

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-001-A | Actualizar .nxt/version.txt | Alta | Completada | 2026-01-28 | 2026-01-28 |
| US-001-B | Actualizar .nxt/nxt.config.yaml | Alta | Completada | 2026-01-28 | 2026-01-28 |
| US-001-C | Actualizar .nxt/state.json | Alta | Completada | 2026-01-28 | 2026-01-28 |
| US-001-D | Actualizar nxt_orchestrator_v3.py | Alta | Completada | 2026-01-28 | 2026-01-28 |
| US-001-E | Verificar con comando status | Alta | Completada | 2026-01-28 | 2026-01-28 |

---

### TASK US-002: Reset Estado Limpio

| Campo | Valor |
|-------|-------|
| **ID** | US-002 |
| **Nombre** | Reset estado limpio |
| **Descripción** | Limpiar el archivo state.json eliminando tareas pendientes antiguas y decisiones obsoletas para empezar con un estado fresco |
| **Prioridad** | Alta |
| **Tipo** | Tarea técnica |
| **Story Points** | 1 |
| **Sprint** | Sprint 1 |
| **Fecha inicio** | 2026-01-28 |
| **Fecha fin** | 2026-01-29 |
| **Responsable** | nxt-dev |
| **Estado** | Completada |
| **Etiquetas** | state, cleanup, must-have |

**Criterios de aceptación:**
- [x] `pending_tasks` = [] (vacío)
- [x] `completed_tasks` = [] (vacío)
- [x] `decisions_log` = [] (vacío o últimas 10)
- [x] `framework_version` = "3.5.0"

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-002-A | Backup del state.json actual | Media | Completada | 2026-01-28 | 2026-01-28 |
| US-002-B | Limpiar pending_tasks | Alta | Completada | 2026-01-28 | 2026-01-28 |
| US-002-C | Limpiar completed_tasks | Alta | Completada | 2026-01-28 | 2026-01-28 |
| US-002-D | Limpiar decisions_log | Media | Completada | 2026-01-29 | 2026-01-29 |
| US-002-E | Actualizar framework_version | Alta | Completada | 2026-01-29 | 2026-01-29 |

---

### TASK US-003: Actualizar Banners de Agentes

| Campo | Valor |
|-------|-------|
| **ID** | US-003 |
| **Nombre** | Actualizar banners de agentes a v3.6.0 |
| **Descripción** | Actualizar los mensajes de bienvenida (banners) de los 33 agentes NXT para mostrar la versión 3.5.0 |
| **Prioridad** | Media |
| **Tipo** | Tarea técnica |
| **Story Points** | 3 |
| **Sprint** | Sprint 1 |
| **Fecha inicio** | 2026-01-29 |
| **Fecha fin** | 2026-01-30 |
| **Responsable** | nxt-dev |
| **Estado** | En progreso |
| **Etiquetas** | agents, banners, documentation |

**Criterios de aceptación:**
- [ ] 33 agentes NXT muestran v3.6.0 en banner
- [ ] Formato de banner consistente en todos
- [ ] Script de automatización creado (opcional)

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-003-A | Actualizar nxt-orchestrator.md | Alta | Completada | 2026-01-29 | 2026-01-29 |
| US-003-B | Actualizar nxt-analyst.md | Media | Pendiente | 2026-01-29 | 2026-01-29 |
| US-003-C | Actualizar nxt-pm.md | Media | Pendiente | 2026-01-29 | 2026-01-29 |
| US-003-D | Actualizar nxt-architect.md | Media | Pendiente | 2026-01-29 | 2026-01-29 |
| US-003-E | Actualizar nxt-ux.md | Media | Pendiente | 2026-01-29 | 2026-01-29 |
| US-003-F | Actualizar nxt-dev.md | Media | Pendiente | 2026-01-29 | 2026-01-29 |
| US-003-G | Actualizar nxt-qa.md | Media | Pendiente | 2026-01-29 | 2026-01-29 |
| US-003-H | Actualizar nxt-devops.md | Media | Pendiente | 2026-01-29 | 2026-01-29 |
| US-003-I | Actualizar nxt-tech-writer.md | Baja | Pendiente | 2026-01-30 | 2026-01-30 |
| US-003-J | Actualizar nxt-scrum-master.md | Baja | Pendiente | 2026-01-30 | 2026-01-30 |
| US-003-K | Actualizar nxt-cybersec.md | Baja | Pendiente | 2026-01-30 | 2026-01-30 |
| US-003-L | Actualizar nxt-uidev.md | Baja | Pendiente | 2026-01-30 | 2026-01-30 |
| US-003-M | Actualizar nxt-api.md | Baja | Pendiente | 2026-01-30 | 2026-01-30 |
| US-003-N | Actualizar nxt-database.md | Baja | Pendiente | 2026-01-30 | 2026-01-30 |
| US-003-O | Actualizar agentes restantes (19) | Baja | Pendiente | 2026-01-30 | 2026-01-30 |
| US-003-P | Crear script de automatización | Baja | Pendiente | 2026-01-30 | 2026-01-30 |

---

### SPRINT REVIEW 1

| Campo | Valor |
|-------|-------|
| **ID** | SR-001 |
| **Nombre** | Sprint Review 1 - Estabilidad |
| **Descripción** | Revisar los entregables del Sprint 1, demostrar la sincronización de versiones y banners actualizados. Retrospectiva del equipo. |
| **Prioridad** | Alta |
| **Tipo** | Ceremonia Scrum |
| **Fecha** | 2026-01-31 (Viernes) |
| **Duración** | Día completo (8 horas) |
| **Responsable** | nxt-scrum |
| **Estado** | Pendiente |
| **Etiquetas** | sprint-review, ceremony |

**Agenda del Sprint Review 1:**

| Hora | Actividad | Duración | Responsable |
|------|-----------|----------|-------------|
| 09:00 - 10:00 | Demo US-001: Versiones sincronizadas | 1h | nxt-dev |
| 10:00 - 10:30 | Demo US-002: Estado limpio | 30min | nxt-dev |
| 10:30 - 12:00 | Demo US-003: Banners actualizados | 1.5h | nxt-dev |
| 12:00 - 13:00 | Almuerzo | 1h | - |
| 13:00 - 14:00 | Feedback de stakeholders | 1h | nxt-pm |
| 14:00 - 15:00 | Retrospectiva | 1h | nxt-scrum |
| 15:00 - 16:00 | Planning Sprint 2 (refinamiento) | 1h | nxt-scrum |
| 16:00 - 17:00 | Documentar decisiones y ajustes | 1h | nxt-docs |

**Entregables a revisar:**
- [ ] Comando `status` muestra versión 3.5.0
- [ ] 33 agentes con banner actualizado
- [ ] State.json limpio y funcional
- [ ] Documentación de análisis generada

---

## 4. EPIC 2: CI/CD y Automatización

### Información del Epic

| Campo | Valor |
|-------|-------|
| **ID** | EPIC-002 |
| **Nombre** | CI/CD y Automatización |
| **Descripción** | Implementar pipelines de integración continua y deployment con GitHub Actions, containerización y testing automatizado |
| **Prioridad** | Alta |
| **Sprint** | Sprint 2 |
| **Fecha inicio** | 2026-02-03 |
| **Fecha fin** | 2026-02-10 (incluye Sprint Review) |
| **Responsable** | nxt-devops |
| **Estado** | En progreso |
| **Story Points Total** | 19 |

---

### TASK US-004: Pipeline CI con GitHub Actions

| Campo | Valor |
|-------|-------|
| **ID** | US-004 |
| **Nombre** | Pipeline CI con GitHub Actions |
| **Descripción** | Crear workflow de integración continua que ejecute linting, tests y validación en múltiples sistemas operativos y versiones de Python |
| **Prioridad** | Alta |
| **Tipo** | Infraestructura |
| **Story Points** | 5 |
| **Sprint** | Sprint 2 |
| **Fecha inicio** | 2026-02-03 |
| **Fecha fin** | 2026-02-04 |
| **Responsable** | nxt-devops |
| **Estado** | Completada |
| **Etiquetas** | ci-cd, github-actions, automation, must-have |
| **Dependencias** | Ninguna |

**Criterios de aceptación:**
- [x] CI ejecuta en push a main y PRs
- [x] Matrix multi-OS (ubuntu, windows, macos)
- [x] Matrix multi-Python (3.10, 3.11, 3.12)
- [x] Lint con ruff pasa
- [x] Tests con pytest pasan
- [x] Validación de consistencia incluida

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-004-A | Crear .github/workflows/ci.yml | Alta | Completada | 2026-02-03 | 2026-02-03 |
| US-004-B | Configurar matrix multi-OS | Alta | Completada | 2026-02-03 | 2026-02-03 |
| US-004-C | Configurar matrix multi-Python | Alta | Completada | 2026-02-03 | 2026-02-03 |
| US-004-D | Agregar step de linting | Media | Completada | 2026-02-03 | 2026-02-03 |
| US-004-E | Agregar step de tests | Alta | Completada | 2026-02-03 | 2026-02-03 |
| US-004-F | Agregar validación de versiones | Media | Completada | 2026-02-04 | 2026-02-04 |
| US-004-G | Agregar validación de agentes | Baja | Completada | 2026-02-04 | 2026-02-04 |
| US-004-H | Test del workflow en GitHub | Alta | Pendiente | 2026-02-04 | 2026-02-04 |

---

### TASK US-005: Pipeline CD (Releases)

| Campo | Valor |
|-------|-------|
| **ID** | US-005 |
| **Nombre** | Pipeline CD para releases automáticos |
| **Descripción** | Crear workflow que genere releases automáticos en GitHub cuando se pushea un tag de versión |
| **Prioridad** | Media |
| **Tipo** | Infraestructura |
| **Story Points** | 3 |
| **Sprint** | Sprint 2 |
| **Fecha inicio** | 2026-02-04 |
| **Fecha fin** | 2026-02-05 |
| **Responsable** | nxt-devops |
| **Estado** | Completada |
| **Etiquetas** | ci-cd, github-actions, releases, should-have |
| **Dependencias** | US-004 |

**Criterios de aceptación:**
- [x] Release automático en tags v*
- [x] Changelog generado automáticamente
- [x] Body de release formateado
- [x] Detección de pre-releases (alpha, beta, rc)

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-005-A | Crear .github/workflows/release.yml | Alta | Completada | 2026-02-04 | 2026-02-04 |
| US-005-B | Configurar trigger en tags | Alta | Completada | 2026-02-04 | 2026-02-04 |
| US-005-C | Implementar generación de changelog | Media | Completada | 2026-02-05 | 2026-02-05 |
| US-005-D | Formatear body del release | Media | Completada | 2026-02-05 | 2026-02-05 |
| US-005-E | Test con tag de prueba | Alta | Pendiente | 2026-02-05 | 2026-02-05 |

---

### TASK US-006: Dockerfile Multi-stage

| Campo | Valor |
|-------|-------|
| **ID** | US-006 |
| **Nombre** | Dockerfile multi-stage |
| **Descripción** | Crear Dockerfile optimizado con build multi-stage para ejecutar las herramientas CLI en un container |
| **Prioridad** | Media |
| **Tipo** | Infraestructura |
| **Story Points** | 3 |
| **Sprint** | Sprint 2 |
| **Fecha inicio** | 2026-02-05 |
| **Fecha fin** | 2026-02-06 |
| **Responsable** | nxt-devops |
| **Estado** | Completada |
| **Etiquetas** | docker, containers, could-have |
| **Dependencias** | Ninguna |

**Criterios de aceptación:**
- [x] Build exitoso sin errores
- [ ] `docker run nxt-dev status` funciona
- [ ] Imagen < 500MB
- [x] Usuario non-root por seguridad
- [x] Health check configurado

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-006-A | Crear Dockerfile base | Alta | Completada | 2026-02-05 | 2026-02-05 |
| US-006-B | Implementar multi-stage build | Media | Completada | 2026-02-05 | 2026-02-05 |
| US-006-C | Agregar usuario non-root | Media | Completada | 2026-02-05 | 2026-02-05 |
| US-006-D | Configurar health check | Baja | Completada | 2026-02-06 | 2026-02-06 |
| US-006-E | Agregar labels OCI | Baja | Completada | 2026-02-06 | 2026-02-06 |
| US-006-F | Test de build local | Alta | Pendiente | 2026-02-06 | 2026-02-06 |
| US-006-G | Test de ejecución | Alta | Pendiente | 2026-02-06 | 2026-02-06 |

---

### TASK US-007: Tests del Orchestrator

| Campo | Valor |
|-------|-------|
| **ID** | US-007 |
| **Nombre** | Tests unitarios del Orchestrator |
| **Descripción** | Crear suite de tests para el orquestador v3 cubriendo clasificación, delegación y planificación |
| **Prioridad** | Alta |
| **Tipo** | Testing |
| **Story Points** | 5 |
| **Sprint** | Sprint 2 |
| **Fecha inicio** | 2026-02-06 |
| **Fecha fin** | 2026-02-07 |
| **Responsable** | nxt-qa |
| **Estado** | Pendiente |
| **Etiquetas** | testing, quality, must-have |
| **Dependencias** | US-004 |

**Criterios de aceptación:**
- [ ] Tests de clasificación por nivel (0-4)
- [ ] Tests de delegación por tipo de tarea
- [ ] Tests de planificación
- [ ] Coverage >= 80% en orchestrator
- [ ] Todos los tests pasan en CI

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-007-A | Tests clasificación nivel_0 (trivial) | Alta | Pendiente | 2026-02-06 | 2026-02-06 |
| US-007-B | Tests clasificación nivel_1 (simple) | Alta | Pendiente | 2026-02-06 | 2026-02-06 |
| US-007-C | Tests clasificación nivel_2 (estándar) | Alta | Pendiente | 2026-02-06 | 2026-02-06 |
| US-007-D | Tests clasificación nivel_3 (complejo) | Media | Pendiente | 2026-02-06 | 2026-02-06 |
| US-007-E | Tests clasificación nivel_4 (enterprise) | Media | Pendiente | 2026-02-07 | 2026-02-07 |
| US-007-F | Tests delegación por TaskType | Alta | Pendiente | 2026-02-07 | 2026-02-07 |
| US-007-G | Tests de planificación de workflows | Media | Pendiente | 2026-02-07 | 2026-02-07 |
| US-007-H | Tests de estado (StateManager) | Media | Pendiente | 2026-02-07 | 2026-02-07 |
| US-007-I | Verificar coverage >= 80% | Alta | Pendiente | 2026-02-07 | 2026-02-07 |

---

### TASK US-008: Validador de Consistencia

| Campo | Valor |
|-------|-------|
| **ID** | US-008 |
| **Nombre** | Validador de consistencia standalone |
| **Descripción** | Crear script que valide la consistencia de versiones, agentes y configuración del proyecto |
| **Prioridad** | Media |
| **Tipo** | Herramienta |
| **Story Points** | 3 |
| **Sprint** | Sprint 2 |
| **Fecha inicio** | 2026-02-07 |
| **Fecha fin** | 2026-02-07 |
| **Responsable** | nxt-dev |
| **Estado** | Parcial |
| **Etiquetas** | tooling, validation, should-have |
| **Dependencias** | US-001 |

**Criterios de aceptación:**
- [ ] Script ejecutable standalone
- [ ] Valida versiones en todos los archivos
- [ ] Valida que agentes tengan banner
- [ ] Retorna exit code apropiado (0=OK, 1=error)
- [ ] Output legible con colores

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-008-A | Validación incluida en CI | Alta | Completada | 2026-02-07 | 2026-02-07 |
| US-008-B | Crear script consistency_validator.py | Media | Pendiente | 2026-02-07 | 2026-02-07 |
| US-008-C | Implementar validación de versiones | Alta | Pendiente | 2026-02-07 | 2026-02-07 |
| US-008-D | Implementar validación de agentes | Media | Pendiente | 2026-02-07 | 2026-02-07 |
| US-008-E | Agregar output con colores | Baja | Pendiente | 2026-02-07 | 2026-02-07 |
| US-008-F | Documentar uso del validador | Baja | Pendiente | 2026-02-07 | 2026-02-07 |

---

### SPRINT REVIEW 2

| Campo | Valor |
|-------|-------|
| **ID** | SR-002 |
| **Nombre** | Sprint Review 2 - CI/CD y Automatización |
| **Descripción** | Revisar los entregables del Sprint 2, demostrar pipelines CI/CD funcionando, Docker y tests. Retrospectiva del equipo. |
| **Prioridad** | Alta |
| **Tipo** | Ceremonia Scrum |
| **Fecha** | 2026-02-10 (Lunes) |
| **Duración** | Día completo (8 horas) |
| **Responsable** | nxt-scrum |
| **Estado** | Pendiente |
| **Etiquetas** | sprint-review, ceremony |

**Agenda del Sprint Review 2:**

| Hora | Actividad | Duración | Responsable |
|------|-----------|----------|-------------|
| 09:00 - 10:30 | Demo US-004: Pipeline CI en acción | 1.5h | nxt-devops |
| 10:30 - 11:30 | Demo US-005: Release automático | 1h | nxt-devops |
| 11:30 - 12:30 | Demo US-006: Docker build y run | 1h | nxt-devops |
| 12:30 - 13:30 | Almuerzo | 1h | - |
| 13:30 - 14:30 | Demo US-007: Tests y coverage | 1h | nxt-qa |
| 14:30 - 15:00 | Demo US-008: Validador | 30min | nxt-dev |
| 15:00 - 16:00 | Retrospectiva | 1h | nxt-scrum |
| 16:00 - 17:00 | Planning Sprint 3 (refinamiento) | 1h | nxt-scrum |

**Entregables a revisar:**
- [ ] CI pasa en los 3 OS (ubuntu, windows, macos)
- [ ] Release automático funciona con tag
- [ ] Docker image construye y ejecuta
- [ ] Tests con coverage >= 80%
- [ ] Validador de consistencia funcional

---

## 5. EPIC 3: Documentación y UX

### Información del Epic

| Campo | Valor |
|-------|-------|
| **ID** | EPIC-003 |
| **Nombre** | Documentación y UX |
| **Descripción** | Actualizar toda la documentación del proyecto y mejorar la experiencia de usuario del CLI |
| **Prioridad** | Media |
| **Sprint** | Sprint 3 |
| **Fecha inicio** | 2026-02-11 |
| **Fecha fin** | 2026-02-14 (incluye Sprint Review) |
| **Responsable** | nxt-docs |
| **Estado** | En progreso |
| **Story Points Total** | 6 |

---

### TASK US-009: Actualizar CLAUDE.md

| Campo | Valor |
|-------|-------|
| **ID** | US-009 |
| **Nombre** | Actualizar CLAUDE.md a v3.6.0 |
| **Descripción** | Actualizar la documentación principal del proyecto para reflejar los cambios de la versión 3.5.0 |
| **Prioridad** | Alta |
| **Tipo** | Documentación |
| **Story Points** | 3 |
| **Sprint** | Sprint 3 |
| **Fecha inicio** | 2026-02-11 |
| **Fecha fin** | 2026-02-12 |
| **Responsable** | nxt-docs |
| **Estado** | Completada |
| **Etiquetas** | documentation, must-have |
| **Dependencias** | EPIC-001, EPIC-002 |

**Criterios de aceptación:**
- [x] Versión 3.6.0 en título
- [x] Sección de novedades v3.6.0 agregada
- [ ] Todos los comandos documentados correctamente
- [x] Links a documentación generada

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-009-A | Actualizar versión en título | Alta | Completada | 2026-02-11 | 2026-02-11 |
| US-009-B | Agregar sección novedades v3.6.0 | Alta | Completada | 2026-02-11 | 2026-02-11 |
| US-009-C | Documentar CI/CD nuevo | Media | Completada | 2026-02-11 | 2026-02-11 |
| US-009-D | Agregar links a docs generados | Media | Completada | 2026-02-12 | 2026-02-12 |
| US-009-E | Revisar tabla de comandos | Media | Pendiente | 2026-02-12 | 2026-02-12 |
| US-009-F | Validar todos los ejemplos | Baja | Pendiente | 2026-02-12 | 2026-02-12 |

---

### TASK US-010: README Profesional

| Campo | Valor |
|-------|-------|
| **ID** | US-010 |
| **Nombre** | Crear README profesional |
| **Descripción** | Crear un README.md atractivo y profesional con Quick Start, badges de CI, features y ejemplos |
| **Prioridad** | Media |
| **Tipo** | Documentación |
| **Story Points** | 3 |
| **Sprint** | Sprint 3 |
| **Fecha inicio** | 2026-02-12 |
| **Fecha fin** | 2026-02-13 |
| **Responsable** | nxt-docs |
| **Estado** | Pendiente |
| **Etiquetas** | documentation, readme, should-have |
| **Dependencias** | US-004, US-009 |

**Criterios de aceptación:**
- [ ] Quick Start prominente (< 2 minutos)
- [ ] Badges de CI (build status)
- [ ] Lista de features principales
- [ ] Tabla de agentes disponibles
- [ ] Ejemplos de uso básico
- [ ] Screenshots/GIFs (opcional)

**Subtareas:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| US-010-A | Crear sección Quick Start | Alta | Pendiente | 2026-02-12 | 2026-02-12 |
| US-010-B | Agregar badges de CI | Media | Pendiente | 2026-02-12 | 2026-02-12 |
| US-010-C | Documentar features principales | Alta | Pendiente | 2026-02-12 | 2026-02-12 |
| US-010-D | Crear tabla de agentes | Media | Pendiente | 2026-02-13 | 2026-02-13 |
| US-010-E | Agregar ejemplos de uso | Media | Pendiente | 2026-02-13 | 2026-02-13 |
| US-010-F | Agregar screenshots (opcional) | Baja | Pendiente | 2026-02-13 | 2026-02-13 |
| US-010-G | Revisar formato y estilo | Baja | Pendiente | 2026-02-13 | 2026-02-13 |

---

### SPRINT REVIEW 3

| Campo | Valor |
|-------|-------|
| **ID** | SR-003 |
| **Nombre** | Sprint Review 3 - Documentación y Release Final |
| **Descripción** | Revisar documentación completa, validar que todo está listo para release v3.6.0. Retrospectiva final del proyecto. |
| **Prioridad** | Alta |
| **Tipo** | Ceremonia Scrum |
| **Fecha** | 2026-02-14 (Viernes) |
| **Duración** | Día completo (8 horas) |
| **Responsable** | nxt-scrum |
| **Estado** | Pendiente |
| **Etiquetas** | sprint-review, ceremony, release |

**Agenda del Sprint Review 3:**

| Hora | Actividad | Duración | Responsable |
|------|-----------|----------|-------------|
| 09:00 - 10:00 | Demo US-009: CLAUDE.md actualizado | 1h | nxt-docs |
| 10:00 - 11:30 | Demo US-010: README profesional | 1.5h | nxt-docs |
| 11:30 - 12:30 | Revisión completa de documentación | 1h | nxt-docs |
| 12:30 - 13:30 | Almuerzo | 1h | - |
| 13:30 - 14:30 | Validación final pre-release | 1h | nxt-qa |
| 14:30 - 15:30 | Retrospectiva final del proyecto | 1h | nxt-scrum |
| 15:30 - 16:30 | Preparación de release notes | 1h | nxt-pm |
| 16:30 - 17:00 | Go/No-Go decision para release | 30min | nxt-pm |

**Entregables a revisar:**
- [ ] CLAUDE.md completo y actualizado
- [ ] README.md profesional con Quick Start
- [ ] Toda la documentación de docs/ revisada
- [ ] Checklist de release completado
- [ ] Decisión final Go/No-Go

---

## 6. RELEASE v3.6.0

| Campo | Valor |
|-------|-------|
| **ID** | REL-001 |
| **Nombre** | Release NXT AI Development Framework v3.6.0 |
| **Descripción** | Publicar la versión 3.5.0 del framework con todas las mejoras de estabilidad, CI/CD y documentación |
| **Prioridad** | Alta |
| **Tipo** | Release |
| **Fecha** | 2026-02-17 (Lunes) |
| **Responsable** | nxt-devops |
| **Estado** | Pendiente |
| **Etiquetas** | release, milestone |
| **Dependencias** | SR-003 (Sprint Review 3 completado) |

**Checklist de Release:**

| Tarea | Responsable | Estado |
|-------|-------------|--------|
| Todas las US completadas | nxt-scrum | Pendiente |
| Tests pasan en CI | nxt-qa | Pendiente |
| Documentación revisada | nxt-docs | Pendiente |
| Changelog generado | nxt-changelog | Pendiente |
| Tag v3.6.0 creado | nxt-devops | Pendiente |
| GitHub Release publicado | nxt-devops | Pendiente |
| Notificación a stakeholders | nxt-pm | Pendiente |

**Subtareas del Release:**

| Subtarea | Descripción | Prioridad | Estado | Fecha inicio | Fecha fin |
|----------|-------------|-----------|--------|--------------|-----------|
| REL-001-A | Merge final a main | Alta | Pendiente | 2026-02-17 | 2026-02-17 |
| REL-001-B | Crear tag v3.6.0 | Alta | Pendiente | 2026-02-17 | 2026-02-17 |
| REL-001-C | Verificar GitHub Release automático | Alta | Pendiente | 2026-02-17 | 2026-02-17 |
| REL-001-D | Validar release notes | Media | Pendiente | 2026-02-17 | 2026-02-17 |
| REL-001-E | Comunicar release | Media | Pendiente | 2026-02-17 | 2026-02-17 |

---

## 7. Resumen de Prioridades

### Por Prioridad

| Prioridad | Tasks | Story Points | % del Total |
|-----------|-------|--------------|-------------|
| **Alta** | US-001, US-002, US-004, US-007, US-009, SR-001, SR-002, SR-003, REL-001 | 16 + ceremonias | 52% |
| **Media** | US-003, US-005, US-006, US-008, US-010 | 15 | 48% |
| **Baja** | (subtareas) | - | - |

### Por Estado

| Estado | Tasks | Story Points |
|--------|-------|--------------|
| Completada | US-001, US-002, US-004, US-005, US-006, US-009 | 17 |
| En progreso | US-003, US-008 | 6 |
| Pendiente | US-007, US-010, SR-001, SR-002, SR-003, REL-001 | 8 + ceremonias |

---

## 8. Cronograma Visual Completo

```
ENERO 2026
═══════════════════════════════════════════════════════════════════════════
     Lun 27    Mar 28    Mié 28    Jue 29    Vie 30    Vie 31
     ─────────────────────────────────────────────────────────
     (hoy)     INICIO    US-001    US-002    US-003    SR-001
              US-001    US-002    US-003    US-003    SPRINT
              US-002    US-003    US-003    US-003    REVIEW
              [SPRINT 1 - DESARROLLO ──────────────]  [REVIEW]

FEBRERO 2026
═══════════════════════════════════════════════════════════════════════════
     Lun 03    Mar 04    Mié 05    Jue 06    Vie 07    Lun 10
     ─────────────────────────────────────────────────────────
     US-004    US-004    US-005    US-006    US-007    SR-002
     (5pts)    US-005    US-006    US-007    US-008    SPRINT
              (3pts)    (3pts)    (5pts)    (3pts)    REVIEW
     [SPRINT 2 - DESARROLLO ──────────────────────]  [REVIEW]

     Mar 11    Mié 12    Jue 13    Vie 14    Lun 17
     ─────────────────────────────────────────────────
     US-009    US-009    US-010    SR-003    REL-001
     (3pts)    US-010    US-010    SPRINT    RELEASE
              (3pts)              REVIEW    v3.6.0
     [SPRINT 3 - DESARROLLO ─────]  [REVIEW]  [RELEASE]
```

---

## 9. Dependencias entre Tasks

```
                          ┌─────────────────────────────────────┐
                          │         SPRINT 1                     │
                          │                                      │
US-001 (Versiones) ───────┼──────────────────────────────────┐  │
                          │                                  │  │
US-002 (Estado) ──────────┼──────────────────────────────────┤  │
                          │                                  │  │
US-003 (Banners) ─────────┼──────────────────────────────────┤  │
                          │                                  ▼  │
                          │                              SR-001 │
                          └─────────────────────────────────────┘
                                              │
                          ┌───────────────────┼─────────────────┐
                          │         SPRINT 2  │                  │
                          │                   ▼                  │
US-004 (CI) ──────────────┼───────┬───────────────────────────┐ │
                          │       │                           │ │
                          │       ▼                           │ │
                    US-007 (Tests)                            │ │
                          │       │                           │ │
US-005 (CD) ──────────────┼───────┤                           │ │
                          │       │                           │ │
US-006 (Docker) ──────────┼───────┤                           │ │
                          │       │                           │ │
US-008 (Validador) ───────┼───────┤                           │ │
                          │       │                           ▼ │
                          │       └───────────────────────> SR-002
                          └─────────────────────────────────────┘
                                              │
                          ┌───────────────────┼─────────────────┐
                          │         SPRINT 3  │                  │
                          │                   ▼                  │
US-009 (CLAUDE.md) ───────┼───────────────────────────────────┐ │
                          │                                   │ │
US-010 (README) ──────────┼───────────────────────────────────┤ │
                          │                                   ▼ │
                          │                               SR-003 │
                          └─────────────────────────────────────┘
                                              │
                                              ▼
                                         REL-001
                                       (v3.6.0)
```

---

## 10. Definition of Done (DoD)

### Para User Stories

Para considerar una User Story COMPLETADA en Asana:

- [ ] Código/cambios implementados según criterios de aceptación
- [ ] Todas las subtareas completadas
- [ ] Tests pasan (si aplica)
- [ ] Documentación actualizada (si aplica)
- [ ] Self-review realizado
- [ ] Sin errores de linting
- [ ] Versión correcta (3.6.0)
- [ ] Probado localmente

### Para Sprint Reviews

Para considerar un Sprint Review COMPLETADO:

- [ ] Todas las demos realizadas
- [ ] Feedback de stakeholders documentado
- [ ] Retrospectiva completada
- [ ] Acciones de mejora identificadas
- [ ] Planning del siguiente sprint refinado
- [ ] Acta de reunión generada

### Para Release

Para considerar el Release COMPLETADO:

- [ ] Todas las User Stories de los 3 sprints completadas
- [ ] Todos los Sprint Reviews realizados
- [ ] CI pasa en todas las plataformas
- [ ] Tag de versión creado
- [ ] GitHub Release publicado
- [ ] Stakeholders notificados

---

## 11. Riesgos y Mitigación

| ID | Riesgo | Probabilidad | Impacto | Mitigación | Responsable | Fecha revisión |
|----|--------|--------------|---------|------------|-------------|----------------|
| R-001 | CI falla en Windows | Media | Alto | Matrix multi-OS, fix específico | nxt-devops | 2026-02-04 |
| R-002 | Coverage < 80% | Alta | Medio | Priorizar tests críticos | nxt-qa | 2026-02-07 |
| R-003 | Banners inconsistentes | Media | Bajo | Script de automatización | nxt-dev | 2026-01-30 |
| R-004 | Dockerfile build falla | Baja | Medio | Test local antes de push | nxt-devops | 2026-02-06 |
| R-005 | Breaking changes | Baja | Alto | Tests de regresión | nxt-qa | 2026-02-13 |
| R-006 | Sprint Review se extiende | Media | Medio | Agenda estricta con timeboxing | nxt-scrum | Cada SR |

---

## 12. Notas para Asana

### Campos requeridos por tarea:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre** | Título descriptivo | "US-001: Sincronizar versiones a 3.5.0" |
| **Descripción** | Detalle completo de la tarea | Ver cada US arriba |
| **Responsable** | Agente o persona asignada | nxt-dev |
| **Fecha de inicio** | Fecha de comienzo | 2026-01-28 |
| **Fecha de vencimiento** | Fecha límite | 2026-01-28 |
| **Prioridad** | Alta / Media / Baja | Alta |
| **Estado** | Pendiente / En progreso / Completada | Completada |
| **Etiquetas** | Tags relevantes | versioning, config, must-have |
| **Story Points** | Estimación de esfuerzo | 2 |
| **Sprint** | Sprint asignado | Sprint 1 |
| **Dependencias** | Tareas que deben completarse primero | US-001 |

### Estructura de proyecto en Asana:

```
NXT Framework v3.6.0 (Proyecto)
│
├── EPIC-001: Estabilidad (Sección)
│   ├── US-001: Sincronizar versiones
│   │   ├── US-001-A: Actualizar version.txt
│   │   ├── US-001-B: Actualizar nxt.config.yaml
│   │   ├── US-001-C: Actualizar state.json
│   │   ├── US-001-D: Actualizar orchestrator
│   │   └── US-001-E: Verificar status
│   ├── US-002: Reset estado
│   │   └── (subtareas...)
│   ├── US-003: Actualizar banners
│   │   └── (16 subtareas...)
│   └── SR-001: Sprint Review 1
│
├── EPIC-002: CI/CD (Sección)
│   ├── US-004: Pipeline CI
│   │   └── (8 subtareas...)
│   ├── US-005: Pipeline CD
│   │   └── (5 subtareas...)
│   ├── US-006: Dockerfile
│   │   └── (7 subtareas...)
│   ├── US-007: Tests
│   │   └── (9 subtareas...)
│   ├── US-008: Validador
│   │   └── (6 subtareas...)
│   └── SR-002: Sprint Review 2
│
├── EPIC-003: Documentación (Sección)
│   ├── US-009: CLAUDE.md
│   │   └── (6 subtareas...)
│   ├── US-010: README
│   │   └── (7 subtareas...)
│   └── SR-003: Sprint Review 3
│
└── Release (Sección)
    └── REL-001: Release v3.6.0
        └── (5 subtareas...)
```

### Milestones en Asana:

| Milestone | Fecha | Descripción |
|-----------|-------|-------------|
| Sprint 1 Complete | 2026-01-31 | Estabilidad lograda |
| Sprint 2 Complete | 2026-02-10 | CI/CD funcionando |
| Sprint 3 Complete | 2026-02-14 | Documentación lista |
| Release v3.6.0 | 2026-02-17 | Versión publicada |

---

## 13. Métricas del Proyecto

### Velocity por Sprint

| Sprint | Planificado | Completado | Velocity |
|--------|-------------|------------|----------|
| Sprint 1 | 6 pts | TBD | TBD |
| Sprint 2 | 19 pts | TBD | TBD |
| Sprint 3 | 6 pts | TBD | TBD |
| **Total** | **31 pts** | **TBD** | **TBD** |

### Burndown Chart (Template)

```
Story Points
    │
 31 ┤████████████████████████████████████████████████
    │████████████████████████████████████████████████
 25 ┤█████████████████████████████████████░░░░░░░░░░░
    │█████████████████████████████████████░░░░░░░░░░░
 19 ┤████████████████████████████░░░░░░░░░░░░░░░░░░░░
    │████████████████████████████░░░░░░░░░░░░░░░░░░░░
 12 ┤███████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │███████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  6 ┤██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  0 ┼───────────────────────────────────────────────→
    S1-Ini  SR1  S2-Ini  SR2  S3-Ini  SR3  Release
                        Tiempo
```

---

*Generado por NXT Scrum Master - Sprint Planning v3.6.0*
*Última actualización: 2026-01-27*
*Próxima revisión: 2026-01-31 (Sprint Review 1)*
