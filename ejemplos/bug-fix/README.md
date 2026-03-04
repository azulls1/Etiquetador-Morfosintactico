# Ejemplo: Bug Fix

> **Escala:** Bug Fix (< 1 hora)
> **Agentes involucrados:** nxt-dev, nxt-qa
> **Tiempo total:** ~15 minutos

---

## Escenario

Un usuario reporta que el boton de "Enviar" en el formulario de contacto no funciona en Safari.

## Paso 1: Solicitud Inicial

El usuario escribe en Claude Code:

```
El boton de enviar del formulario de contacto no funciona en Safari.
Los usuarios reportan que al hacer click no pasa nada.
```

## Paso 2: Activar Orquestador

```
/nxt/orchestrator
```

**Respuesta del orquestador:**

```
## Clasificacion de Tarea

**Escala detectada:** Bug Fix
**Razon:** Correccion de error especifico en navegador
**Agentes asignados:** nxt-dev, nxt-qa

### Plan de Ejecucion
1. [DEV] Investigar y corregir el bug
2. [QA] Validar fix en Safari y otros navegadores

Procediendo con nxt-dev...
```

## Paso 3: Investigacion (nxt-dev)

El agente dev investiga el codigo:

```typescript
// Archivo: src/components/ContactForm.tsx
// Linea 45: El problema identificado

const handleSubmit = (e) => {
  e.preventDefault();  // OK
  submitForm(formData); // Falta await!
}
```

**Diagnostico:**
- Safari maneja diferente las promesas no awaited en event handlers
- La funcion `submitForm` es async pero no se esta esperando

## Paso 4: Solucion Propuesta

```typescript
// ANTES (buggy)
const handleSubmit = (e) => {
  e.preventDefault();
  submitForm(formData);
}

// DESPUES (fixed)
const handleSubmit = async (e) => {
  e.preventDefault();
  await submitForm(formData);
}
```

## Paso 5: Validacion (nxt-qa)

```
/nxt/qa
```

**Checklist de QA:**

- [x] Fix funciona en Safari 17
- [x] Fix funciona en Chrome
- [x] Fix funciona en Firefox
- [x] No hay regresiones en otros formularios
- [x] Tests unitarios pasan
- [x] Tests e2e pasan

## Paso 6: Commit

```bash
git add src/components/ContactForm.tsx
git commit -m "fix: Agregar await a submitForm en ContactForm

El boton de enviar no funcionaba en Safari porque
la promesa no estaba siendo awaited correctamente.

Fixes #123"
```

## Resultado Final

| Metrica | Valor |
|---------|-------|
| Tiempo total | 12 minutos |
| Archivos modificados | 1 |
| Lineas cambiadas | 2 |
| Tests ejecutados | 45 |
| Bugs introducidos | 0 |

---

## Comandos Usados

```
/nxt/orchestrator    # Clasifico como bug_fix
/nxt/dev             # Investigo y arreglo
/nxt/qa              # Valido el fix
```

## Aprendizajes

1. **Safari es especial** - Siempre testear en Safari antes de deploy
2. **Async/await importa** - Las promesas no awaited pueden fallar silenciosamente
3. **Bug fix es rapido** - Con el framework, un bug simple se resuelve en minutos

---

*Ejemplo generado con NXT AI Development v3.6.0*
