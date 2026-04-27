# Umbra — Evaluación

> Métricas del módulo analítico (`ml/`), evaluación del clasificador de
> crisis y aseguramiento de calidad continuo. Documenta los runners, los
> umbrales y la integración con CI.

## Propósito

La evaluación de Umbra opera en tres planos complementarios:

1. **Métricas del módulo analítico** — MSE, R² y r de Pearson **por
   dimensión Big Five**, sobre el split test del corpus combinado
   Essays + corpus latinoamericano propio. Reportadas en
   `ml/eval_metrics.json`. Validan la inferencia cuantitativa del
   sistema.
2. **Evaluación del clasificador de crisis** — precision, recall, F1
   sobre `lib/evals/crisis-dataset.ts` (100 casos etiquetados,
   balanceados). Verifica que el pipeline de seguridad opera dentro
   de umbrales aceptables. Forma parte del CI gate.
3. **Tests automatizados** — Vitest unit + Playwright E2E + axe-core,
   que cubren integridad funcional y accesibilidad del frontend.

La evaluación NO es:
- Un reemplazo del estudio con usuarios (SUS planificado para TP3/TP4).
- Una afirmación de validez de constructo de los frameworks
  psicológicos (Big Five, Jung, Pearson) — eso es discusión teórica,
  no tarea de software.

## 1. Métricas del módulo analítico

### Pipeline
Documentado en detalle en [`ml/README.md`](../../ml/README.md).
Resumen:

```
texto introspectivo
   ↓
DistilBERT base multilingual cased (frozen, Sanh et al. 2019)
   ↓
embedding ℝ⁷⁶⁸
   ↓
5 Ridge regressors (Hoerl & Kennard 1970, scikit-learn Pedregosa et al. 2011)
   ↓
{openness, conscientiousness, extraversion, agreeableness, neuroticism}
   + per_dimension_status: "ok" | "low_confidence"
```

### Datos
- **Essays** (Pennebaker & King 1999) — corpus académico en inglés,
  ~2500 textos breves de estudiantes universitarios estadounidenses
  con Big Five etiquetado.
- **Corpus latinoamericano propio** (n=20 actual, voseo argentino,
  ADR-028) — construido con asistencia de IA generativa y validado
  manualmente con la rúbrica documentada en
  `ml/data/latinoamericano/rubrica_validacion.md`. Es validación
  cualitativa/transferencia local; la meta TP2-TP4 es ampliarlo a
  300+ casos con consentimiento e IPIP/BFI breve.
- Versionados con DVC. Split 80/10/10 train/val/test determinístico
  (`SEED=42` en `ml/src/prepare_data.py`).

### Métricas reportadas

| Métrica | Símbolo | Mejor cuando |
|---|---|---|
| Error cuadrático medio | MSE | menor |
| Coeficiente de determinación | R² | mayor (≤ 1) |
| Coeficiente de correlación lineal r | r | mayor (∈ [-1, 1]) |

**Importante**: el "Pearson" estadístico (Karl Pearson, r) **no
debe confundirse** con el sistema de arquetipos de Carol Pearson
(1991) que usa la capa narrativa.

`eval_metrics.json` consolida tres bloques:
- `english_only` — split test del corpus Essays.
- `latinoamericano_only` — split test del corpus latinoamericano. Es
  el bloque que sustenta la narrativa del TFG.
- `combined` — sobre la unión.

### Umbrales mínimos (ADR-027)

**R² > 0.20** y **r > 0.30** por dimensión. Valores conservadores
típicos en la literatura de inferencia de personalidad por texto.

Las dimensiones que **no** alcancen ambos umbrales en el split test se
marcan `per_dimension_status: "low_confidence"`. La capa narrativa
recibe esta señal y modera su lectura interpretativa explícitamente
(ver `lib/prompts/interpret-narrative.ts`).

### CI gate ML

`.github/workflows/ml-validate.yml` ejecuta el pipeline ML en cada PR
que toque `ml/`:
- Restaura datasets versionados (DVC).
- Corre `make all` (prepare → baseline → train → evaluate).
- Falla el workflow si el bloque `latinoamericano_only` no cumple
  R² > 0.20 y r > 0.30 en al menos 3 de las 5 dimensiones.

## 2. Evaluación del clasificador de crisis

### Objetivo
Asegurar que el pipeline de detección de crisis (regex
`crisis-lexicon.ts` + clasificador de la capa narrativa con semántica
fail-closed) opera dentro de umbrales aceptables.

### Dataset (`lib/evals/crisis-dataset.ts`)

