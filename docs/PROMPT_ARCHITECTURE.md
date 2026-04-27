# Umbra — Prompt Architecture (post-pivot ML, 2026-04-27)

> Cómo funcionan los prompts en Umbra después del pivot ML
> (ADR-002 v2 + ADR-026): inyección de knowledge bases, builders de
> prompts, decisiones de temperatura/modelo, y rol residual de Claude
> ahora que el componente analítico (Big Five) lo cubre el módulo ML
> propio en `/ml/`.

> **Banner pivot ML (2026-04-27)**: el Pass 1 que antes inferenciaba
> Big Five + Jung + arquetipo en una sola llamada Claude
> (`analyze-profile.ts`) está descontinuado. La inferencia Big Five
> ahora la realiza el módulo ML propio (DistilBERT congelado + Ridge
> multi-output, FastAPI, ADR-026). La capa Claude se mantiene
> exclusivamente para **lectura interpretativa** Jung + arquetipo +
> razonamiento (Pass 1.5, `interpret-narrative.ts`), narrativa, plan,
> chat contextualizado y crisis classifier. H1 / H2 OSF (ADR-011 +
> ADR-020 SUPERSEDED) ya no son la validación primary; la sustituyen
> métricas estándar de regresión por dimensión Big Five
> (ADR-028).

## Principios

1. **Prompts como código.** Viven en `lib/prompts/*.ts`, inputs y
   outputs tipados, testeables.
2. **Knowledge separado de prompts.** `lib/knowledge/*.ts` mantiene el
   contenido académico; los prompts importan helpers que inyectan
   bloques en el system prompt.
3. **Sin prompts inline.** Nunca definir prompts en API routes ni en
   componentes. Regla de proyecto en CLAUDE.md.
4. **Determinismo donde corresponde.** Temperature=0 con SKU pinned
   para Pass 1.5 (lectura interpretativa). Temperaturas más altas
   solo donde la creatividad es deseable (narrativa 0.7, evidence
   extraction 0.3).
5. **Degradación gradual de KB.** Si un bloque de KB está vacío
   (`/* COMPLETAR */`), el builder lo omite — Claude cae a
   conocimiento general en lugar de alucinar citas (ADR-018).
6. **Validación primary del análisis = módulo ML, no eval Claude.**
   La validación del componente analítico vive en `/ml/eval_metrics.json`
   (ADR-028). H1/H2 OSF quedan deprecadas.

## Knowledge base (`lib/knowledge/`)

### Las 4 fuentes de conocimiento

| Archivo | Source | Dominio público | Rol post-pivot |
|---|---|---|---|
| `big-five.ts` | IPIP-NEO (Goldberg 1999) | sí | Insumo del módulo ML + insumo narrativo del Pass 1.5 |
| `jung-functions.ts` | Tipos Psicológicos (Jung 1921) | sí | **Insumo narrativo solo** (no medición; ADR-002 v2) |
| `archetypes.ts` | Pearson aplicado (Pearson 1986, 1991) | uso taxonómico | **Insumo narrativo solo** (no medición; ADR-007 amendado) |
| `positive-computing.ts` | Calvo y Peters (2014) | uso taxonómico | Decisión de diseño (no medición) |

**NO usado**: NEO-PI-R (Costa y McCrae 1992) — propietario,
incompatible con repo público (ADR-015).

### Citation comment block (ADR-018)

Cada item en `lib/knowledge/*.ts` debe tener un bloque JSDoc inmediato
arriba con `@source`, `@reference`, `@page_or_section`, `@verbatim`.
Test `lib/knowledge/citation-check.test.ts` enforcea.

## Prompts (`lib/prompts/`)

### Inventario actualizado post-pivot

| Archivo | Propósito | Temperature | Modelo | Streaming |
|---|---|---|---|---|
| `interpret-narrative.ts` | **Pass 1.5 — lectura interpretativa Jung + arquetipo + razonamiento (recibe Big Five inferido por módulo ML)** | 0 | Sonnet (pinned SKU) | No, JSON |
| `analyze-evidence.ts` | Pass 2 — phrase-level evidence highlights | 0.3 | Sonnet | No |
| `generate-narrative.ts` | Narrativa personalizada (800-1200 palabras) | 0.7 | Sonnet | Sí, SSE |
| `chat-context.ts` | System prompt del chat contextualizado | 0.5 | Sonnet | Sí, SSE |
| `crisis-classifier.ts` | Detección de crisis (JSON classifier) | 0 | Sonnet, JSON mode | No |
| `development-plan.ts` | Plan de desarrollo (3 áreas + acciones + micro-objetivos) | 0.4 | Sonnet, JSON mode | No |
| `onboarding-conductor.ts` | Conductor adaptativo del onboarding (working profile in-flight; NO es medición final) | 0.3 | Sonnet | No |
| `chatgpt-seed-prompt.ts` + `chatgpt-seed-parser.ts` | Importación de retrato pre-existente desde ChatGPT | 0 | Sonnet | No |
| `analyze-profile.ts` | **DEPRECATED** — wrapper que arroja error explícito; reemplazado por `interpret-narrative.ts` | — | — | — |

### Pinning del modelo (ADR-014 amendado post-pivot)

`ANTHROPIC_MODEL_ID` env var hold un SKU dateado, NUNCA un alias:
- ✓ `claude-sonnet-4-6-20260301`
- ✗ `claude-sonnet-4-6` (alias — puede actualizarse silenciosamente)

