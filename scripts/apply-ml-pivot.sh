#!/usr/bin/env bash
# Umbra — Aplica el refactor pivot ML como 9 commits granulares.
# Generado por Cowork en sesión nocturna 2026-04-27.
#
# Idempotente hasta cierto punto: aborta si la branch ya existe.
# No hace push automático — eso es task aparte.

set -euo pipefail

# ─── Helpers de output ─────────────────────────────────────────────
BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }
ok()      { echo -e "${GREEN}✓${NC} $1"; }
warn()    { echo -e "${YELLOW}⚠${NC} $1"; }
fail()    { echo -e "${RED}✗${NC} $1"; exit 1; }

# ─── Pre-flight checks ─────────────────────────────────────────────
section "Pre-flight"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
[[ -z "$REPO_ROOT" ]] && fail "No estás dentro de un repo git."
cd "$REPO_ROOT"
ok "Repo: $REPO_ROOT"

if [[ ! -f "COMMIT_PLAN.md" || ! -d "ml" ]]; then
  fail "No encontré COMMIT_PLAN.md ni la carpeta ml/. ¿Es el repo Umbra?"
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
ok "Branch actual: $CURRENT_BRANCH"

if git show-ref --verify --quiet refs/heads/feat/ml-module-pivot; then
  fail "La branch feat/ml-module-pivot ya existe. Borrá con 'git branch -D feat/ml-module-pivot' si querés re-aplicar."
fi

# ─── Stash de cambios uncommitted ──────────────────────────────────
section "Stash de cambios uncommitted previos"

if [[ -n "$(git status --porcelain)" ]]; then
  warn "Hay cambios uncommitted en $CURRENT_BRANCH. Los stash con tag claro."
  git stash push --include-untracked -m "WIP pre ML refactor (auto-stash $(date -u +%FT%TZ))"
  ok "Stash creado. Recuperás con 'git stash pop' después del merge."
else
  ok "Working tree limpio."
fi

# ─── Checkout branch nueva ─────────────────────────────────────────
section "Crear branch feat/ml-module-pivot"

git checkout -b feat/ml-module-pivot main 2>&1 | tail -3 || git checkout -b feat/ml-module-pivot
ok "En branch feat/ml-module-pivot."

# ─── Commit 1 — ADRs alineados ─────────────────────────────────────
section "Commit 1/9 — docs(adr): align ADRs with TFG entregado"
git add docs/DECISIONS.md
git commit -m "docs(adr): align ADRs with TFG entregado (post-pivot ML)

ADR-002 v2: separación medido (Big Five) vs narrativo (Jung,
  Pearson, Positive Computing). Reemplaza la versión del 12/04.
ADR-007 amendado: archetype como etiqueta narrativa, no medición.
ADR-011 SUPERSEDED por ADR-028: H1 deprecada (Big Five lo mide
  el regresor; determinismo deja de ser pregunta).
ADR-012 SUPERSEDED por ADR-023 v2 + ADR-028: OSF descartado.
ADR-014 partially SUPERSEDED por ADR-026: snapshots Claude
  deprecados; reproducibilidad ahora vía DVC + MLflow + métricas
  committeadas.
ADR-020 SUPERSEDED por ADR-026: H2 cross-model rewriters
  deprecada.
ADR-023 amendado: validación primary = métricas Big Five por
  dimensión + H3 + M3.
ADR-026 nuevo: módulo ML propio (DistilBERT congelado + Ridge
  multi-output + FastAPI + MLflow + DVC).
ADR-027 nuevo: política de reporte por dimensión bajo umbral
  R² > 0.20 / r > 0.30.
ADR-028 nuevo: validación primary = métricas estándar de
  regresión por dimensión Big Five (MSE / R² / r de Pearson)."
ok "Commit 1 aplicado."

# ─── Commit 2 — Cleanup OSF ────────────────────────────────────────
section "Commit 2/9 — docs(osf): mark OSF preregistration as deprecated"
git add docs/research/osf/preregistration-standard.md
git commit -m "docs(osf): mark OSF preregistration as deprecated (ADR-012 SUPERSEDED)

