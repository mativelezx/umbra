# Umbra — Eval Suite (post-pivot ML, 2026-04-27)

> **Banner pivot ML (ADR-011 + ADR-012 + ADR-020 SUPERSEDED, ADR-026 +
> ADR-028)**: H1 (determinismo) y H2 (paráfrasis intra-vendor) quedaron
> deprecadas. La validación primary del componente analítico ahora son
> **MSE / R² / r de Pearson por dimensión Big Five** sobre el regresor
> entrenado del módulo ML propio (`/ml/`), no sobre prompts Claude.
> H3 (precision/recall del crisis classifier) se mantiene como
> validación adicional del pipeline de seguridad (ortogonal al pivot).
> M3 (think-aloud n=8-10) sigue como secondary user validation.

## Estado de la suite

| Componente | Estado | Reemplazo / Rol |
|---|---|---|
| H1 (`lib/evals/consistency.ts` + `scripts/run-h1.ts`) | DEPRECATED | Reemplazado por `/ml/eval_metrics.json` (ADR-028). Stub que arroja error. |
| H2 (`lib/evals/cross-model-paraphrase.ts` + `scripts/run-h2.ts`) | DEPRECATED | Idem. |
| H3 (`lib/evals/crisis-eval.ts` + `crisis-dataset.ts` + `crisis-eval.test.ts`) | VIGENTE | Validación pipeline crisis classifier, ortogonal al pivot ML. |
| M3 (think-aloud n=8-10) | VIGENTE | Documentado en `docs/research/`, ejecución en TP3-TP4. |
| Resultados pre-pivot (`eval-results/H1-*.json`, `H2-*.json`) | LEGACY | Mover a `eval-results/legacy/` (ver COMMIT_PLAN.md). |

## Validación primary del componente analítico (ADR-028)

Vive en `/ml/`, no en `lib/evals/`. Reproducible:

```bash
cd ml
make all          # prepare_data + baseline_tfidf + train_ridge + evaluate
cat eval_metrics.json
```

Estructura del reporte:

```json
{
  "model_type": "distilbert_ridge",
  "thresholds": {"r2": 0.20, "r": 0.30},
  "blocks": {
    "combined": {"per_dimension_status": {...}, "metrics": {...}},
    "english_only": {"per_dimension_status": {...}, "metrics": {...}},
    "rioplatense_only": {"per_dimension_status": {...}, "metrics": {...}}
  },
  "dataset_status": { "essays_integrated": true, ... }
}
```

Métricas por dimensión: MSE, R², r de Pearson. **Umbral mínimo de
aceptación**: R² > 0.20 y r > 0.30. Las dimensiones por debajo se
reportan como `low_confidence` y quedan fuera del componente
cuantitativo del perfil (ADR-027).

## Eval suite legacy (deprecada, conservada por compatibilidad)

Los archivos de la suite Claude pre-pivot quedan en el árbol como stubs
que arrojan error en runtime. Cualquier intento de invocarlos sale con
mensaje informativo apuntando al módulo ML.

El corpus de 50 casos (`lib/evals/cases.ts`) se conserva porque el
crisis classifier (H3) lo sigue usando y porque sirve como
**dataset de inspección cualitativa** de la inferencia. La parte IPIP
del corpus (20 casos) se migró a `/ml/data/rioplatense/cases.csv` con
scores Big Five etiquetados por la rúbrica documentada en
`/ml/data/rioplatense/rubrica_validacion.md`.

## Directory structure