Razón post-pivot: el determinismo del Pass 1 ya no es la validación
primary (la cubre el regresor entrenado del módulo ML). Pero el
pinning sigue siendo necesario para que la **narrativa** generada,
las lecturas interpretativas y el chat sean estables sesión a sesión
y trazables a un modelo concreto en auditorías.

## Pass 1.5 — Lectura interpretativa Jung + arquetipo

### Estructura del prompt

```
[System — intérprete narrativo de perfiles Umbra]
    ↓
[Big Five medido por módulo ML propio]
    ↓
[per_dimension_status — flags de baja confianza si aplica]
    ↓
[Knowledge block: funciones cognitivas Jung]
    ↓
[Knowledge block: arquetipos Pearson aplicados]
    ↓
[Textos introspectivos del usuario]
    ↓
[Instructions]
  1. Asignar 8 funciones Jung 0-100 (lectura interpretativa)
  2. Asignar arquetipo dominante + secundario (lectura interpretativa)
  3. Confianza global 0-100
  4. Razonamiento citando evidencia textual (voseo, no diagnóstico)
    ↓
[Output JSON schema]
    ↓
[Reglas: no MBTI, voseo, sin diagnóstico, aclarar lectura interpretativa]
```

### Output schema (Zod)

```ts
z.object({
  jungFunctions: z.object({
    Se: z.number(), Si: z.number(),
    Ne: z.number(), Ni: z.number(),
    Te: z.number(), Ti: z.number(),
    Fe: z.number(), Fi: z.number(),
  }),
  archetype: z.enum(['hero', 'sage', 'explorer', 'creator', 'caregiver', 'rebel']),
  archetypeSecondary: z.string(),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
})
```

Big Five viene del módulo ML, no de este prompt. Out-of-range scores
en jungFunctions o confidence se clampean a 0-100. Malformed JSON
hace que la API route devuelva 503.

## Crisis classifier (sin cambios post-pivot)

El crisis classifier no se ve afectado por el pivot ML. Sigue siendo
prompt Claude + regex pre-filter + fail-closed sobre cualquier error.
Ver `lib/prompts/crisis-classifier.ts` y `docs/tech/CHAT_SAFETY.md`.

## Eval suite (`lib/evals/`)

### Validación primary del componente analítico (ADR-028)

**Vive en `/ml/`, no en `lib/evals/`.** Métricas estándar de regresión
por dimensión Big Five (MSE, R², r de Pearson) sobre el split test del
corpus combinado Essays + rioplatense, reportadas en
`/ml/eval_metrics.json`. Reproducible:

```bash
cd ml
make all          # prepare + baseline + train + evaluate
cat eval_metrics.json
```

CI workflow `.github/workflows/ml-validate.yml` verifica que las
métricas committeadas mantengan los umbrales mínimos por dimensión
(R² > 0.20 y r > 0.30) o que las dimensiones bajo umbral estén
declaradas como `low_confidence` (ADR-027).

### Eval suite legacy (deprecada)

| Archivo | Estado |
|---|---|
| `lib/evals/consistency.ts` (H1) | DEPRECATED — stub que arroja error |
| `lib/evals/cross-model-paraphrase.ts` (H2) | DEPRECATED — stub que arroja error |
| `scripts/run-h1.ts` | DEPRECATED — sale con mensaje informativo |
| `scripts/run-h2.ts` | DEPRECATED — sale con mensaje informativo |
| `lib/evals/cases.ts` | Conservado — 50 casos (20 IPIP + 20 Jung + 10 adversarial). Migrados a `/ml/data/rioplatense/cases.csv` para entrenamiento. Crisis-eval lo sigue usando. |

### H3 — crisis classifier precision/recall (mantenido)

H3 sobrevive como validación adicional del **pipeline de seguridad**,
ortogonal al pivot ML. Ver `lib/evals/crisis-eval.ts` +
`lib/evals/crisis-dataset.ts` + `lib/evals/crisis-eval.test.ts`.
Resultados en `eval-results/H3-*.json`.

## Reglas resumidas

1. **Nunca definir prompts inline.** Siempre en `lib/prompts/*.ts`.
2. **Nunca hardcodear nombre de modelo.** Usar `ANTHROPIC_MODEL_ID` env var.
3. **Nunca skip del bloque de citación en KB.** CI test falla el PR.
4. **Nunca llamar a `buildAnalyzeProfilePrompt`.** Está descontinuado;
   migrar a `inferBigFive()` + `buildInterpretNarrativePrompt()`.
5. **Nunca paraphrasear texto del usuario de vuelta a Claude sin
   citar.** Pass 2 evidence highlights preserva quotes verbatim.
6. **Nunca tragarse errores del crisis classifier como "no crisis".**
   Fail-closed.
7. **Nunca commit de un SKU de modelo no-dateado.**
8. **Nunca hacer fallback a Claude para Big Five sin set explícito de
   `ANALYZE_BIG_FIVE_SOURCE=claude`.** Re-abre la brecha entre código y
   TFG (ADR-026).

## Ver también

- [DECISIONS.md](DECISIONS.md) — ADR-002 v2, ADR-026, ADR-027, ADR-028
  son los nuevos anclas; ADR-011, ADR-020 quedaron SUPERSEDED.
- [tech/EVALS.md](tech/EVALS.md) — metodología de evaluación post-pivot.
- [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md) — crisis classifier.
- [features/ANALYSIS.md](features/ANALYSIS.md) — feature spec del análisis.
- [biz/TFG.md](biz/TFG.md) — entregable académico.
- `/ml/README.md` — módulo ML propio (componente analítico).