El archivo se preserva como nota explicativa del retiro.
La auditabilidad la cubre ahora la cadena DVC + MLflow +
commits del repo público + métricas committeadas en
ml/eval_metrics.json."
ok "Commit 2 aplicado."

# ─── Commit 3 — Estructura del módulo ML ───────────────────────────
section "Commit 3/9 — feat(ml): scaffold módulo ML propio"
git add ml/
git commit -m "feat(ml): scaffold módulo ML propio (ADR-026)

Estructura inicial del componente analítico independiente del
frontend Next.js:

- ml/README.md, requirements.txt, Makefile, Dockerfile, render.yaml
- ml/.gitignore (excluye .venv, mlruns, cache HF)
- ml/dvc.yaml: pipeline reproducible
  prepare_data → baseline_tfidf → train → evaluate
- ml/src/__init__.py + 7 módulos:
    prepare_data.py     unión Essays + rioplatense + splits 80/10/10
    baseline_tfidf.py   Ridge sobre TF-IDF (LOO si n<30)
    extract_embeddings.py  DistilBERT base multilingual cased FROZEN
    train_ridge.py      5 Ridge multi-output + MLflow
    evaluate.py         MSE/R²/r por dimensión × bloque
    predict.py          servicio de inferencia + per_dimension_status
    api_server.py       FastAPI POST /infer
- ml/data/rioplatense/cases.csv (corpus IPIP migrado de
  lib/evals/cases.ts, n=20 con scores Big Five etiquetados)
- ml/data/rioplatense/cases_qualitative.csv (Jung+adversariales,
  inspección cualitativa)
- ml/data/rioplatense/rubrica_validacion.md (5 criterios)
- ml/data/essays/README.md (instrucciones para integrar Essays)
- ml/tests/ (11 tests Python; pytest pasa + 1 skip si no hay
  transformers)
- ml/scripts/check_eval_thresholds.py (verificación CI)

NO incluye: fine-tuning DistilBERT, ONNX, HuggingFace Hub,
PyTorch como motor (ADR-026)."
ok "Commit 3 aplicado."

# ─── Commit 4 — Cliente TS + Pass 1.5 + reemplazo Pass 1 ───────────
section "Commit 4/9 — refactor(analyze): origen Big Five vía módulo ML"
git add lib/ml-client.ts lib/prompts/interpret-narrative.ts \
        lib/prompts/analyze-profile.ts app/api/analyze/route.ts \
        lib/knowledge/jung-functions.ts lib/knowledge/archetypes.ts
git commit -m "refactor(analyze): origen Big Five vía módulo ML, narrativa interpretativa Claude

Reemplaza el Pass 1 monolítico Claude (analyze-profile.ts) por:
1. Pass 1 — inferBigFive() del módulo ML local (lib/ml-client.ts)
2. Pass 1.5 — buildInterpretNarrativePrompt() (Claude, lectura
   interpretativa Jung + arquetipo + razonamiento)
3. Pass 2 — sin cambios (evidence highlights fire-and-forget)

Cambios:
- lib/ml-client.ts NUEVO: cliente HTTP tipado con MlApiUnavailableError
  y MlApiError. ML_API_URL env var. Sin fallback a Claude por defecto.
- lib/prompts/interpret-narrative.ts NUEVO: Pass 1.5 que recibe el
  Big Five inferido + textos del usuario y devuelve Jung + arquetipo +
  razonamiento como lectura interpretativa.
- lib/prompts/analyze-profile.ts: marcado @deprecated. Wrapper que
  arroja error si se invoca.
- app/api/analyze/route.ts: pipeline reescrito con feature flag
  ANALYZE_BIG_FIVE_SOURCE (ml | claude). Default ml.
- lib/knowledge/jung-functions.ts: header actualizado (insumo
  narrativo, ADR-002 v2).
- lib/knowledge/archetypes.ts: header actualizado (etiqueta
  narrativa, ADR-007 amendado). Aclaración Carol Pearson vs
  Karl Pearson.

Esquema de Supabase psychological_profiles no se toca."
ok "Commit 4 aplicado."

