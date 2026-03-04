"""Configuracion compartida para tests del backend."""

import sys
from pathlib import Path

# Agregar backend al path para imports
sys.path.insert(0, str(Path(__file__).parent.parent))
