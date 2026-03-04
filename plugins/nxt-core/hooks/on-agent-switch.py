#!/usr/bin/env python3
"""
Hook: on-agent-switch
=====================
Se ejecuta cuando se cambia de un agente a otro.

Tareas:
- Guardar contexto del agente anterior
- Preparar contexto para el nuevo agente
- Notificar cambio
"""

import os
import sys
import json
from datetime import datetime


def main():
    """Ejecuta el hook de cambio de agente."""
    context_json = os.environ.get("NXT_HOOK_CONTEXT", "{}")
    context = json.loads(context_json)

    agent = context.get("agent", "unknown")
    task = context.get("task", "")

    print(f"[HOOK:on-agent-switch] Switching to: {agent}")
    print(f"  Task: {task[:50]}..." if len(task) > 50 else f"  Task: {task}")
    print(f"  Time: {datetime.now().isoformat()}")


if __name__ == "__main__":
    main()