# ─── Commit 5 — Eval suite legacy stubs ────────────────────────────
section "Commit 5/9 — refactor(evals): deprecate H1/H2 runners"
git add lib/evals/consistency.ts lib/evals/cross-model-paraphrase.ts \
        scripts/run-h1.ts scripts/run-h2.ts
git commit -m "refactor(evals): deprecate H1/H2 runners (ADR-011 + ADR-020 SUPERSEDED)

H1 y H2 quedaron sin sentido tras el pivot ML: la inferencia Big
Five la hace el regresor entrenado y determinístico por
construcción.

Stubs:
- lib/evals/consistency.ts → runH1() arroja error informativo
- lib/evals/cross-model-paraphrase.ts → runH2() arroja error
- scripts/run-h1.ts → console.log + exit 0 con pointer a make all
- scripts/run-h2.ts → idem

Se conservan los archivos para evitar imports rotos. Cualquier
ejecución redirige a:
  cd ml && make all && cat eval_metrics.json

NO se borra lib/evals/cases.ts: lo sigue usando crisis-eval (H3
mantiene). El subset IPIP del corpus está migrado a
ml/data/rioplatense/cases.csv para entrenamiento."
ok "Commit 5 aplicado."

# ─── Commit 6 — Mover resultados pre-pivot a legacy ────────────────
section "Commit 6/9 — chore(eval-results): mover H1/H2 a legacy/"
mkdir -p eval-results/legacy
moved_any=0
for f in eval-results/H1-*.json eval-results/H2-*.json; do
  if [[ -f "$f" ]]; then
    git mv "$f" "eval-results/legacy/$(basename "$f")"
    moved_any=1
  fi
done
cat > eval-results/legacy/README.md <<'EOF'
# Resultados pre-pivot ML — histórico

Estos archivos son las corridas de H1 (determinismo Claude) y H2
(paráfrasis intra-vendor) anteriores al pivot ML del 27/04/2026.

Se preservan como registro académico del proceso experimental que
motivó el pivot, pero **NO son evidencia primary del TFG entregado**.
La validación primary del componente analítico vive en
`/ml/eval_metrics.json` (ADR-028).

H3 (crisis classifier) sigue siendo evaluación vigente — sus
resultados quedan en `eval-results/` (no en `legacy/`).
EOF
git add eval-results/legacy/README.md
if [[ "$moved_any" -eq 1 || -n "$(git diff --cached --name-only)" ]]; then
  git commit -m "chore(eval-results): mover H1/H2 a legacy/ (pre-pivot ML)

H3 mantiene en eval-results/ (validación vigente del crisis
classifier, ortogonal al pivot ML)."
  ok "Commit 6 aplicado."
else
  warn "No había H1/H2 results — skipeo commit 6."
fi

# ─── Commit 7 — Docs en cascada ────────────────────────────────────
section "Commit 7/9 — docs: alinear docs con pivot ML"
git add docs/PROMPT_ARCHITECTURE.md docs/SYSTEM_SPEC.md \
        docs/API_MAP.md docs/FEATURE_MAP.md \
        docs/features/ANALYSIS.md docs/features/DASHBOARD.md \
        docs/tech/ARCHITECTURE.md docs/tech/EVALS.md \
        docs/biz/TFG.md docs/biz/VALIDATION.md \
        thesis/03-marco-teorico.md thesis/05-metodologia.md \
        UMBRA_MASTER_BUILD.md README.md .env.local.example
git commit -m "docs: alinear docs con pivot ML (banner + correcciones puntuales)

Banner pivot ML al inicio de cada doc clave + correcciones
puntuales en secciones que contradicen el TFG entregado:

- PROMPT_ARCHITECTURE.md: inventario de prompts post-pivot
  (interpret-narrative.ts vigente; analyze-profile.ts deprecated;
  H1/H2 deprecados; validación primary en /ml/).
- SYSTEM_SPEC.md: stack dividido en capa web (Vercel) + capa
  analítica (módulo ML propio en /ml/).
- API_MAP.md: POST /api/analyze ahora usa módulo ML + Pass 1.5.
- FEATURE_MAP.md: feature renombrada a 'Componente analítico
  (módulo ML — Big Five)' + Pass 1.5 narrativo separado.