```
lib/evals/
├── cases/
│   ├── ipip-neo/
│   │   ├── case-001-high-openness.json
│   │   ├── case-002-low-neuroticism.json
│   │   └── ... (20 total)
│   ├── jung-vignettes/
│   │   ├── case-021-dominant-ni.json
│   │   └── ... (20 total)
│   └── adversarial/
│       ├── case-041-argentine-idiom.json
│       ├── case-042-extreme-brevity.json
│       └── ... (10 total)
├── run.ts                      # Main eval runner
├── consistency.ts              # H1 determinism runner
├── cross-model-paraphrase.ts   # H2 cross-model runner
├── rewriters.ts                # Sonnet + Haiku rewriter helpers
├── cache-keys.ts               # Hash computation for cache keys
├── .cache/
│   ├── snapshot-20260412-claude-sonnet-4-6-20260301.json  # committed
│   ├── snapshot-20260501-claude-sonnet-4-6-20260301.json  # committed
│   └── live/                   # gitignored
│       └── ...
└── *.test.ts                   # Vitest unit tests
```

## Case schema

```ts
export interface EvalCase {
  id: string;                  // "ipip-neo-001"
  source: 'ipip-neo' | 'jung-vignettes' | 'adversarial';
  sourceCitation: string;      // verbatim academic source
  text: string;                // the introspective text to analyze
  expected: {
    bigFive: {
      openness: [number, number];          // [lowBound, highBound]
      conscientiousness: [number, number];
      extraversion: [number, number];
      agreeableness: [number, number];
      neuroticism: [number, number];
    };
    jungFunctions: {
      Se: [number, number]; Si: [number, number];
      Ne: [number, number]; Ni: [number, number];
      Te: [number, number]; Ti: [number, number];
      Fe: [number, number]; Fi: [number, number];
    };
    archetype: string[];       // allowed set (e.g., ["sage"] or ["sage","creator"])
  };
  interRaterLabeled: boolean;  // true if 2 raters validated
  interRaterKappa?: number;    // Cohen's kappa if labeled
  notes?: string;              // authoring notes
}
```

## Provenance (50 cases total)

### 20 from IPIP-NEO published vignettes
- Source: Goldberg (1999) IPIP-NEO items and published descriptive vignettes
- Public domain — can be bundled verbatim in repo
- Each case has a citation in `sourceCitation`
- Range labels derived from Goldberg's published scoring rationale

### 20 from Jung typology literature
- Source: Jung (1921) *Tipos Psicológicos*, particularly chapters on function types
- Public domain (Spanish translation out of copyright)
- Case text adapted to first-person introspective voice (paraphrase with citation)
- Expected ranges derived from Jung's characterizations

### 10 adversarial synthetic cases
- Authored by the developer
- Cover: paraphrase tests, Argentine idioms (false positive check for crisis), minority voices (older user, rural voice, neurodivergent self-description), extreme brevity, unicode stress, emoji, code-switching
- Ranges authored conservatively with rationale in `notes`

## Inter-rater protocol

10 of the 50 cases are labeled independently by 2 raters:
- **Rater 1**: the developer (you)
- **Rater 2**: a fellow TFG student, psychology advisor, or licensed psychologist

For each labeled case:
- Both raters independently assign expected Big Five ranges (5 dimensions) and expected Jung function ranges (8 functions) and allowed archetypes
- Compute Cohen's kappa per dimension
- Require kappa > 0.6 per dimension for the case to be locked
- If kappa < 0.6, widen ranges or discard the case

Store inter-rater results in `lib/evals/inter-rater-results.json` for the paper.

## H1 — Determinism hypothesis

### Statement
Given `temperature=0` and a pinned model SKU (`claude-sonnet-4-6-20260301`),
analyzing the same input text 5 times produces Big Five scores with standard
deviation < 2.5 points (equivalent to < 5-point range) across all 50 eval
cases.

### Runner: `lib/evals/consistency.ts`

```ts
async function runH1(caseId: string): Promise<H1Result> {
  const case_ = loadCase(caseId);
  const results: Profile[] = [];

  for (let i = 0; i < 5; i++) {
    const profile = await callAnalyze({
      text: case_.text,
      cached: true,  // uses snapshot cache if available
      temperature: 0,
      model: process.env.ANTHROPIC_MODEL_ID!,
    });
    results.push(profile);
  }

  // Per dimension, compute std deviation across 5 runs
  const deviations = computeDeviations(results);
  const pass = Object.values(deviations.bigFive).every(std => std < 2.5);

  return { caseId, results, deviations, pass };
}
```

