# COMMIT_PLAN.md — Refactor pivot ML del repo Umbra

> **Fecha**: 2026-04-27.
> **Sesión**: nocturna autorizada.
> **Branch propuesta**: `feat/ml-module-pivot`.
> **Origen del cambio**: alinear código con TFG entregado (TP1) — pivot
> ML aprobado por Mainero el 16/04/2026.

Cowork no puede tocar `.git/` ni borrar archivos del working tree.
Por eso este plan: lista exacta de commits, `git rm`, `git mv` y
verificaciones que Mati debe correr desde su terminal cuando se
levante. Todo el código y los docs ya están escritos en el árbol.

---

## 0. Pre-requisito

Tenés cambios uncommitted previos (chat, consent, middleware,
package.json sans next-intl, tsconfig typecheck split). Decidí NO
tocarlos. Para empezar limpio:

```bash
cd ~/Desktop/Umbra
git status                                     # confirmá lo uncommitted
git stash push --include-untracked -m "WIP pre ML refactor (chat + consent + middleware)"
git checkout -b feat/ml-module-pivot main
git status                                     # debe estar limpio
```

Cuando termines de mergear el refactor ML, podés `git stash pop` desde
main para volver a tus cambios pendientes y trabajarlos por separado.

---

## 1. Verificación previa (ya corrida en la sesión)

Status de validación generada en sandbox:

| Check | Estado | Notas |
|---|---|---|
| `cd ml && pytest` | ✅ 11 pasan + 1 skip (DistilBERT no instalado en sandbox) | Tests Python OK |
| `cd ml && python -m src.prepare_data` | ✅ corre | splits 16/2/2 (rioplatense solo) |
| `cd ml && python -m src.baseline_tfidf` | ✅ corre | LOO sobre n=20, métricas committeables |
| `cd ml && python -m src.evaluate` | ✅ corre | `eval_metrics.json` generado con bloque LOO |
| `cd ml && python scripts/check_eval_thresholds.py` | ✅ pasa modo lax | esperable mientras Essays no se integre |
| `npx tsc -p tsconfig.typecheck.json --noEmit` | ✅ exit 0 | TS limpio |
| `grep console.log lib/ml-client.ts ...` | ✅ ninguno | en archivos del refactor |
| `grep ": any" lib/ml-client.ts ...` | ✅ ninguno | en archivos del refactor |

---

## 2. Commits granulares — secuencia exacta

### Commit 1 — ADRs alineados con TFG

```bash
git add docs/DECISIONS.md
git commit -m "docs(adr): align ADRs with TFG entregado (post-pivot ML)

ADR-002 v2: separación medido (Big Five) vs narrativo (Jung,
  Pearson, Positive Computing). Reemplaza la versión del 12/04.
ADR-007 amendado: archetype como etiqueta narrativa, no medición.
ADR-011 SUPERSEDED por ADR-028: H1 deprecada (Big Five lo mide
  el regresor, determinismo deja de ser pregunta).
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
  regresión por dimensión Big Five (MSE / R² / r de Pearson).

Justificación: el TFG entregado el 26/04/2026 cita ADR-002,
ADR-013, ADR-021, ADR-024 y describe un módulo ML propio bajo
prácticas MLOps. La versión vieja del ADR-002 declaraba a Jung
como dimensión primaria inferida — opuesto al TFG. Este commit
cierra esa brecha como ancla doctrinal del refactor."
```

### Commit 2 — Cleanup OSF + nota deprecada

```bash
git add docs/research/osf/preregistration-standard.md
git commit -m "docs(osf): mark OSF preregistration as deprecated (ADR-012 SUPERSEDED)

El archivo se preserva como nota explicativa del retiro.
La auditabilidad la cubre ahora la cadena DVC + MLflow +
commits del repo público + métricas committeadas en
ml/eval_metrics.json."

# Si preferís borrarlo del repo en vez de dejar la nota:
# git rm docs/research/osf/preregistration-standard.md
# git commit -m "docs(osf): remove deprecated OSF preregistration (ADR-012 SUPERSEDED)"
```

### Commit 3 — Estructura del módulo ML propio

```bash
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
PyTorch como motor (ADR-026).

Resultado validable: cd ml && make all && cat eval_metrics.json"
```

