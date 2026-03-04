# Ejemplos de NXT AI Development

> Casos de uso reales mostrando el framework en accion

---

## Ejemplos Disponibles

### Por Escala

| Ejemplo | Escala | Tiempo | Agentes | Descripcion |
|---------|--------|--------|---------|-------------|
| [bug-fix/](./bug-fix/) | Bug Fix | ~15 min | dev, qa | Corregir boton que no funciona en Safari |
| [feature-auth/](./feature-auth/) | Feature | ~4 hrs | full team | Agregar login con Google |

---

## Como Usar los Ejemplos

### 1. Leer el README del ejemplo

Cada ejemplo tiene un `README.md` con:
- Escenario inicial
- Comandos usados paso a paso
- Output de cada agente
- Codigo resultante
- Metricas finales

### 2. Replicar en tu proyecto

Puedes seguir los pasos del ejemplo adaptandolos a tu caso:

```bash
# 1. Iniciar orquestador
/nxt/orchestrator

# 2. Describir tu tarea
"Quiero agregar [tu feature]"

# 3. Seguir las recomendaciones del orquestador
```

### 3. Comparar resultados

Usa los ejemplos como referencia para:
- Estimar tiempos
- Ver que agentes se involucran
- Entender el workflow

---

## Estructura de un Ejemplo

```
ejemplo-nombre/
├── README.md           # Narrativa paso a paso
├── 1-solicitud.md      # Request inicial del usuario
├── 2-analisis.md       # Output del analyst (si aplica)
├── 3-definicion.md     # User story del PM (si aplica)
├── 4-arquitectura.md   # Decision del architect (si aplica)
├── 5-codigo/           # Codigo generado
│   ├── backend/
│   └── frontend/
├── 6-tests/            # Tests creados
└── 7-resultado.md      # Resumen final
```

---

## Escalas de Referencia

### Bug Fix (< 1 hora)
- **Agentes:** dev, qa
- **Workflow:** `dev -> qa -> end`
- **Documentacion:** Minima (commit message)
- **Ejemplo:** Typo, CSS fix, error obvio

### Feature (1-8 horas)
- **Agentes:** analyst, dev, qa, docs
- **Workflow:** `analyst -> dev -> qa -> docs -> end`
- **Documentacion:** User story + tests
- **Ejemplo:** Nuevo boton, integracion simple

### Epic (8-40 horas)
- **Agentes:** Full team
- **Workflow:** Grafo completo con paralelos
- **Documentacion:** PRD + Architecture + Stories
- **Ejemplo:** Sistema de auth, nuevo modulo

### Enterprise (40+ horas)
- **Agentes:** Multi-team
- **Workflow:** Multiples sprints
- **Documentacion:** Completa + ADRs
- **Ejemplo:** Migracion, nueva plataforma

---

## Crear tu Propio Ejemplo

Si quieres documentar un caso de uso:

```bash
# 1. Crear carpeta
mkdir ejemplos/mi-ejemplo

# 2. Copiar plantilla
cp ejemplos/bug-fix/README.md ejemplos/mi-ejemplo/

# 3. Documentar tu proceso
# Editar el README mientras trabajas
```

---

## Tips para Seguir los Ejemplos

1. **Lee primero** - Entiende el flujo completo antes de replicar
2. **Adapta** - Los ejemplos son guias, no recetas rigidas
3. **Experimenta** - Prueba comandos diferentes
4. **Documenta** - Tu propio ejemplo puede ayudar a otros

---

*Ejemplos creados con NXT AI Development v3.6.0*
