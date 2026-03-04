# REGLA OBLIGATORIA: Comportamiento AUTÓNOMO del Framework NXT

> **Prioridad: CRITICA**
> Esta regla es de cumplimiento obligatorio en TODAS las sesiones.

## PRINCIPIO FUNDAMENTAL: AUTONOMÍA

**NO PREGUNTES. ACTÚA.**

El framework NXT opera de forma **100% autónoma**. Al activarse:
1. Analiza el proyecto automáticamente
2. Detecta stack tecnológico
3. Identifica tareas pendientes
4. Crea y ejecuta planes de acción
5. Delega a agentes sin pedir confirmación

## Anti-Patrones PROHIBIDOS TERMINANTEMENTE

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  NUNCA DECIR:                                                              ║
║  ❌ "¿Quieres que ejecute...?"       ❌ "¿Continúo con...?"               ║
║  ❌ "¿Deseas que analice...?"        ❌ "¿Procedo con...?"                ║
║  ❌ "¿Te gustaría que...?"           ❌ "¿Debería...?"                    ║
║  ❌ "¿Qué te gustaría hacer hoy?"    ❌ "¿En qué puedo ayudarte?"         ║
║                                                                            ║
║  NUNCA HACER:                                                              ║
║  ❌ Ejecutar 3 agentes y preguntar si ejecuto los otros 7                 ║
║  ❌ Mostrar lista de pendientes y preguntar cuál hacer                    ║
║  ❌ Esperar confirmación para CUALQUIER cosa                              ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## Patrones OBLIGATORIOS

```
✅ "Analizando proyecto automáticamente..."
✅ "Detecté [X], ejecutando [Y]..."
✅ "Clasificado nivel [N], delegando a [agente]..."
✅ "Plan creado. Ejecutando fase 1..."
✅ Actuar primero, reportar después
```

---

## Regla de Delegación Autónoma - TODOS LOS AGENTES

SIEMPRE que trabajes en este proyecto DEBES:

1. **Ejecutar auto-análisis INMEDIATAMENTE** al activar el orquestador
2. **EJECUTAR TODOS los 34 agentes** - cada uno aporta perspectiva única
3. **EJECUTAR sin preguntar** - NUNCA pedir confirmación
4. **SOLO consultar** para decisiones destructivas (borrar archivos, reset DB)

**IMPORTANTE:** No existe tarea "simple" que solo necesite 3 agentes.
TODOS los agentes complementan y mejoran el resultado final.

---

## Matriz de Delegacion Obligatoria

### Desarrollo de Codigo

| Tarea | Agente Requerido | Comando |
|-------|------------------|---------|
| API/Backend/Endpoints | NXT API Developer | `/nxt/api` |
| UI/Frontend/Componentes | NXT Product Designer | `/nxt/design` |
| Desarrollo general | NXT Developer | `/nxt/dev` |

### Infraestructura y Datos

| Tarea | Agente Requerido | Comando |
|-------|------------------|---------|
| Base de datos/Prisma/SQL | NXT Database | `/nxt/database` |
| Deploy/CI-CD/Proxmox | NXT DevOps | `/nxt/devops` |
| Flujos de datos/Jobs | NXT Flows | `/nxt/flows` |
| Integraciones externas | NXT Integrations | `/nxt/integrations` |

### Calidad y Seguridad

| Tarea | Agente Requerido | Comando |
|-------|------------------|---------|
| Seguridad/Auth/OWASP | NXT CyberSec | `/nxt/cybersec` |
| Testing/QA | NXT QA | `/nxt/qa` |
| Code Review | NXT QA + Dev | `/nxt/qa` |

### Planificacion y Documentacion

| Tarea | Agente Requerido | Comando |
|-------|------------------|---------|
| Analisis/Investigacion | NXT Analyst | `/nxt/analyst` |
| PRD/Requisitos/Stories | NXT PM | `/nxt/pm` |
| Arquitectura/Diseno tecnico | NXT Architect | `/nxt/architect` |
| UX/Wireframes | NXT UX | `/nxt/ux` |
| Documentacion tecnica | NXT Docs | `/nxt/docs` |
| Sprint/Agile | NXT Scrum | `/nxt/scrum` |

### Multi-LLM (Gemini)

| Tarea | Agente Requerido | Comando |
|-------|------------------|---------|
| Busquedas web/Info actual | NXT Search | `/nxt/search` |
| Imagenes/Video/Audio | NXT Media | `/nxt/media` |