### Commit 4 — Cliente TS + Pass 1.5 narrativo + reemplazo Pass 1

```bash
git add lib/ml-client.ts lib/prompts/interpret-narrative.ts \
        lib/prompts/analyze-profile.ts app/api/analyze/route.ts \
        lib/knowledge/jung-functions.ts lib/knowledge/archetypes.ts \
        types/index.ts
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
  razonamiento como lectura interpretativa (no medición). Encuadre
  explícito en el prompt + en el reasoning final.
- lib/prompts/analyze-profile.ts: marcado @deprecated. Wrapper que
  arroja error si se invoca. Conservado para evitar imports rotos.
- app/api/analyze/route.ts: pipeline reescrito con feature flag
  ANALYZE_BIG_FIVE_SOURCE (ml | claude). Default ml. Modo claude solo
  para contingencia operativa breve (re-abre la brecha del pivot).
  analysis_raw ahora incluye bigFiveSource + mlModelVersion +
  perDimensionStatus para auditoría.
- lib/knowledge/jung-functions.ts: header actualizado — insumo
  narrativo, no taxonomía de medición (ADR-002 v2).
- lib/knowledge/archetypes.ts: header actualizado — etiqueta
  narrativa derivada del Big Five medido (ADR-007 amendado).
  Aclaración explícita Carol Pearson (arquetipos) vs Karl Pearson
  (estadístico r), evitando ambigüedad defensivamente sensible.

Backward compat: tipos en types/index.ts no cambian
(BigFive, JungFunctions, Archetype, AnalyzeResponse intactos).
Esquema de Supabase psychological_profiles no se toca."
```

### Commit 5 — Eval suite legacy: stubs deprecated

```bash
git add lib/evals/consistency.ts lib/evals/cross-model-paraphrase.ts \
        scripts/run-h1.ts scripts/run-h2.ts
git commit -m "refactor(evals): deprecate H1/H2 runners (ADR-011 + ADR-020 SUPERSEDED)

H1 (determinismo Pass 1 Claude) y H2 (paráfrasis intra-vendor)
quedaron sin sentido tras el pivot ML: la inferencia Big Five la
hace el regresor entrenado y determinístico por construcción.

Stubs:
- lib/evals/consistency.ts → runH1() arroja error informativo
- lib/evals/cross-model-paraphrase.ts → runH2() arroja error
- scripts/run-h1.ts → console.log + exit 0 con pointer a make all
- scripts/run-h2.ts → idem

Se conservan los archivos para evitar imports rotos en código
residual. Cualquier ejecución redirige a:
  cd ml && make all && cat eval_metrics.json

NO se borra lib/evals/cases.ts: lo sigue usando crisis-eval (H3
mantiene). El subset IPIP del corpus está migrado a
ml/data/rioplatense/cases.csv para entrenamiento."
```

### Commit 6 — Mover resultados pre-pivot a legacy

```bash
mkdir -p eval-results/legacy
git mv eval-results/H1-*.json eval-results/legacy/ 2>/dev/null || true
git mv eval-results/H2-*.json eval-results/legacy/ 2>/dev/null || true
# H3 mantiene en eval-results/ (vigente, ortogonal al pivot)
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
git commit -m "chore(eval-results): mover H1/H2 a legacy/ (pre-pivot ML)

H3 mantiene en eval-results/ (validación vigente del crisis
classifier, ortogonal al pivot ML)."
```

### Commit 7 — Docs alineados con pivot ML

```bash
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
- API_MAP.md: POST /api/analyze ahora usa módulo ML + Pass 1.5;
  errores 503 ai_unavailable cubren ML caído + Claude caído.
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
- README.md: stack reorganizado (capa web + módulo ML); descripción
  del pipeline en tres pasos.
- .env.local.example: ML_API_URL + ANALYZE_BIG_FIVE_SOURCE."
```

### Commit 8 — CI workflow ml-validate

