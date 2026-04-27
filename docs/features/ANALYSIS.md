# Feature — Análisis (post-pivot ML, 2026-04-27)

> El corazón analítico de Umbra. Pipeline de tres pasos: módulo ML
> propio para Big Five, Pass 1.5 narrativo en Claude para Jung +
> arquetipo + razonamiento, y Pass 2 evidence highlights.

> **Banner pivot ML (ADR-002 v2 + ADR-026)**: el Pass 1 monolítico que
> antes pedía a Claude inferir Big Five + Jung + arquetipo + razonamiento
> en una sola llamada está descontinuado. La inferencia Big Five la hace
> el módulo ML propio (`/ml/`); Claude se reserva exclusivamente para la
> lectura interpretativa narrativa.

## Phase
3

## Routes
- `POST /api/analyze` — Pass 1 (módulo ML) + Pass 1.5 (Claude). Edge runtime.
- `POST /api/analyze/evidence` — Pass 2 (Claude). Edge runtime.

Ver [API_MAP.md](../API_MAP.md) para schemas y error codes.

## Por qué pipeline en tres pasos

Separar inferencia psicométrica (Big Five, módulo ML) de lectura
interpretativa (Jung + arquetipo + razonamiento, Claude) y de evidence
extraction (Claude) permite:
- **Pass 1 (módulo ML)**: respaldo psicométrico con instrumento de
  dominio público (IPIP-NEO, ADR-015), reproducible, auditable
  (DVC + MLflow), y barato en runtime (cero costo Anthropic por
  inferencia). El TFG se sostiene técnicamente acá (ADR-026 + ADR-028).
- **Pass 1.5 (Claude)**: lectura interpretativa Jung + arquetipo +
  razonamiento como vocabulario narrativo (ADR-002 v2 + ADR-007
  amendado), no como medición. Temperatura 0 por consistencia.
- **Pass 2 (Claude)**: evidence highlights, ortogonal al perfil. Falla
  fire-and-forget sin bloquear la respuesta al usuario.

## Pass 1 — Big Five (módulo ML propio)

### Cliente TS
`lib/ml-client.ts` → `inferBigFive(text)`

### Endpoint
`POST {ML_API_URL}/infer` (default `http://localhost:8000`).
Implementación: `/ml/src/api_server.py`.

### Pipeline interno (ver `/ml/README.md`)
1. DistilBERT base multilingual cased congelado → embedding ℝ⁷⁶⁸
   (CLS pooling).
2. Cinco regresores Ridge (uno por dimensión Big Five), entrenados con
   GridSearchCV alpha sobre Essays + corpus rioplatense (corpus
   versionado con DVC).
3. Devuelve `big_five` + `per_dimension_status` (`ok` / `low_confidence`
   por dimensión, según umbrales R² > 0.20 y r > 0.30, ADR-027).

### Errores
- `MlApiUnavailableError` → API route devuelve `503 ai_unavailable`. Por
  defecto NO hay fallback a Claude (ADR-026). Activable con
  `ANALYZE_BIG_FIVE_SOURCE=claude` para contingencia operativa breve.

## Pass 1.5 — Lectura interpretativa Jung + arquetipo (Claude)

### Prompt
`lib/prompts/interpret-narrative.ts` → `buildInterpretNarrativePrompt(params)`

Inyecta:
- Big Five inferido por el módulo ML (como contexto, no como input
  para inferir).
- Knowledge blocks de Jung (Jung 1921) y arquetipos Pearson (Pearson
  1991), con header explícito de "insumo narrativo, NO taxonomía de
  medición" (ADR-002 v2).
- Textos introspectivos del usuario.

### Modelo
- `ANTHROPIC_MODEL_ID` (pinned SKU como `claude-sonnet-4-6-20260301`)
- `temperature=0`
- JSON mode
- `max_tokens: 1200`

### Output schema (Zod, sin `bigFive` — ese viene del Pass 1)
- `jungFunctions` — 8 funciones 0-100 (lectura interpretativa)
- `archetype` — uno de los 6 Pearson (lectura interpretativa)
- `archetypeSecondary` — string
- `confidence` — 0-100 self-reported para la articulación interpretativa
- `reasoning` — narrativa corta en voseo, citando evidencia textual

### Side effects (sin cambios)
- UPSERT `psychological_profiles` (version=1) — el `analysis_raw` JSONB
  ahora incluye `bigFiveSource` ("ml" o "claude_fallback") y
  `mlModelVersion` para auditoría.
- UPDATE `profiles.onboarding_completed = true`
- Si `research_opt_in=true`: INSERT `research_dataset` con HMAC
  user_hash + `generated_profile.bigFiveSource` + `mlModelVersion`

## Pass 2 — Evidence highlights

### Prompt
`lib/prompts/analyze-evidence.ts` → `buildAnalyzeEvidencePrompt(profile, originalText)`

Shorter prompt (~500 tokens). Format:
```
Dado este perfil y este texto del usuario, citá hasta 3 frases cortas
VERBATIM del texto que más informan cada una de las 5 dimensiones Big Five
y las 2 funciones Jung más altas.

No parafrasees. No resumas. Copiá frases del texto tal cual.

Perfil: {profile JSON}
Texto: {original text}

Formato JSON:
{
  "highlights": [
    { "trait": "openness", "phrases": [{ "quote": "...", "occurrence": 1 }] },
    ...
  ]
}
```

