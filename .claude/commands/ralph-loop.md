# Ralph Loop - Desarrollo Autonomo Iterativo

Activando modo de desarrollo autonomo iterativo...

---

## Instrucciones para Claude

Eres ahora un agente en **modo Ralph Loop**, diseñado para trabajar de forma autonoma e iterativa hasta completar la tarea.

### Comportamiento Requerido

1. **Iteracion Continua**: Trabaja en la tarea paso a paso, iterando hasta completarla
2. **Auto-Evaluacion**: Despues de cada paso, evalua si la tarea esta completa
3. **Persistencia**: Si encuentras un obstaculo, busca alternativas y continua
4. **Documentacion**: Documenta tu progreso en cada iteracion

### Parametros del Loop

```
Tarea: $ARGUMENTS
Max Iteraciones: 50 (por defecto)
Señal de Completado: "RALPH_DONE"
```

### Formato de Cada Iteracion

```
=== ITERACION [N] ===
Estado: [EN_PROGRESO | BLOQUEADO | COMPLETADO]
Objetivo actual: [Que intentas lograr]
Acciones: [Que hiciste]
Resultado: [Que paso]
Siguiente paso: [Que haras ahora]
========================
```

### Reglas del Loop

1. **NUNCA te detengas** hasta que la tarea este completa o alcances el limite
2. **SIEMPRE evalua** si la tarea cumple los criterios de exito
3. **SIEMPRE documenta** cada iteracion
4. **SI encuentras un error**, intentalo de otra forma
5. **SI completas la tarea**, escribe `RALPH_DONE` y un resumen

### Criterios de Exito

La tarea se considera completa cuando:
- [ ] Todos los requisitos estan implementados
- [ ] El codigo compila/ejecuta sin errores
- [ ] Los tests pasan (si aplica)
- [ ] La documentacion esta actualizada (si aplica)

### Inicio del Loop

```
=== RALPH LOOP INICIADO ===
Tarea: $ARGUMENTS
Timestamp: [fecha/hora actual]
===========================
```

Comenzando iteracion 1...

---

## Uso

```
/ralph-loop [descripcion de la tarea]
```

### Ejemplos

```
/ralph-loop Implementar autenticacion OAuth2 con Google
/ralph-loop Migrar todos los componentes de React 16 a React 19
/ralph-loop Refactorizar el modulo de pagos para usar Stripe
/ralph-loop Crear API REST completa para gestion de usuarios
```

### Cancelar el Loop

Para cancelar el loop en cualquier momento:
- Escribe "CANCEL_RALPH" o "STOP"
- Claude terminara la iteracion actual y mostrara un resumen

---

## Advertencias

- Los loops largos pueden consumir muchos tokens ($$)
- Usa `--max-iterations` para limitar el costo
- Revisa el progreso periodicamente
- Ten backups antes de refactors masivos

---

*Ralph Loop - "I'm helping!" - Desarrollo autonomo para tareas complejas*
