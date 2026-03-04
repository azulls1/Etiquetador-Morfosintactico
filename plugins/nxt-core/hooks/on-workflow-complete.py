#!/usr/bin/env python3
"""
Hook: on-workflow-complete
==========================
Se ejecuta cuando un workflow completa todos sus pasos.

Tareas:
- Generar resumen de ejecución
- Actualizar estado final
- Notificar completado
"""

import os
import sys
import json
from datetime import datetime


def main():
    """Ejecuta el hook de workflow completado."""
    context_json = os.environ.get("NXT_HOOK_CONTEXT", "{}")
    context = json.loads(context_json)

    task = context.get("task", "unknown")
    total_steps = context.get("total_steps", 0)

    print(f"[HOOK:on-workflow-complete] Workflow finished!")
    print(f"  Task: {task[:50]}..." if len(task) > 50 else f"  Task: {task}")
    print(f"  Steps executed: {total_steps}")
    print(f"  Completed at: {datetime.now().isoformat()}")


if __name__ == "__main__":
    main()
