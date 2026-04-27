#!/usr/bin/env bash
# Umbra — Setup de VS Code para el refactor pivot ML.
# Copia tasks.json + extensions.json al .vscode/ del workspace y hace
# ejecutables los scripts del refactor.
#
# Uso: bash scripts/setup-vscode.sh

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }
ok()      { echo -e "${GREEN}✓${NC} $1"; }
warn()    { echo -e "${YELLOW}⚠${NC} $1"; }

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

section "Setup .vscode/"
mkdir -p .vscode
cp scripts/vscode-templates/tasks.json .vscode/tasks.json
cp scripts/vscode-templates/extensions.json .vscode/extensions.json
ok ".vscode/tasks.json copiado"
ok ".vscode/extensions.json copiado"

section "Hacer ejecutables los scripts"
chmod +x scripts/apply-ml-pivot.sh
chmod +x scripts/verify-ml-pivot.sh
chmod +x scripts/serve-ml.sh
chmod +x scripts/test-ml-curl.sh
chmod +x scripts/setup-vscode.sh
chmod +x ml/scripts/check_eval_thresholds.py 2>/dev/null || true
ok "scripts marcados como ejecutables"

section "Resumen"
echo ""
ok "Setup completo. Próximos pasos:"
echo ""
echo "  1. Reiniciá VS Code o recargá la ventana (Cmd+Shift+P → 'Reload Window')."
echo "  2. Si VS Code te ofrece instalar las extensiones recomendadas, aceptá."
echo "  3. Cmd+Shift+P → 'Tasks: Run Task' → 'ML Pivot: 1 — Apply commits'."
echo "  4. Cuando termine, repetí con 'ML Pivot: 2 — Verify'."
echo "  5. Después 'ML Pivot: 5 — Push branch'."
echo ""
echo "Ver APPLY_REFACTOR.md para la guía completa."