### Pass criterion
`H1 passes` iff ALL 50 cases have std dev < 2.5 for ALL 5 Big Five dimensions.
Partial pass (e.g., 48/50 cases pass) is reported separately.

### Why pinned SKU matters
If `ANTHROPIC_MODEL_ID` is an alias like `claude-sonnet-4-6`, Anthropic can
silently upgrade the underlying version. Past H1 results become unreproducible.
Pinning to a dated SKU like `claude-sonnet-4-6-20260301` locks the model version.
See ADR-014.

## H2 — Cross-model paraphrase consistency

### Statement
Given 3 semantic-preserving paraphrases of each case (2 from Claude Sonnet,
1 from Claude Haiku — see ADR-020), the Big Five scores for the paraphrased
texts deviate < 10 points (max pairwise delta) from each other and from the
original, across all 50 cases.

### Why intra-vendor (Sonnet + Haiku)
Originally planned as cross-vendor (GPT + Llama) but Llama local doesn't run
on GitHub Actions runners. Sonnet + Haiku are architecturally distinct within
Anthropic's family, which is a weaker but honest methodological claim. Paper
methods section documents this as a limitation (ADR-020).

### Runner: `lib/evals/cross-model-paraphrase.ts`

```ts
async function runH2(caseId: string): Promise<H2Result> {
  const case_ = loadCase(caseId);

  const paraphrases = await Promise.all([
    rewriteWith('sonnet', case_.text),
    rewriteWith('sonnet', case_.text),  // second sonnet rewrite
    rewriteWith('haiku', case_.text),
  ]);

  const profiles = await Promise.all([
    callAnalyze({ text: case_.text }),       // original
    callAnalyze({ text: paraphrases[0] }),
    callAnalyze({ text: paraphrases[1] }),
    callAnalyze({ text: paraphrases[2] }),
  ]);

  const maxPairwiseDelta = computeMaxPairwiseDelta(profiles);
  const pass = Object.values(maxPairwiseDelta.bigFive).every(delta => delta < 10);

  return { caseId, paraphrases, profiles, maxPairwiseDelta, pass };
}
```

### Rewriter prompt (`lib/prompts/paraphrase-rewriter.ts`)

```
Reescribí el siguiente texto introspectivo manteniendo el significado
semántico exacto pero cambiando la redacción. No cambies detalles
personales, valores, ni el contenido emocional. Solo cambiá palabras,
orden de frases, y estilo. Devolvé SOLO el texto reescrito sin comentarios.

Texto original:
{text}
```

Temperature=0.7 for the rewriter (creative variation).

### Pass criterion
`H2 passes` iff ALL 50 cases have max pairwise Big Five delta < 10 points
across the 4 versions (original + 3 paraphrases).

## Committed cache snapshots (ADR-014)

Every eval run writes its outputs to:
```
lib/evals/.cache/snapshot-{YYYYMMDD}-{model-sku}.json
```

These files are **committed to the repo**, not gitignored. Format:

```json
{
  "generated_at": "2026-04-12T21:00:00Z",
  "model": "claude-sonnet-4-6-20260301",
  "lexicon_version": "1.0.0",
  "kb_commit": "abc123",
  "prompt_commit": "def456",
  "cases": [
    {
      "id": "ipip-neo-001",
      "h1_runs": [profile1, profile2, ...],
      "h2_paraphrases": ["...", "...", "..."],
      "h2_profiles": [profile_orig, profile_p1, ...]
    }
  ]
}
```

Paper methods section cites the commit hash of the snapshot used for
published results. Reviewers can:
1. Clone the repo at that commit
2. Run `npm run eval -- --from-cache`
3. See the exact same H1 / H2 results without spending a cent on API calls

## CI integration

### PR workflow (`.github/workflows/eval-pr.yml`)

