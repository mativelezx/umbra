# Feature — AI Analysis (Pass 1 + Pass 2)

> The heart of Umbra. Two-pass Claude analysis producing psychological profile
> and phrase-level evidence highlights.

## Phase
3

## Routes
- `POST /api/analyze` — Pass 1 (Edge runtime)
- `POST /api/analyze/evidence` — Pass 2 (Edge runtime)

See [API_MAP.md](../API_MAP.md) for request/response schemas and error codes.

## Why two passes

Asking Claude to both produce profile scores AND cite evidence in one call
reduces profile quality. Evidence extraction is a lighter task that benefits
from a slightly higher temperature (0.3) and shorter prompt. Splitting lets
us:
- Pin Pass 1 to temperature=0 for H1 determinism
- Let Pass 2 explore phrase selection creatively
- Fail Pass 2 gracefully without blocking the core profile
- Cache Pass 1 for H1 evaluation independently of Pass 2

## Pass 1 — Profile analysis

### Prompt
`lib/prompts/analyze-profile.ts` → `buildAnalyzeProfilePrompt(params)`

Injects all 4 knowledge blocks (Big Five, Jung, archetypes, Positive Computing)
conditionally (skipped if empty per ADR-018).

### Model
- `ANTHROPIC_MODEL_ID` (pinned SKU like `claude-sonnet-4-6-20260301`)
- `temperature=0` (deterministic for H1)
- JSON mode
- `max_tokens: 1500`

### Output schema
See [API_MAP.md](../API_MAP.md) for full zod schema. Key fields:
- `bigFive` — 5 dimensions 0-100
- `jungFunctions` — 8 functions 0-100
- `archetype` — one of 6 Pearson types
- `archetypeSecondary` — string
- `confidence` — 0-100 self-reported
- `reasoning` — short narrative

### Side effects
- INSERT `psychological_profiles` (version=1)
- UPDATE `profiles.onboarding_completed = true`
- If `research_opt_in=true`: INSERT `research_dataset` with HMAC user_hash

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
