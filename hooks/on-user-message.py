#!/usr/bin/env python3
"""
Hook: UserPromptSubmit
======================
Este hook se ejecuta AUTOMATICAMENTE cada vez que el usuario envia un mensaje.

Segun la documentacion oficial de Claude Code:
"For UserPromptSubmit and SessionStart hooks, anything you write to stdout
is added to Claude's context."

El output de este hook se INYECTA en el contexto de Claude, NO es solo feedback.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime


def get_project_root() -> Path:
    """Obtiene la raiz del proyecto."""
    return Path.cwd()


def load_state(root: Path) -> dict:
    """Carga el estado actual del proyecto."""
    state_file = root / ".nxt" / "state.json"
    if state_file.exists():
        try:
            return json.loads(state_file.read_text(encoding="utf-8"))
        except:
            return {}
    return {}


def get_persistence_context(root: Path) -> str:
    """
    Genera el contexto de persistencia que Claude vera.
    """
    state = load_state(root)

    context = f"""
================================================================================
RECORDATORIO AUTOMATICO: AGENTES DE PERSISTENCIA (REGLA #4)
================================================================================

Segun CLAUDE.md REGLA #4, en CADA interaccion DEBES:

PASO 0 (ANTES de procesar la tarea):
  1. Verificar .nxt/state.json - contexto previo
  2. Cargar decisiones y patrones de agentes/nxt-context.md
  3. Verificar checkpoints en agentes/nxt-multicontext.md

PASO FINAL (DESPUES de completar la tarea):
  1. Actualizar .nxt/state.json con nuevo contexto
  2. Documentar cambios significativos (agentes/nxt-changelog.md)
  3. Crear checkpoint si hubo cambios importantes (agentes/nxt-multicontext.md)

AGENTES DE PERSISTENCIA ACTIVOS:
  - nxt-context: Contexto entre sesiones
  - nxt-multicontext: Checkpoints y recovery
  - nxt-changelog: Documentacion automatica
  - nxt-ralph: Desarrollo autonomo iterativo

ESTADO ACTUAL DEL PROYECTO:
  - Version: {state.get('framework_version', 'unknown')}
  - Fase: {state.get('current_phase', 'unknown')}
  - Tareas pendientes: {len(state.get('pending_tasks', []))}
  - Tareas completadas: {len(state.get('completed_tasks', []))}

================================================================================
"""
    return context


def log_hook_execution(root: Path):
    """Registra la ejecucion del hook."""
    log_file = root / ".nxt" / "hook-executions.log"
    log_file.parent.mkdir(parents=True, exist_ok=True)

    log_entry = f"{datetime.now().isoformat()} - UserPromptSubmit hook executed\n"

    with open(log_file, "a", encoding="utf-8") as f:
        f.write(log_entry)


def main():
    """
    Punto de entrada del hook.

    El output se inyecta AUTOMATICAMENTE en el contexto de Claude
    segun la documentacion oficial de Claude Code.
    """
    root = get_project_root()

    # Registrar ejecucion
    try:
        log_hook_execution(root)
    except:
        pass

    # Generar contexto
    context = get_persistence_context(root)

    # Opcion 1: Output como JSON con additionalContext (formato recomendado)
    output = {
        "additionalContext": context
    }

    # Imprimir JSON - Claude lo vera como contexto adicional
    print(json.dumps(output, ensure_ascii=False))

    return 0


if __name__ == "__main__":
    sys.exit(main())
