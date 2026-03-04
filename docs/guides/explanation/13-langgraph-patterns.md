# LangGraph Patterns Explained

> **Tipo:** Explanation
> **Nivel:** Avanzado

## ¿Qué es LangGraph?

LangGraph es un patrón de orquestación que modela workflows como **grafos dirigidos**
donde los nodos son agentes y las aristas son transiciones.

## Por Qué Grafos

### Enfoque Tradicional (Lineal)
```
A → B → C → D
```
Problemas: No puede manejar bifurcaciones, loops, o ejecución condicional.

### Enfoque LangGraph
```
    ┌───► B ───┐
A ──┤          ├──► D
    └───► C ───┘
```
Ventajas: Paralelización, decisiones dinámicas, retry selectivo.

## El Grafo de Orquestación NXT

```
[INICIO]
    │
    ▼
[INTAKE] ── Clasificar nivel 0-4
    │
    ▼
[DECISION] ─────────────────────────────────┐
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
[NIV 0]   [NIV 1]   [NIV 2]   [NIV 3]   [NIV 4]
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
 [DEV]    [DEV+QA]  [DESIGN]  [FULL]   [MULTI]
    │         │         │         │         │
    └─────────┴─────────┴─────────┴─────────┘
                        │
                        ▼
                    [REVIEW]
                        │
                        ▼
                   [DELIVERY]
```

## Componentes Clave

### 1. Estado (State)
```python
class OrchestratorState(TypedDict):
    user_request: str
    classification: dict
    current_phase: str
    agent_results: List[dict]
    final_output: str
```

### 2. Nodos
```python
def intake_node(state):
    # Analiza y clasifica
    return {**state, "classification": ...}

def execution_node(state):
    # Ejecuta agentes
    return {**state, "agent_results": ...}
```

### 3. Edges (Transiciones)
```python
workflow.add_edge("intake", "planning")
workflow.add_conditional_edges(
    "review",
    route_after_review,
    {"delivery": "delivery", "retry": "execution"}
)
```

### 4. Checkpointer (Memoria)
```python
memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)
```

## Patrones Comunes

### Fan-Out (Paralelización)
```
     ┌──► Agent A ──┐
IN ──┼──► Agent B ──┼──► Merge
     └──► Agent C ──┘
```

### Retry Loop
```
Execute ──► Review ──► ¿OK? ──► Deliver
              │          │
              │          No
              │          │
              └──────────┘
```

### Human-in-the-Loop
```
Classify ──► ¿Nivel 4? ──► PAUSE (Aprobación humana)
                │                    │
               No                  Aprobado
                │                    │
                ▼                    ▼
            Continue            Continue
```

---

*Explanation - LangGraph Patterns*
