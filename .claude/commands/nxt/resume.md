# RECUPERAR DESDE CHECKPOINT - EJECUCIÓN DIRECTA

**INSTRUCCIÓN:** Recupera el estado desde el último checkpoint.

## PASO 1: Buscar checkpoints
Usa Glob para buscar: `.nxt/checkpoints/checkpoint_*.json`

## PASO 2: Leer último checkpoint
Lee el archivo más reciente con la herramienta Read.

## PASO 3: Restaurar contexto
Muestra el estado guardado y continúa desde `next_step`.

**NO PREGUNTES. LEE EL CHECKPOINT Y CONTINÚA.**
