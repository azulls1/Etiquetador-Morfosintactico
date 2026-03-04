# NXT ORCHESTRATOR - EJECUCIÓN AUTÓNOMA DIRECTA

**INSTRUCCIÓN PARA CLAUDE: Ejecuta estos pasos EN ORDEN, sin preguntar.**

---

## PASO 1: ANÁLISIS DEL PROYECTO

Ejecuta con Bash:
```bash
python herramientas/nxt_orchestrator_v3.py analyze
```

---

## PASO 2: LEER ARCHIVOS DEL PROYECTO

Lee en paralelo (usa Read tool):
- `package.json` (si existe)
- `requirements.txt` o `pyproject.toml` (si existe)
- `README.md`
- `CLAUDE.md`

---

## PASO 3: BUSCAR TAREAS PENDIENTES

Usa Grep para buscar:
```
TODO:|FIXME:|HACK:|XXX:
```

---

## PASO 4: EJECUTAR AGENTES

Lee y ejecuta las instrucciones de cada agente relevante.
Los agentes están en `agentes/nxt-*.md`.

Para cada tarea identificada:
1. Lee el archivo del agente correspondiente
2. Sigue sus instrucciones
3. Ejecuta las acciones con las herramientas disponibles (Read, Write, Edit, Bash, Grep, Glob)

**Agentes disponibles (32):**
- nxt-analyst, nxt-pm, nxt-architect, nxt-design
- nxt-dev, nxt-qa, nxt-devops, nxt-cybersec
- nxt-docs, nxt-api, nxt-database
- nxt-scrum, nxt-infra, nxt-search, nxt-media
- nxt-integrations, nxt-flows, nxt-migrator
- nxt-performance, nxt-accessibility, nxt-mobile
- nxt-data, nxt-aiml, nxt-compliance, nxt-realtime
- nxt-localization, nxt-paige, nxt-context
- nxt-changelog, nxt-ralph, nxt-multicontext

---

## PASO 5: MOSTRAR RESUMEN

Al finalizar, muestra:
```
╔══════════════════════════════════════════════════════════════════╗
║   🎯 NXT ORCHESTRATOR - Ejecución Completada                     ║
╚══════════════════════════════════════════════════════════════════╝

📊 ANÁLISIS
[resumen del proyecto]

🤖 AGENTES EJECUTADOS
[lista de agentes y qué hicieron]

📋 ACCIONES REALIZADAS
[lista de cambios/acciones]

🎯 SIGUIENTE PASO
[recomendación]
```

---

## REGLAS

1. **NO PREGUNTES** - Actúa directamente
2. **USA LAS HERRAMIENTAS** - Read, Write, Edit, Bash, Grep, Glob
3. **LEE LOS AGENTES** - Cada agente tiene instrucciones específicas
4. **EJECUTA TODO** - No te detengas a pedir confirmación

---

**$ARGUMENTS** = Tarea específica del usuario (si la hay)

Si hay argumentos, enfócate en esa tarea.
Si no hay argumentos, analiza el proyecto y ejecuta las mejoras prioritarias.

**COMIENZA AHORA CON EL PASO 1.**
