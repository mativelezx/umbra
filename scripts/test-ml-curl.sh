#!/usr/bin/env bash
# Umbra — Smoke test del endpoint /infer del módulo ML.
# Asume FastAPI corriendo en localhost:8000.

set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }
ok()      { echo -e "${GREEN}✓${NC} $1"; }
fail()    { echo -e "${RED}✗${NC} $1"; exit 1; }

URL="${ML_API_URL:-http://localhost:8000}"

section "1. /health"
curl -sf "$URL/health" | python3 -m json.tool || fail "Health check falló — ¿está corriendo el FastAPI?"
ok "/health OK"

section "2. /version"
curl -sf "$URL/version" | python3 -m json.tool || fail "/version falló"
ok "/version OK"

section "3. POST /infer (texto de prueba en voseo)"
TEXT="Soy una persona bastante curiosa. Me la paso pensando en cosas raras y conectando ideas que a primera vista no parecen tener nada que ver. Cuando algo me interesa, me meto a fondo y disfruto el rato pensando."
curl -sf -X POST "$URL/infer" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\"}" | python3 -m json.tool || fail "/infer falló"
ok "/infer devolvió JSON válido"

section "Resumen"
ok "Smoke test completo. Si ves un JSON con 'big_five' + 'per_dimension_status', el módulo ML funciona end-to-end."
