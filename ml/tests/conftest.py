"""Fixtures comunes para tests del módulo ML."""

import sys
from pathlib import Path

# Permitir `from src.x import ...` desde los tests
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
