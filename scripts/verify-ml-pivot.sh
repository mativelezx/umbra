#!/usr/bin/env bash
# Umbra — Verifica el refactor pivot ML.
# Corre: typecheck TS + setup venv + pytest + pipeline ML + check_thresholds.

set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }
ok()      { echo -e "${GREEN}✓${NC} $1"; }
warn()    { echo -e "${YELLOW}⚠${NC} $1"; }
fail()    { echo -e "${RED}✗${NC} $1"; exit 1; }

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
[[ -z "$REPO_ROOT" ]] && fail "No estás dentro de un repo git."
cd "$REPO_ROOT"

# ─── 1. Typecheck TS ───────────────────────────────────────────────
section "1. Typecheck TS"
if [[ ! -d "node_modules" ]]; then
  warn "node_modules no existe. Corriendo npm install..."
  npm install
fi
npx tsc -p tsconfig.typecheck.json --noEmit
ok "TS typecheck OK"

# ─── 2. Setup venv del módulo ML ───────────────────────────────────
section "2. Setup venv del módulo ML"
cd ml
if [[ ! -d ".venv" ]]; then
  warn "Creando virtualenv..."
  python3 -m venv .venv
fi
# shellcheck source=/dev/null
source .venv/bin/activate
ok "venv activado: $(which python)"

if ! python -c "import sklearn, fastapi, pytest" 2>/dev/null; then
  warn "Instalando deps Python (puede tardar 5-10 min la primera vez)..."
  pip install --upgrade pip
  pip install -r requirements.txt
fi
ok "Deps Python instaladas"

# ─── 3. pytest ─────────────────────────────────────────────────────
section "3. pytest del módulo ML"
pytest -v --tb=short -p no:cacheprovider
ok "pytest pasó"

# ─── 4. Pipeline ML reproducible ───────────────────────────────────
section "4. Pipeline ML reproducible"
python -m src.prepare_data
ok "prepare_data OK"
python -m src.baseline_tfidf
ok "baseline_tfidf OK"
python -m src.evaluate
ok "evaluate OK"

# ─── 5. Verificación de umbrales (modo lax) ────────────────────────
section "5. Verificación de umbrales (modo lax)"
python scripts/check_eval_thresholds.py
ok "check_thresholds OK"

# ─── 6. Quick QA ───────────────────────────────────────────────────
section "6. Quick QA del refactor"
cd "$REPO_ROOT"
echo "console.log en archivos del refactor:"
if grep -nE "console\.log" lib/ml-client.ts lib/prompts/interpret-narrative.ts \
   lib/prompts/analyze-profile.ts app/api/analyze/route.ts 2>/dev/null; then
  warn "console.log detectado — revisar"
else
  ok "ninguno"
fi
echo "': any' en archivos del refactor:"
if grep -nE ": any\b" lib/ml-client.ts lib/prompts/interpret-narrative.ts \
   lib/prompts/analyze-profile.ts app/api/analyze/route.ts 2>/dev/null; then
  warn "': any' detectado — tipar mejor"
else
  ok "ninguno"
fi

# ─── Resumen ───────────────────────────────────────────────────────
section "Resumen final"
ok "Verificación completa. Métricas en:"
echo "  - ml/metrics.json"
echo "  - ml/eval_metrics.json"
echo "  - ml/data/splits/summary.json"
echo ""
echo "Para servir el FastAPI: 'ML Pivot: 3 - Serve FastAPI' (background)"
echo "Para smoke test del endpoint: 'ML Pivot: 4 - Smoke test API'"