- features/ANALYSIS.md: pipeline en tres pasos detallado.
- features/DASHBOARD.md: confidence surface lee
  perDimensionStatus de analysis_raw (ADR-027).
- tech/ARCHITECTURE.md: diagrama Mermaid actualizado con
  módulo ML como nodo aparte de Vercel.
- tech/EVALS.md: H1/H2 → DEPRECATED. Validación primary en
  /ml/eval_metrics.json. H3 mantiene.
- biz/TFG.md, biz/VALIDATION.md: estado de experimentos
  reescrito con métricas ML por dimensión como primary.
- thesis/03-marco-teorico.md, thesis/05-metodologia.md: nota
  post-pivot al inicio (drafts locales históricos).
- UMBRA_MASTER_BUILD.md: nota post-pivot — Pass 1 monolítico
  descontinuado.
- README.md: stack reorganizado (capa web + módulo ML).
- .env.local.example: ML_API_URL + ANALYZE_BIG_FIVE_SOURCE."
ok "Commit 7 aplicado."

# ─── Commit 8 — CI workflow ml-validate ────────────────────────────
section "Commit 8/9 — ci(ml): add ml-validate workflow"
git add .github/workflows/ml-validate.yml
git commit -m "ci(ml): add ml-validate workflow (pytest + pipeline + thresholds)

GitHub Actions:
- Trigger: push/PR que toca ml/** o el workflow file.
- Setup Python 3.11 + cache pip.
- Lint imports (sanity) + pytest -v + smoke pipeline
  (prepare_data + baseline_tfidf).
- Verificación de eval_metrics.json contra umbrales por dimensión
  (R² > 0.20 y r > 0.30) en modo lax — no bloquea CI mientras
  Essays no esté integrado.
- Upload de metrics.json + eval_metrics.json + summary.json
  como artifacts.

NO toca el workflow Next.js existente (ci.yml)."
ok "Commit 8 aplicado."

# ─── Commit 9 — COMMIT_PLAN.md + scripts + .vscode templates ───────
section "Commit 9/9 — docs + tooling de la sesión nocturna"
git add COMMIT_PLAN.md APPLY_REFACTOR.md \
        scripts/apply-ml-pivot.sh scripts/verify-ml-pivot.sh \
        scripts/serve-ml.sh scripts/test-ml-curl.sh \
        scripts/setup-vscode.sh \
        scripts/vscode-templates/tasks.json \
        scripts/vscode-templates/extensions.json
# .vscode/ se commitea solo si Mati ya corrió setup-vscode.sh; sino
# queda solo el template y el setup script.
if [[ -d .vscode ]] && [[ -n "$(git status --porcelain .vscode/ 2>/dev/null)" ]]; then
  git add .vscode/tasks.json .vscode/extensions.json 2>/dev/null || true
fi
git commit -m "docs+tooling: COMMIT_PLAN, scripts y VS Code tasks de la sesión nocturna

- COMMIT_PLAN.md: plan ejecutivo del refactor pivot ML.
- APPLY_REFACTOR.md: instrucciones clic-clic desde VS Code.
- scripts/setup-vscode.sh: setup inicial (copia tasks.json a
  .vscode/ y marca scripts ejecutables).
- scripts/apply-ml-pivot.sh: este script (idempotente, 9 commits
  granulares + verificación previa).
- scripts/verify-ml-pivot.sh: typecheck + pytest + pipeline ML.
- scripts/serve-ml.sh: levanta FastAPI en localhost:8000.
- scripts/test-ml-curl.sh: smoke test del endpoint /infer.
- scripts/vscode-templates/: tasks.json y extensions.json para
  VS Code (Python, ESLint, Tailwind, GitHub PR, DVC)."
ok "Commit 9 aplicado."

# ─── Resumen ───────────────────────────────────────────────────────
section "Resumen final"
echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "Commits aplicados:"
git log --oneline main..HEAD
echo ""
ok "Refactor aplicado. Próximo paso:"
echo "  1. Correr 'ML Pivot: 2 - Verify' para validar local."
echo "  2. Si pasa, correr 'ML Pivot: 5 - Push branch' para publicar."
echo "  3. Abrir PR en GitHub y mergear cuando estés tranquilo."