```bash
git add .github/workflows/ml-validate.yml
git commit -m "ci(ml): add ml-validate workflow (pytest + pipeline + thresholds)

GitHub Actions:
- Trigger: push/PR que toca ml/** o el workflow file.
- Setup Python 3.11 + cache pip.
- Lint imports (sanity) + pytest -v + smoke pipeline
  (prepare_data + baseline_tfidf).
- Verificación de eval_metrics.json contra umbrales por dimensión
  (R² > 0.20 y r > 0.30) en modo lax — no bloquea CI mientras
  Essays no esté integrado. Cuando Essays se integre, cambiar a
  --strict en check_eval_thresholds.py.
- Upload de metrics.json + eval_metrics.json + summary.json
  como artifacts.

NO toca el workflow Next.js existente (ci.yml)."
```

### Commit 9 — Este archivo (COMMIT_PLAN.md)

```bash
git add COMMIT_PLAN.md
git commit -m "docs: COMMIT_PLAN.md de la sesión nocturna del pivot ML

Plan ejecutivo de la sesión nocturna del 27/04/2026: secuencia de
commits, validaciones corridas, lo que falta para Mati."
```

---

## 3. Push de la branch (NO merge automático)

```bash
git push -u origin feat/ml-module-pivot
```

Después abrí el PR en GitHub manualmente o vía gh CLI:

```bash
gh pr create \
  --base main \
  --head feat/ml-module-pivot \
  --title "feat: refactor pivot ML — alinear código con TFG entregado" \
  --body "$(cat COMMIT_PLAN.md)" \
  --draft
```

PR en draft para que vos decidas el merge tras revisar.

---

## 4. Lo que el sandbox no pudo hacer (queda para vos)

### 4.1 Tests TS legacy van a fallar
`lib/evals/consistency.ts` y `lib/evals/cross-model-paraphrase.ts`
ahora son stubs que arrojan error. Cualquier test de Vitest que los
invoque va a romper. Acciones posibles:

- (a) Borrar/skipear los tests legacy:
  ```bash
  # listar tests TS que tocan H1/H2
  grep -rE "consistency|cross-model-paraphrase|run-h1|run-h2" \
    --include="*.test.ts" lib/ tests/ e2e/ 2>/dev/null
  # Marcarlos con `.skip` o borrarlos
  ```

- (b) Hacer assertion al error explícito (que la deprecation se
  comporte como deprecation):
  ```ts
  it('runH1 deprecated post pivot ML', async () => {
    await expect(runH1({})).rejects.toThrow(/descontinuado/);
  });
  ```

Recomiendo (b) para mantener la disciplina del eslint y dejar
documentado el cambio.

### 4.2 Integrar dataset Essays
Sin Essays el corpus es n=20 y las métricas LOO del baseline son
pobres (R² negativos, esperable con n tan chico). Para que las
métricas del módulo ML sean defendibles en TP3:

```bash
# 1. Conseguir Essays.csv (ver ml/data/essays/README.md)
# 2. Colocarlo en ml/data/essays/essays.csv
# 3. Versionar con DVC:
cd ml
dvc init  # solo la primera vez
dvc add data/essays/essays.csv
dvc add data/rioplatense/cases.csv
git add data/essays/essays.csv.dvc data/rioplatense/cases.csv.dvc .dvc/
# 4. Re-correr pipeline:
make all
# 5. Verificar:
cat eval_metrics.json | python -m json.tool | head -50
git add ml/metrics.json ml/eval_metrics.json
git commit -m "ml: re-train con Essays integrado — métricas reales por dimensión"
```

### 4.3 Entrenar DistilBERT (post-Essays)
El sandbox no descargó transformers + torch (timeout). En tu máquina:

```bash
cd ~/Desktop/Umbra/ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
make train       # baja DistilBERT (~500MB), entrena 5 Ridge sobre embeddings
make evaluate    # genera eval_metrics.json con bloque distilbert
make serve       # FastAPI en localhost:8000 — testear con curl
```

### 4.4 Verificar end-to-end del frontend con módulo ML
Con FastAPI corriendo en `localhost:8000`:

```bash
# en otra terminal
cd ~/Desktop/Umbra
echo "ML_API_URL=http://localhost:8000" >> .env.local
echo "ANALYZE_BIG_FIVE_SOURCE=ml" >> .env.local
npm run dev
# probar onboarding completo en http://localhost:3000
```

### 4.5 Decisión UI bajo umbral (ADR-027)
Cuando tengas las métricas reales del módulo ML entrenado, decidir UX:
mostrar/ocultar/etiquetar dimensiones marcadas `low_confidence`. Eso
queda como TODO de otra sesión, NO de esta.

