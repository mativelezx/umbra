# Umbra — Prompt Architecture

> Cómo funcionan los prompts en Umbra: knowledge base injection, prompt
> builders, temperature / model choices, y las reglas que mantienen las
> salidas consistentes y académicamente defendibles.

## Guiding principles

1. **Prompts are code, not strings.** Live in `lib/prompts/*.ts`, typed
   inputs, typed outputs, testable.
2. **Knowledge is separate from prompts.** `lib/knowledge/*.ts` holds
   the academic content; prompts import helpers that inject blocks
   into the system prompt.
3. **No inline prompts.** Never define prompts in API routes or
   components. CLAUDE.md enforces this as a project rule.
4. **Capas separadas medido vs interpretativo.** El módulo analítico
   propio en `ml/` mide las cinco dimensiones Big Five (ADR-026). La
   capa narrativa (este directorio `lib/prompts/`) **lee
   interpretativamente** desde los Big Five medidos hacia funciones
   Jung y arquetipo (ADR-002 + ADR-007). Ningún prompt infiere Big
   Five; ese trabajo es del módulo ML.
5. **Identificador de modelo fijado.** `ANTHROPIC_MODEL_ID` se resuelve
   en runtime y se cita en la sección de métodos de la tesis (ADR-005).
6. **Graceful KB degradation.** Si un knowledge block está vacío, el
   prompt builder omite esa sección — el LLM cae a su conocimiento
   general en vez de alucinar citas. ADR-018.

## Knowledge base structure (`lib/knowledge/`)

### Las 4 fuentes de conocimiento

| File | Source | Public domain? |
|---|---|---|
| `big-five.ts` | IPIP-NEO (Goldberg 1999) | sí |
| `jung-functions.ts` | Tipos Psicológicos (Jung 1921) | sí (traducción al español) |
| `archetypes.ts` | Pearson aplicado (Pearson 1986, 1991) | uso de la taxonomía |
| `positive-computing.ts` | Calvo & Peters (2014) | uso de la taxonomía |

**NO se usa**: NEO-PI-R (Costa & McCrae 1992) — propietario, no
distribuible en repositorio público. Sustituido por IPIP-NEO según
[DECISIONS.md ADR-015](DECISIONS.md).

### KB item structure (enforced por `citation-check.test.ts`)

Todo item de un knowledge array DEBE tener un comentario JSDoc inmediatamente arriba:

```ts
/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newNEOFacetsKey.htm
 * @page_or_section "Openness — Imagination facet"
 * @verbatim false
 */
```

Definido en ADR-018. CI test parsea todos los KB files y falla si
algún item no tiene el bloque.

## Prompt builders (`lib/prompts/`)

### Inventario

| File | Purpose | Temperature | Streaming |
|---|---|---|---|
| `interpret-narrative.ts` | Pass 1.5 — lectura interpretativa Jung + arquetipo a partir del Big Five medido por el módulo ML | 0 | No, JSON mode |
| `analyze-evidence.ts` | Pass 2 — phrase-level evidence highlights | 0.3 | No |
| `generate-narrative.ts` | Retrato narrativo (800-1200 palabras) | 0.7 | Yes, SSE |
| `chat-context.ts` | System prompt para chat contextualizado | 0.5 | Yes, SSE |
| `crisis-classifier.ts` | Clasificador de crisis (JSON mode) | 0 | No |
| `development-plan.ts` | Plan de desarrollo en 3 áreas | 0.4 | No |

`analyze-profile.ts` quedó como helper deprecated cuando la inferencia
Big Five se trasladó al módulo analítico propio (ADR-026). El flujo
actual usa `interpret-narrative.ts` como Pass 1.5.

### Pattern de construcción

```ts
import { buildJungBlock } from '@/lib/knowledge/jung-functions';
import { buildArchetypesBlock } from '@/lib/knowledge/archetypes';

export function buildInterpretNarrativePrompt(params: InterpretNarrativeParams): { system: string; prompt: string } {
  const sections: string[] = [];
  sections.push(buildBigFiveBlock(params.bigFive));  // del módulo ML
  const jung = buildJungBlock();
  if (jung) sections.push(`## Funciones cognitivas Jung (insumo narrativo)\n${jung}`);
  const arch = buildArchetypesBlock();
  if (arch) sections.push(`## Arquetipos Pearson (insumo narrativo)\n${arch}`);
  sections.push(`## Textos introspectivos del usuario\n${textBlock}`);
  sections.push(INSTRUCTIONS);
  return { system: SYSTEM, prompt: sections.join('\n\n') };
}
```

Los `if (block)` evitan que un knowledge block vacío se renderice como
placeholder y empuje al LLM a alucinar citas.

## Capa interpretativa: anatomía de `interpret-narrative.ts`

El prompt más importante del flujo de análisis. Recibe los Big Five
medidos por el módulo ML y produce el JSON con la lectura
interpretativa.

### Estructura

```
[System — intérprete narrativo, no diagnóstico]
    ↓
[Big Five medido por el módulo ML + per_dimension_status]
    ↓
[Jung functions knowledge block]
    ↓
[Archetypes knowledge block]
    ↓
