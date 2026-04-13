# Umbra — Prompt Architecture

> How prompts work in Umbra: knowledge base injection, prompt builders,
> temperature / model choices, eval suite, and the rules that keep outputs
> consistent and academically defensible.

## Guiding principles

1. **Prompts are code, not strings.** Live in `lib/prompts/*.ts`, typed inputs, typed outputs, testable.
2. **Knowledge is separate from prompts.** `lib/knowledge/*.ts` holds the academic content; prompts import helpers that inject blocks into the system prompt.
3. **No inline prompts.** Never define prompts in API routes or components. CLAUDE.md enforces this as a project rule.
4. **Deterministic where possible.** Temperature=0 with pinned SKU for analysis. Higher temperature only where creativity matters (narrative 0.7, evidence extraction 0.3).
5. **Graceful KB degradation.** If a knowledge block is empty (`/* COMPLETAR */`), the prompt builder omits that section entirely — Claude falls back to general knowledge rather than hallucinating citations. See [DECISIONS.md ADR-018](DECISIONS.md).
6. **Eval as truth.** H1 (determinism) and H2 (cross-model paraphrase consistency) are preregistered on OSF. Committed cache snapshots make reproduction offline.

## Knowledge base structure (`lib/knowledge/`)

### The 4 knowledge sources

| File | Source | Public domain? | Status |
|---|---|---|---|
| `big-five.ts` | IPIP-NEO (Goldberg 1999) | ✓ public domain | Pending KB research |
| `jung-functions.ts` | Tipos Psicológicos (Jung 1921) | ✓ public domain (Spanish translation) | Pending KB research |
| `archetypes.ts` | Pearson applied (Pearson 1986, 1991) | taxonomy-only usage | Pending KB research |
| `positive-computing.ts` | Calvo & Peters (2014) | taxonomy-only usage | Pending KB research |

**NOT using**: NEO-PI-R (Costa & McCrae 1992) — proprietary, cannot bundle in public repo. Swapped to IPIP-NEO per [DECISIONS.md ADR-015](DECISIONS.md).

### KB item structure (enforced by `citation-check.test.ts`)

Every item in a knowledge array MUST have a JSDoc comment immediately above:

```ts
/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newNEOFacetsKey.htm
 * @page_or_section "Openness — Imagination facet"
 * @verbatim false
 */
{
  key: 'imagination',
  name: 'Imagination',
  description: '...',
  highIndicators: ['...', '...'],
  lowIndicators: ['...', '...'],
}
```

- `@source` — full citation
- `@reference` — URL or DOI where the content lives
- `@page_or_section` — pinpoint location within the source
- `@verbatim` — `true` if direct quote, `false` if paraphrased

CI test `lib/knowledge/citation-check.test.ts` parses all KB files, fails if any item is missing the block. Enforced per ADR-018.

### Shared builder helper (`lib/knowledge/build-block.ts`)

```ts
export interface KnowledgeBlockOptions<T> {
  items: T[];
  render: (item: T) => string;
  separator?: string;
  skipIf?: (item: T) => boolean;
}

export function buildKnowledgeBlock<T>({
  items,
  render,
  separator = '\n\n---\n\n',
  skipIf = (item) => JSON.stringify(item).includes('/* COMPLETAR */'),
}: KnowledgeBlockOptions<T>): string {
  return items.filter(item => !skipIf(item)).map(render).join(separator);
}
```

All 4 knowledge files use this. Single source of truth for formatting AND graceful degradation of empty items (see ADR-018 + KB gate in [PLAN.md](PLAN.md)).

## Prompt builders (`lib/prompts/`)

### Prompt build pattern

Every prompt is a function `buildXPrompt(params: XParams): string`. Input is typed via interface, output is a single string ready to send to Claude. Inside, the function imports knowledge helpers and injects them conditionally:

