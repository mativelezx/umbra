#!/usr/bin/env bash
# Umbra — Levanta FastAPI del módulo ML en localhost:8000.
# Asume venv ya creado (corré primero verify-ml-pivot.sh).

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT/ml"

if [[ ! -d ".venv" ]]; then
  echo "✗ venv no existe. Correr 'ML Pivot: 2 - Verify' primero."
  exit 1
fi

# shellcheck source=/dev/null
source .venv/bin/activate

echo "━━━ Umbra ML API ━━━"
echo "Servicio en: http://localhost:8000"
echo "Health:      http://localhost:8000/health"
echo "Version:     http://localhost:8000/version"
echo "Docs:        http://localhost:8000/docs"
echo ""
echo "Logs en tiempo real abajo. Cmd+C para detener."
echo ""

uvicorn src.api_server:app --host 0.0.0.0 --port 8000 --reload
