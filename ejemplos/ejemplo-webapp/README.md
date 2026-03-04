# Ejemplo: Web Application

Este ejemplo muestra como usar NXT AI Development para desarrollar una aplicacion web completa.

## Escenario

Crear una aplicacion web de gestion de tareas (Todo App) con:
- Autenticacion de usuarios
- CRUD de tareas
- Categorias y etiquetas
- Dashboard con estadisticas

## Flujo de Trabajo

### 1. Inicializar Proyecto

```
/nxt/orchestrator
```

El orquestador mostrara el mensaje de bienvenida y detectara que es un proyecto greenfield.

### 2. Fase Descubrir

```
/nxt/analyst
*brainstorm todo app con features avanzados
```

El analista generara:
- `docs/1-analysis/project-brief.md`
- `docs/1-analysis/user-personas.md`

### 3. Fase Definir

```
/nxt/pm
*create-prd
```

El PM generara:
- `docs/2-planning/prd.md`
- `docs/2-planning/stories/`

### 4. Fase Disenar

```
/nxt/architect
*architecture
```

El arquitecto generara:
- `docs/3-solutioning/architecture.md`
- `docs/diagrams/c4-context.svg`
- `docs/diagrams/c4-container.svg`

### 5. Fase Planificar

```
/nxt/pm
*create-epics
*create-story US-001
*story-context US-001
```

### 6. Fase Construir

```
/nxt/dev
*dev-story US-001
```

El desarrollador:
1. Lee el story context
2. Implementa el codigo
3. Escribe tests
4. Hace commit

### 7. Fase Verificar

```
/nxt/qa
*qa-validate US-001
```

## Estructura Final del Proyecto

```
todo-app/
├── .nxt/                    # Framework config
├── docs/
│   ├── 1-analysis/
│   │   ├── project-brief.md
│   │   └── user-personas.md
│   ├── 2-planning/
│   │   ├── prd.md
│   │   ├── backlog.md
│   │   └── stories/
│   ├── 3-solutioning/
│   │   ├── architecture.md
│   │   └── tech-specs/
│   └── 4-implementation/
│       ├── contexts/
│       └── qa/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
├── tests/
└── package.json
```

## Tech Stack Sugerido

| Capa | Tecnologia |
|------|------------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT |

## Comandos Utiles

```bash
# Buscar documentacion actual
python herramientas/gemini_tools.py search "react 19 new features"

# Generar logo
python herramientas/gemini_tools.py image "logo para todo app minimalista" logo.png

# Verificar dependencias
python herramientas/llm_router.py route "que libreria usar para charts en react"
```

## Resultado Esperado

Al completar el ejemplo, tendras:
- Documentacion completa del proyecto
- Arquitectura bien definida
- Stories con contexts listos
- Codigo de calidad con tests
- QA validado

---

*Ejemplo generado con NXT AI Development*