```yaml
name: Eval (PR subset)
on: pull_request
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v4
        with:
          path: lib/evals/.cache/live
          key: evals-${{ hashFiles('lib/evals/cases/**', 'lib/knowledge/**', 'lib/prompts/**') }}-${{ env.ANTHROPIC_MODEL_ID }}
      - run: npm ci
      - run: npm run eval -- --subset 10
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          ANTHROPIC_MODEL_ID: claude-sonnet-4-6-20260301
          ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN: 5
```

**PR runs** evaluate a 10-case subset (eng review finding 4.5). Cold-start
cost ≈ 3 USD max. Cache hits make subsequent runs near-free.

### Main branch workflow (`.github/workflows/eval-main.yml`)

```yaml
name: Eval (full 50-case)
on:
  push:
    branches: [main]
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - ...
      - run: npm run eval -- --full
      - run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add lib/evals/.cache/snapshot-*.json
          git commit -m "chore(eval): update snapshot for commit ${GITHUB_SHA}" || true
          git push
```

**Main branch runs** the full 50-case eval and commits the updated snapshot.
Paper results are always reproducible against the latest committed snapshot.

## Cost cap

`ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN=5` is a hard cap inside the runner:

```ts
let runningCostCents = 0;
const MAX_COST_CENTS = Number(process.env.ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN!) * 100;

for (const case_ of cases) {
  if (runningCostCents > MAX_COST_CENTS) {
    console.error(`[eval] cost cap reached at $${runningCostCents / 100}, aborting`);
    process.exit(1);
  }
  const { profile, costCents } = await callAnalyzeWithCost(case_);
  runningCostCents += costCents;
}
```

With cache restore, real CI cost is ~$0.50 per run. Cold start (cache miss): ~$3-5.

## Unit tests

- `lib/evals/run.test.ts` — runner loads cases, asserts ranges
- `lib/evals/consistency.test.ts` — H1 logic with mocked Claude (5 runs returning synthetic profiles)
- `lib/evals/cross-model-paraphrase.test.ts` — H2 logic with mocked rewriters
- `lib/evals/rewriters.test.ts` — rewriter wraps the right prompt
- `lib/evals/cache-keys.test.ts` — cache key hashing is stable

## How to author a new case

1. Identify the source (IPIP-NEO vignette, Jung literature, or adversarial)
2. Write the text in first-person Spanish (natural rioplatense)
3. Determine expected ranges based on source + your reading
4. If one of the 10 inter-rater cases, get a second rater to independently label
5. Compute kappa if inter-rater; require > 0.6
6. Commit to `lib/evals/cases/{source}/`
7. Run `npm run eval -- --case <id>` to see the profile Claude produces
8. If out of range, widen the range OR adjust the text to be more discriminating
9. Commit the case + run the full eval to update the snapshot

## Debugging eval failures

If H1 fails on a case:
- Check if model SKU is pinned in `ANTHROPIC_MODEL_ID`
- Check if prompt changed recently
- Rerun manually: `npm run eval -- --case <id> --h1 --verbose`
- If scores drift > 5 points, the model or prompt changed — this is a real regression

If H2 fails on a case:
- Check if rewriter prompts changed
- Check if one of the rewriters is producing semantic drift (not paraphrase)
- Rerun manually: `npm run eval -- --case <id> --h2 --verbose`
- If delta > 10, inspect each paraphrase and its resulting profile to see which rewrite is the outlier

## Results storage for paper

The paper methods section points to:
- `lib/evals/.cache/snapshot-{date}-{model}.json` — raw results
- `lib/evals/inter-rater-results.json` — kappa per case
- `lib/evals/h1-results-{date}.md` — formatted H1 table
- `lib/evals/h2-results-{date}.md` — formatted H2 table
- OSF preregistration URL

All committed to the repo.

## References

- [DECISIONS.md ADR-011, ADR-014, ADR-020](../DECISIONS.md)
- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md) — prompt builders
- [biz/TFG.md](../biz/TFG.md) — OSF preregistration + paper
- Goldberg, L. R. (1999). IPIP
- Jung, C.G. (1921). *Tipos Psicológicos*