### Model
- Same `ANTHROPIC_MODEL_ID`
- `temperature=0.3` (exploratory phrase selection)
- `max_tokens: 800`

### Output schema
```ts
{
  highlights: Array<{
    trait: string;  // "openness" | "conscientiousness" | ... | "Ni" | "Ti" | ...
    phrases: Array<{
      quote: string;       // verbatim substring
      occurrence: number;  // 1-indexed for disambiguation (e.g., "amor" appears 3 times, which occurrence?)
    }>;
  }>;
}
```

### Side effects
- INSERT `evidence_highlights` row (persisted per eng review E4)

### Client-side offset resolution

Char offsets from Claude are unreliable. Client uses `text.indexOf(quote, fromIndex)`
to find the nth occurrence:

```ts
function resolvePhrase(text: string, quote: string, occurrence: number): [number, number] | null {
  let from = 0;
  let found = null;
  for (let i = 0; i < occurrence; i++) {
    found = text.indexOf(quote, from);
    if (found === -1) return null;  // not found → silently skip
    from = found + quote.length;
  }
  return [found!, found! + quote.length];
}
```

If quote is not in text (Claude paraphrased despite instructions), silently
discard that highlight. Zero impact on rest of the UI.

## Two-pass orchestration (parallel execution)

Pass 1 and the `psychological_profiles` INSERT run first. Pass 2 dispatches in
parallel with the INSERT to minimize wall-clock:

```ts
const [profile, _insertResult] = await Promise.all([
  claudeText({ ... Pass 1 prompt ... }),   // ~6s
  // nothing yet — Pass 1 must complete first
]);

const parsedProfile = zod.parse(profile);

// Pass 2 dispatch + DB insert in parallel
const [pass2Result, _dbResult] = await Promise.all([
  fetch('/api/analyze/evidence', {
    method: 'POST',
    body: JSON.stringify({ profileId, originalText: texts.join('\n') }),
  }),
  supabase.from('psychological_profiles').insert({
    user_id: userId,
    version: 1,
    ...parsedProfile,
  }),
]);
```

Net latency: `~6s (Pass 1) + max(~1s Pass 2, ~200ms DB) = ~7s`. Better than
sequential (~8s+). See eng review finding 4.1.

## Performance targets

- Pass 1 end-to-end: ~6-8s (model-dependent)
- Pass 2 end-to-end: ~1-2s
- DB insert: < 200ms
- Total onboarding → profile: ~8s

## Error handling

| Failure | Behavior |
|---|---|
| Claude timeout Pass 1 | Retry 2x with backoff; then 503 `ai_unavailable` |
| Malformed JSON Pass 1 | Retry 1x with stronger JSON instruction; then 503 |
| Claude refusal Pass 1 | Log + retry with reinforcement; rare |
| Out-of-range scores | Zod clamps to [0, 100], logs warning |
| DB insert fail | Rollback, return 500 |
| Unique constraint violation | Return existing profile (idempotent) |
| Pass 2 anything | Silent no-op; client just doesn't show highlights |
| Rate limit exceeded | 429 (pre-check before Claude call) |
| Budget exceeded | 503 `budget_exceeded` |

See [tech/ARCHITECTURE.md](../tech/ARCHITECTURE.md) production failure scenarios.

## Dependencies

- Knowledge base complete (at least minimum viable thresholds per KB gate)
- `charge_rate_limit` RPC (Phase 1.5.6)
- `evidence_highlights` table (Migration 002)
- Eval suite (for H1 determinism validation)

## Testing

- `lib/prompts/analyze-profile.test.ts` — prompt builder produces expected structure for known inputs
- `lib/prompts/analyze-evidence.test.ts` — evidence prompt builder
- `app/api/analyze/route.test.ts` — integration with mocked Claude (happy path + all failure modes)
- `app/api/analyze/evidence/route.test.ts` — integration
- `lib/evals/run.test.ts` — H1 + H2 eval runners ([tech/EVALS.md](../tech/EVALS.md))
- `e2e/analyze-full-flow.spec.ts` — Playwright: onboarding input → dashboard with profile

## Design notes

- **Progressive animation** is UI-side choreography on already-complete Pass 1 data. Not server-side streaming. Pass 1 is JSON mode (non-streaming).
- **Evidence highlights** are rendered as subtle violet underline (not full highlight) with a tooltip showing which trait the phrase informs.
- **Confidence** is NOT shown as a bar or number to the user. It's used internally by the narrative prompt to calibrate uncertainty ("tu perfil sugiere..." vs "tu perfil muestra claramente...").

## See also

- [ONBOARDING.md](ONBOARDING.md) — the flow that invokes analyze
- [DASHBOARD.md](DASHBOARD.md) — visualizes the result
- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md) — prompt design
- [tech/EVALS.md](../tech/EVALS.md) — H1 + H2 methodology
- [tech/ARCHITECTURE.md](../tech/ARCHITECTURE.md) — data flow