[User's introspective text]
    ↓
[Instructions]
  1. Inferir Jung functions 0-100 (lectura interpretativa)
  2. Asignar arquetipo dominante + secundario
  3. Reportar confianza global de la lectura
  4. Justificar citando evidencia textual
    ↓
[Output schema: JSON]
    ↓
[Reglas]
  - No inventar valores Big Five (los del módulo ML son verdad de medida)
  - No usar lenguaje diagnóstico ni MBTI
  - Aclarar que Jung + arquetipo son LECTURA INTERPRETATIVA
  - Español latinoamericano (voseo)
```

### Output schema (validado por Zod post-parse)

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
  reasoning: z.string().min(100).max(2000),
})
```

Out-of-range scores se clampean. Malformed JSON dispara 1 retry con
instrucción de JSON más fuerte; segundo fallo → 503.

### Manejo de `per_dimension_status`

El módulo ML envía un `per_dimension_status` por dimensión Big Five
(`"ok" | "low_confidence"`, ADR-027). Si alguna dimensión llega como
`low_confidence`, el prompt lo declara explícitamente y modera la
lectura interpretativa correspondiente (por ejemplo, no interpreta
con fuerza una función Jung dependiente de una dimensión Big Five
marcada como preliminar).

## Crisis classifier prompt

### Purpose
Corre después del pre-filtro regex `crisis-lexicon.ts`. Mira el último
turno del usuario + el turno previo del asistente como contexto y
devuelve un veredicto JSON estructurado. **Fail-closed**: cualquier
error trata el mensaje como crisis.

### System prompt (anatomía)

```
Sos un clasificador de riesgo para una app argentina de autoconocimiento.
Tarea: determinar si un mensaje del usuario indica crisis emocional activa.

Sos consciente de modismos argentinos:
- "me quiero matar estudiando" = frustración académica, NO ideación suicida
- "me muero de hambre" = exageración, NO crisis
- "estoy hecho bolsa" = agotamiento, NO crisis

Señales reales de crisis:
- Ideación suicida explícita
- Plan concreto
- Autolesión activa
- Psicosis activa
- Consumo agudo con riesgo

Respondé sólo con JSON válido:
{ "is_crisis": boolean, "severity": "low" | "med" | "high", "reasoning": "breve" }

Ante duda → is_crisis=true con severity="low" o "med".
El costo de un falso positivo es mucho menor que un falso negativo.
```

### Failure modes (fail-closed)

- Timeout → `classifier_error` → crisis card.
- Malformed JSON → `classifier_error` → crisis card.
- Refusal → `classifier_error` → crisis card.
- Out-of-schema → `classifier_error` → crisis card.

Todos los failures se loggean en `crisis_events` (ADR-008) con
`severity='classifier_error'` para revisión manual.

## Evaluación del clasificador de crisis (`lib/evals/`)

[`lib/evals/crisis-eval.ts`](../lib/evals/crisis-eval.ts) ejecuta el
pipeline contra los 100 casos etiquetados de
[`lib/evals/crisis-dataset.ts`](../lib/evals/crisis-dataset.ts) y
computa precision, recall, F1 y matriz de confusión por categoría
(real_crisis / idiom / borderline / safe).

Umbrales operativos:
- `recall ≥ 0.95` (prioridad alta — ver ETHICS.md, líneas rojas).
- `precision ≥ 0.85`.

El test `lib/evals/crisis-eval.test.ts` falla en CI si recall cae por
debajo de 0.95 sobre la corrida controlada.

## Tests específicos de prompts

### Unit
- `lib/knowledge/build-block.test.ts` — skip-if, separator, empty input.
- `lib/knowledge/citation-check.test.ts` — todos los items con JSDoc completo.
- `lib/prompts/*.test.ts` — prompt builders producen estructura
  esperada para input conocido.

### Integration
- `lib/evals/crisis-eval.test.ts` — crisis classifier pipeline contra
  dataset etiquetado.

### E2E
- `app/api/analyze/route.test.ts` — flujo analyze con módulo ML
  mockeado y capa narrativa mockeada.
- `e2e/full-flow.spec.ts` — flujo completo end-to-end real.

## Rules summary

1. **Never define prompts inline.** Siempre en `lib/prompts/*.ts`.
2. **Never hardcode model name.** Usar `ANTHROPIC_MODEL_ID` env var.
3. **Never skip the citation block on KB items.** CI test falla.
4. **Never paraphrase user text back to the LLM without quoting.**
   Pass 2 evidence highlights preserva quotes verbatim.
5. **Never swallow classifier errors as "not crisis".** Fail-closed
   es el único comportamiento seguro.
6. **Never infer Big Five from a prompt.** Es responsabilidad del
   módulo analítico (`ml/`, ADR-026).

## See also

- [DECISIONS.md](DECISIONS.md) — ADR-002 (Jung interpretativo), ADR-005
  (model ID env var), ADR-018 (citation format), ADR-026 (módulo
  analítico), ADR-027 (per_dimension_status).
- [tech/EVALS.md](tech/EVALS.md) — eval methodology deep-dive.
- [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md) — crisis classifier
  integration.
- [features/ANALYSIS.md](features/ANALYSIS.md) — analysis feature spec.
- [biz/TFG.md](biz/TFG.md) — estructura de tesis y cronograma.
- [ml/README.md](../ml/README.md) — módulo analítico.