### 4.6 Activar deploy del módulo ML (opcional)
Si Mainero pide demo en vivo del módulo ML en TP4:

```bash
# Render (recomendado por simpleza):
# 1. Cuenta gratis en Render.com
# 2. New > Blueprint > apuntar a este repo
# 3. Render detecta render.yaml y crea el servicio (~5 min)
# 4. Configurar ML_API_URL en Vercel project settings con la URL
#    pública de Render (ej: https://umbra-ml.onrender.com)
```

Cero costo si no se activa. Plan starter ~7 USD/mes para uptime
sin cold starts.

---

## 5. Resumen ejecutivo de qué cambió

### Código nuevo
- `/ml/` — módulo ML propio Python (15 archivos)
- `lib/ml-client.ts` — cliente HTTP TS
- `lib/prompts/interpret-narrative.ts` — Pass 1.5 Claude
- `.github/workflows/ml-validate.yml` — CI Python

### Código deprecated (stubs conservados)
- `lib/prompts/analyze-profile.ts` — wrapper que arroja error
- `lib/evals/consistency.ts` — runH1() stub
- `lib/evals/cross-model-paraphrase.ts` — runH2() stub
- `scripts/run-h1.ts`, `scripts/run-h2.ts` — exit 0 con mensaje
- `docs/research/osf/preregistration-standard.md` — nota deprecada

### Código modificado
- `app/api/analyze/route.ts` — pipeline ML + Pass 1.5
- `lib/knowledge/jung-functions.ts` — header ADR-002 v2
- `lib/knowledge/archetypes.ts` — header ADR-007 amendado
- `.env.local.example` — vars ML

### Docs actualizados (banner pivot ML + correcciones)
- `docs/DECISIONS.md` (10 ADRs tocados o creados)
- `docs/PROMPT_ARCHITECTURE.md` (reescrito)
- `docs/SYSTEM_SPEC.md`, `docs/API_MAP.md`, `docs/FEATURE_MAP.md`
- `docs/features/ANALYSIS.md`, `docs/features/DASHBOARD.md`
- `docs/tech/ARCHITECTURE.md`, `docs/tech/EVALS.md`
- `docs/biz/TFG.md`, `docs/biz/VALIDATION.md`
- `thesis/03-marco-teorico.md`, `thesis/05-metodologia.md`
- `UMBRA_MASTER_BUILD.md`, `README.md`

### Métricas ya generadas y committeables
- `ml/metrics.json` — baseline TF-IDF + Ridge LOO sobre rioplatense
- `ml/eval_metrics.json` — bloque combined + bloque LOO baseline
- `ml/data/splits/summary.json` — composición del corpus

### Validaciones que pasan
- pytest 11/11 + 1 skip
- npx tsc --noEmit exit 0
- check_eval_thresholds.py modo lax pasa
- baseline pipeline reproduce sin error
- cero console.log y cero `: any` en archivos del refactor

---

## 6. Si algo sale mal en el merge

Rollback del feature flag (sin revertir commits):

```bash
# en .env.local de Vercel y de local:
ANALYZE_BIG_FIVE_SOURCE=claude
```

Eso restaura el comportamiento Claude-only para Big Five (con la
nota: `analysis_raw.bigFiveSource` queda marcado como
`"claude_fallback"` para auditoría). El pipeline narrativo queda
inalterado. Re-abre la brecha entre código y TFG, así que es
contingencia operativa breve, no permanente.

Para revert completo del refactor:

```bash
git revert --no-commit feat/ml-module-pivot..main
git commit -m "revert: rollback pivot ML refactor"
```

---

## 7. Checklist de despertar

- [ ] `git status` en main, `git stash list` (debe estar el WIP del pre-refactor).
- [ ] `git checkout feat/ml-module-pivot` y revisar `git log` (9 commits sugeridos).
- [ ] Aplicar la secuencia de commits del Sección 2.
- [ ] Push de la branch (Sección 3).
- [ ] Acciones que el sandbox no hizo (Sección 4): integrar Essays
      cuando puedas, entrenar DistilBERT, verificar end-to-end.
- [ ] Decidir merge a main cuando estés tranquilo.
- [ ] (Opcional) `git stash pop` para retomar tus cambios pendientes
      pre-refactor en main.