```ts
import { buildBigFiveBlock } from '@/lib/knowledge/big-five';
import { buildJungBlock } from '@/lib/knowledge/jung-functions';
import { buildArchetypesBlock } from '@/lib/knowledge/archetypes';

export function buildAnalyzeProfilePrompt(params: AnalyzeProfileParams): string {
  const { texts, mode, areas } = params;
  const textBlock = mode === 'guided'
    ? areas!.map((area, i) => `### ${area}\n${texts[i]}`).join('\n\n')
    : texts[0];

  const sections: string[] = ['Sos un psicólogo analítico experto en Jung y Big Five.'];

  const bigFive = buildBigFiveBlock();
  if (bigFive) sections.push(`## Marco teórico: Big Five (IPIP-NEO)\n${bigFive}`);

  const jung = buildJungBlock();
  if (jung) sections.push(`## Marco teórico: Funciones cognitivas Jung\n${jung}`);

  const archetypes = buildArchetypesBlock();
  if (archetypes) sections.push(`## Marco teórico: Arquetipos (Pearson aplicado)\n${archetypes}`);

  sections.push(`## Textos del usuario (modo: ${mode})\n${textBlock}`);
  sections.push(INSTRUCTIONS_BLOCK);  // constant defined in same file

  return sections.join('\n\n');
}
```

The `if (block)` checks ensure empty KB sections are silently omitted instead of being rendered as `/* COMPLETAR */` — preventing Claude from hallucinating a citation that doesn't exist.

### Prompt inventory

| File | Purpose | Temperature | Model | Streaming |
|---|---|---|---|---|
| `analyze-profile.ts` | Pass 1 analysis (Big Five + Jung + archetype) | 0 | Sonnet (pinned SKU) | No, JSON mode |
| `analyze-evidence.ts` | Pass 2 phrase-level evidence highlights | 0.3 | Sonnet | No |
| `generate-narrative.ts` | Personalized narrative (800-1200 words) | 0.7 | Sonnet | Yes, SSE |
| `chat-context.ts` | System prompt for contextualized chat | 0.5 | Sonnet | Yes, SSE |
| `crisis-classifier.ts` | Crisis detection JSON classifier | 0 | Sonnet, JSON mode | No |
| `development-plan.ts` | 3-area development plan with actions + micro-goals | 0.4 | Sonnet, JSON mode | No |

### Model pinning (ADR-014)

`ANTHROPIC_MODEL_ID` env var holds a **dated SKU**, never an alias:
- ✓ `claude-sonnet-4-6-20260301`
- ✗ `claude-sonnet-4-6` (alias — can silently upgrade)

This is non-negotiable for H1 determinism. If Anthropic rotates the alias, past H1 results become unreproducible. The paper methods section cites the exact SKU used.

Secondary model (Haiku) for H2 rewriter also pinned:
- `ANTHROPIC_HAIKU_MODEL_ID=claude-haiku-4-5-20251001`

## Analyze-profile prompt anatomy (example)

The `analyze-profile` prompt is the most important one in the system. It produces structured JSON that drives every downstream feature.

### Structure

```
[System — Umbra analyst identity]
    ↓
[Big Five knowledge block] (optional, injected if KB non-empty)
    ↓
[Jung functions knowledge block] (optional)
    ↓
[Archetypes knowledge block] (optional)
    ↓
