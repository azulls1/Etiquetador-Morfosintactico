#!/usr/bin/env python3
"""
Hook: on-step-complete
======================
Se ejecuta cuando un paso del workflow se completa.

Tareas:
- Registrar artefactos producidos
- Actualizar métricas
- Notificar progreso
"""

import os
import sys
import json
from datetime import datetime


def main():
    """Ejecuta el hook de paso completado."""
    context_json = os.environ.get("NXT_HOOK_CONTEXT", "{}")
    context = json.loads(context_json)

    step = context.get("step", "unknown")
    artifacts = context.get("artifacts", {})

    print(f"[HOOK:on-step-complete] Step completed: {step}")
    if artifacts:
        print(f"  Artifacts: {len(artifacts)} items")
    print(f"  Time: {datetime.now().isoformat()}")


if __name__ == "__main__":
    main()
