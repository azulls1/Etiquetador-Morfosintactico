# Your First Project

> **Tipo:** Tutorial
> **Nivel:** Principiante
> **Tiempo:** 20 minutos

## Objetivos

- Crear un proyecto desde cero con NXT
- Usar el sistema de niveles 0-4
- Completar un ciclo completo de desarrollo

## Prerrequisitos

- Completar [Getting Started](./01-getting-started.md)
- Terminal o IDE configurado

## El Proyecto: API de Tareas

Vamos a crear una API REST simple para gestionar tareas (todo list).

### Paso 1: Iniciar con el Orquestador

```
/nxt/orchestrator

> Quiero crear una API REST para gestionar tareas con Node.js y Express
```

### Paso 2: Clasificación Automática

El orquestador analiza y clasifica:

```
📊 Clasificación:
- Nivel: 2 (Estándar)
- Tiempo: 2-4 horas
- Agentes: Architect, API, Database, QA, Docs
- Track: BMad Method (~15 min planificación)
```

### Paso 3: Diseño de Arquitectura

El Architect propone:

```
/api
├── routes/
│   └── tasks.js
├── controllers/
│   └── taskController.js
├── models/
│   └── Task.js
├── middleware/
│   └── errorHandler.js
└── app.js
```

### Paso 4: Implementación

El API Developer crea los endpoints:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/tasks | Listar tareas |
| POST | /api/tasks | Crear tarea |
| PUT | /api/tasks/:id | Actualizar |
| DELETE | /api/tasks/:id | Eliminar |

### Paso 5: Testing

El QA Engineer crea tests:

```javascript
describe('Tasks API', () => {
  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test task' });
    expect(res.status).toBe(201);
  });
});
```

### Paso 6: Documentación

El Tech Writer genera:
- README con instrucciones
- API docs con ejemplos
- Postman collection

## Resultado Final

```
my-todo-api/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── app.js
├── tests/
├── docs/
├── package.json
└── README.md
```

## Próximo Tutorial

→ [Working with Agents](./03-working-with-agents.md)

---

*Tutorial 2 de 4 - Your First Project*