[User's introspective text]
    ↓
[Instructions]
  1. Analyze each Big Five dimension 0-100
  2. Analyze each Jung function 0-100
  3. Assign dominant archetype + secondary
  4. Report confidence 0-100
  5. Provide reasoning with textual evidence
    ↓
[Output format: JSON schema]
    ↓
[Rules]
  - No diagnostic language
  - No MBTI labels
  - Cite textual evidence in reasoning
  - Spanish rioplatense
  - Nuanced scores (avoid 50 everything)
```

### Output schema (enforced by Zod post-parse)

```ts
z.object({
  bigFive: z.object({
    openness: z.number().min(0).max(100),
    conscientiousness: z.number().min(0).max(100),
    extraversion: z.number().min(0).max(100),
    agreeableness: z.number().min(0).max(100),
    neuroticism: z.number().min(0).max(100),
  }),
  jungFunctions: z.object({
    Se: z.number(), Si: z.number(),
    Ne: z.number(), Ni: z.number(),
    Te: z.number(), Ti: z.number(),
    Fe: z.number(), Fi: z.number(),
  }),
  archetype: z.enum(['hero', 'sage', 'explorer', 'creator', 'caregiver', 'rebel']),
  archetypeSecondary: z.string(),
  confidence: z.number().min(0).max(100),
  reasoning: z.string().min(100).max(2000),
})
```

Out-of-range scores get clamped, not rejected. Malformed JSON triggers 1 retry with stronger JSON instruction, then fails 503.

## Chat classifier prompt (crisis detection)

### Purpose
Run after the regex crisis-lexicon pre-filter. The classifier looks at the last user turn + prior assistant turn as context, and returns a structured JSON verdict. Fail-closed: any error treats the message as crisis.

### System prompt (anatomy)

```
Sos un clasificador de riesgo para un app argentino de autoconocimiento.
Tu tarea: determinar si un mensaje del usuario indica crisis emocional activa.

Sos conciente de modismos argentinos:
- "me quiero matar estudiando" = frustración académica, NO ideación suicida
- "me muero de hambre" = exageración, NO crisis
- "estoy hecho bolsa" = agotamiento, NO crisis

Señales REALES de crisis:
- Ideación suicida explícita
- Plan concreto
- Autolesión activa
- Psicosis activa (alucinaciones, delirios urgentes)
- Consumo agudo con riesgo

Respondé SÓLO con JSON válido:
{
  "is_crisis": boolean,
  "severity": "low" | "med" | "high",
  "reasoning": "breve explicación"
}

Si estás en duda, marcá is_crisis=true con severity="low" o "med".
El costo de un falso positivo es mucho menor que un falso negativo.
```

### Failure modes (fail-closed)

- Timeout → `classifier_error` severity → crisis card shown
- Malformed JSON → `classifier_error` → crisis card
- Refusal ("no puedo juzgar") → `classifier_error` → crisis card
- Out-of-schema response → `classifier_error` → crisis card

All failures logged to `crisis_events` with `severity='classifier_error'` for manual review.

## Eval suite (`lib/evals/`)

### H1 — Determinism check

**Hypothesis**: with temperature=0 and pinned model SKU, the same input produces Big Five scores that deviate < 5 points across 5 consecutive runs.

**Runner**: `lib/evals/consistency.ts`
**Cases**: 50 golden cases from `lib/evals/cases/`
**Assertion**: `stddev(scores_over_5_runs) < 2.5` per dimension (equivalent to "< 5 points range")

H1 is preregistered on OSF. Pinned SKU is mandatory for H1 to be meaningful.

### H2 — Cross-model paraphrase consistency

**Hypothesis**: given 3 semantic-preserving paraphrases produced by different models, the Big Five profile shifts < 10 points per dimension.

**Rewriters**: Claude Sonnet + Claude Haiku (NOT cross-vendor — intra-vendor cross-model documented as limitation in ADR-020).

**Runner**: `lib/evals/cross-model-paraphrase.ts`
**Cases**: same 50 golden cases
**Assertion**: `max_pairwise_delta < 10` per dimension across 3 paraphrases

H2 is preregistered on OSF.

### Golden case provenance

50 cases total:
- **20 adapted from IPIP-NEO published vignettes** — public domain
- **20 from Jung typology literature** — Tipos Psicológicos ch. X-XI, function vignettes
- **10 adversarial synthetic cases** — paraphrase tests, Argentine idioms, minority voices, extreme brevity

10 of the 50 are labeled by 2 human raters (developer + external); inter-rater Cohen's kappa must be > 0.6 before the case ranges are locked.

### Reproducibility cache

- **Committed snapshots**: `lib/evals/.cache/snapshot-{date}-{model}.json` (NOT gitignored)
- **Live dev cache**: `lib/evals/.cache/live/` (gitignored)
- **CI restore**: GitHub Actions `actions/cache@v4` keyed on `lib/evals/cases/**`, `lib/knowledge/**`, `lib/prompts/**`, `ANTHROPIC_MODEL_ID`
- **Offline replay**: `npm run eval -- --from-cache` reproduces H1/H2 numbers without live API calls

Paper methods section cites the git commit hash of the snapshot used for published results.

### Cost ceiling

`ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN=5` aborts the runner if exceeded. With cache, real CI cost is near zero. Without cache (cold start): 50 cases × 5 H1 runs + 50 cases × 3 H2 rewrites ≈ 15 USD. PR runs use a 10-case subset for affordability; full 50-case run only on main-branch merge.

## Tests specific to prompts

### Unit tests
- `lib/knowledge/build-block.test.ts` — skip-if, separator, empty input
- `lib/knowledge/citation-check.test.ts` — all items have full JSDoc block
- `lib/prompts/analyze-profile.test.ts` — prompt builder produces expected structure for known input
- `lib/prompts/crisis-classifier.test.ts` — system prompt includes idiom examples

### Integration tests
- `lib/evals/run.test.ts` — eval runner loads cases, calls Claude (mocked or cached), asserts ranges
- `lib/evals/consistency.test.ts` — H1 determinism over 5 runs on fixed case
- `lib/evals/cross-model-paraphrase.test.ts` — H2 cross-model delta check

### E2E tests
- `app/api/analyze/route.test.ts` — full analyze flow with mocked Claude
- `e2e/chat-crisis-flow.spec.ts` (Playwright) — crisis path never reaches Claude

## Rules summary

1. **Never define prompts inline.** Always in `lib/prompts/*.ts`.
2. **Never hardcode model name.** Use `ANTHROPIC_MODEL_ID` env var.
3. **Never skip the citation block on KB items.** CI test fails the PR.
4. **Never paraphrase user text back to Claude without quoting.** Pass 2 evidence highlights preserve verbatim quotes, client-side offset resolution.
5. **Never swallow classifier errors as "not crisis".** Fail-closed is the only safe behavior.
6. **Never run evals on a live API in CI without cache restore.** Cost ceiling will kill the runner.
7. **Never commit a non-dated model SKU.** H1 determinism depends on frozen model version.

## See also

- [DECISIONS.md](DECISIONS.md) — ADR-005, ADR-011, ADR-014, ADR-015, ADR-018, ADR-020 all touch prompt architecture
- [tech/EVALS.md](tech/EVALS.md) — eval methodology deep-dive
- [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md) — crisis classifier integration
- [features/ANALYSIS.md](features/ANALYSIS.md) — analysis feature spec
- [biz/TFG.md](biz/TFG.md) — OSF preregistration + paper