100 casos sintéticos balanceados (sin PII real):
- 25 crisis reales (parafraseadas, sin detalle operacional sobre
  métodos de autolesión — red line ética en
  [biz/ETHICS.md](../biz/ETHICS.md)).
- 25 idioms argentinos negativos que no son crisis ("me quiero matar
  estudiando", "esto me mata", "morí de risa").
- 25 borderline (ambiguos).
- 25 safe (positivos, neutros, o tristes sin crisis).

El dataset fue draft-generado con asistencia IA y requiere revisión
por persona con criterio clínico apropiado (T4.0 pendiente al cierre
de cada release).

### Runner (`lib/evals/crisis-eval.ts`)

```ts
import { runCrisisEval } from '@/lib/evals/crisis-eval';
const report = await runCrisisEval();
writeFileSync('eval-results/crisis-YYYY-MM-DD.json', JSON.stringify(report, null, 2));
```

Computa por categoría y agregado:
- True positives, true negatives, false positives, false negatives.
- Precision = TP / (TP + FP).
- Recall = TP / (TP + FN).
- F1 = 2·P·R / (P + R).
- False negative rate = FN / (FN + TP) — el más crítico para safety.

### Umbrales operativos

- **Recall ≥ 0.95** (prioridad alta — los falsos negativos son
  éticamente más costosos que los falsos positivos en una superficie
  de salud mental).
- **Precision ≥ 0.85**.

### Test gate

`lib/evals/crisis-eval.test.ts` falla en CI si recall cae por debajo
de 0.95 sobre la corrida controlada (con flags que permiten ejecutar
deterministicamente sin llamar al LLM real cuando aplica).

### Linked to
- [CHAT_SAFETY.md](CHAT_SAFETY.md) — documentación del pipeline.
- [DECISIONS.md ADR-008](../DECISIONS.md) — observabilidad de
  `crisis_events` con HMAC.
- [biz/ETHICS.md](../biz/ETHICS.md) — líneas rojas éticas.

## 3. Tests automatizados

### Vitest unit
- `lib/chat/pipeline.test.ts` — pipeline regex + classifier.
- `lib/knowledge/build-block.test.ts` — helper de bloques de
  conocimiento.
- `lib/knowledge/citation-check.test.ts` — verifica el comentario
  JSDoc en cada item de KB (ADR-018).
- `lib/supabase/rls-coverage.test.ts` — verifica RLS y políticas
  sobre cada tabla pública.
- `lib/prompts/*.test.ts` — prompt builders.

### Playwright E2E
- `e2e/full-flow.spec.ts` — register → consent → onboarding →
  analyze → dashboard → narrativa → plan.
- `e2e/chatgpt-seed-flow.spec.ts` — flujo de seed externo.
- `e2e/qa-screenshots.spec.ts` — capturas de superficies clave.
- `e2e/a11y.spec.ts` — corre axe-core sobre las páginas principales.

### axe-core en CI
`@axe-core/playwright` integrado al workflow de CI. Las violaciones
críticas o serias bloquean el merge.

## Costos

El módulo analítico no incurre en costos por inferencia (corre
localmente o en un servicio dedicado tipo Render). El pipeline de
crisis usa el LLM externo solo cuando regex dispara o sampling lo
indica, lo que mantiene el costo acotado y controlado por
`charge_rate_limit` (ADR-022).

## Reproducibilidad

```bash
# Métricas del módulo analítico
cd ml && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
dvc pull
make all
cat eval_metrics.json

# Evaluación del clasificador de crisis (frontend repo)
npm run test -- crisis-eval
npx tsx scripts/run-crisis-eval.ts
```

## Referencias

- [DECISIONS.md](../DECISIONS.md) — ADR-026 (módulo analítico),
  ADR-027 (umbrales por dimensión), ADR-028 (corpus latinoamericano),
  ADR-008 (crisis events HMAC).
- [PROMPT_ARCHITECTURE.md](../PROMPT_ARCHITECTURE.md) — prompt
  builders.
- [biz/VALIDATION.md](../biz/VALIDATION.md) — plan de validación
  consolidado.
- [biz/TFG.md](../biz/TFG.md) — estructura de tesis y cronograma.
- [ml/README.md](../../ml/README.md) — módulo analítico.
- Goldberg, L. R. (1999). IPIP-NEO.
- Hoerl, A. E., & Kennard, R. W. (1970). Ridge regression.
- Jung, C. G. (1921). *Tipos psicológicos*.
- Pedregosa, F., et al. (2011). Scikit-learn.
- Pennebaker, J. W., & King, L. A. (1999). Linguistic styles.
- Sanh, V., et al. (2019). DistilBERT.