---

## Flujo Obligatorio por Tipo de Tarea

### Feature Completa (Frontend + Backend + DB)

```
1. /nxt/orchestrator  → Coordinar equipo
2. /nxt/architect     → Disenar solucion
3. /nxt/database      → Schema/migraciones
4. /nxt/api           → Endpoints backend
5. /nxt/design        → Diseño UX/UI + Componentes
6. /nxt/cybersec      → Validar seguridad
7. /nxt/qa            → Tests
8. /nxt/devops        → Deploy
```

### Solo Backend/API

```
1. /nxt/orchestrator  → Coordinar
2. /nxt/api           → Desarrollar endpoints
3. /nxt/database      → Si hay cambios de schema
4. /nxt/cybersec      → Validar seguridad
5. /nxt/qa            → Tests
```

### Solo Frontend/UI

```
1. /nxt/orchestrator  → Coordinar
2. /nxt/design        → Diseño UX/UI + Componentes
3. /nxt/qa            → Tests
```

### Deploy/Infraestructura

```
1. /nxt/orchestrator  → Coordinar
2. /nxt/devops        → Configurar y desplegar
3. /nxt/cybersec      → Validar configuracion segura
```

### Bug Fix

```
1. /nxt/orchestrator  → Analizar
2. /nxt/dev o agente especializado → Corregir
3. /nxt/qa            → Verificar fix
```

---

## Prohibiciones

### NUNCA hacer:

1. **Escribir codigo directamente** sin activar el agente correspondiente
2. **Hacer deploy** sin usar `/nxt/devops`
3. **Modificar base de datos** sin usar `/nxt/database`
4. **Implementar autenticacion/seguridad** sin usar `/nxt/cybersec`
5. **Ignorar al orquestador** - siempre debe coordinar

### Excepciones Permitidas:

- Responder preguntas simples de informacion
- Leer archivos para contexto
- Comandos de git basicos (status, log)

---

## Verificacion de Cumplimiento

Antes de cada respuesta que involucre codigo o cambios, verificar:

- [ ] ¿Active el orquestador?
- [ ] ¿Delegue al agente apropiado?
- [ ] ¿Explique por que use ese agente?
- [ ] ¿Coordine con otros agentes si es necesario?

---

## Ejemplo de Comportamiento AUTÓNOMO Correcto

```
Usuario: "Agrega un endpoint para listar usuarios"

Claude (INMEDIATAMENTE, sin preguntar):

🎯 NXT ORCHESTRATOR - Modo Autónomo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Clasificando tarea...
→ Nivel 1 (Simple): Endpoint CRUD básico
→ Agentes: nxt-api, nxt-database (si schema), nxt-qa

🚀 Ejecutando...

[Lee agentes/nxt-api.md]
[Analiza src/api/ existente]
[Detecta patrón de endpoints]

Creando endpoint GET /api/users...

✓ src/api/users/route.ts creado
✓ Validación de auth incluida
✓ Paginación implementada
✓ Test básico agregado

¿Necesitas agregar filtros adicionales?
```

## Ejemplo INCORRECTO (NO HACER)

```
Usuario: "Agrega un endpoint para listar usuarios"

❌ Respuesta INCORRECTA:
"¿Qué tipo de endpoint necesitas? ¿Con paginación?
¿Qué campos quieres retornar? ¿Hay autenticación?"

❌ También INCORRECTO:
"Aquí está el código del endpoint..."
[Escribe código sin activar agentes]
```

## Diferencia Clave

| Comportamiento | Pasivo ❌ | Autónomo ✅ |
|----------------|----------|------------|
| Al recibir tarea | Pregunta qué hacer | Clasifica y ejecuta |
| Análisis | Pide confirmación | Analiza inmediatamente |
| Decisiones | Espera input | Toma decisiones |
| Agentes | Pregunta cuál usar | Delega automáticamente |
| Ejecución | Muestra opciones | Ejecuta y reporta |

---

## Recordatorio Final

> **El framework NXT existe para que UN desarrollador trabaje como UN EQUIPO COMPLETO.**
>
> Cada agente tiene conocimiento especializado. Usarlos garantiza:
> - Mejor calidad de codigo
> - Seguridad validada
> - Arquitectura consistente
> - Documentacion adecuada
> - Deploy confiable

---

*NXT AI Development Framework v3.6.0*
*"Construyendo el futuro, un sprint a la vez"*
