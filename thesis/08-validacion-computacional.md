# Validación computacional (H1, H2, H3)

<!-- FUENTE PRIMARIA: eval-results/*.json (a generar en corridas finales)
     + docs/biz/VALIDATION.md. -->

> Este capítulo reporta los resultados de las tres hipótesis computacionales
> preregistradas en OSF. Cada sección incluye (a) recordatorio de la
> hipótesis, (b) procedimiento ejecutado, (c) resultados cuantitativos,
> (d) discusión. La reproducibilidad se garantiza por los committed cache
> snapshots (ADR-014) — cualquier reviewer puede correr
> `npm run eval:h1 -- --from-cache` contra el commit hash citado.

## H1 — Determinismo

**Hipótesis**: stddev < 2.5 en 5 corridas por caso con temperature=0 y
modelo SKU pinned sobre todos los casos del corpus.

**Procedimiento**:
<!-- PENDIENTE: describir la ejecución (fecha, commit hash, corpus size,
     modelo exacto usado, iteraciones totales). -->

**Resultados**:
<!-- PENDIENTE: tabla con stddev promedio + máximo + desviaciones por
     caso que fallen si las hay. -->

**Discusión**:
<!-- PENDIENTE: interpretar el overallPass. Si pasa, explicar qué
     significa para la reproducibilidad del instrumento. Si falla, ser
     honest sobre qué dimensiones fallaron y por qué. -->

## H2 — Robustez a paráfrasis

**Hipótesis**: max pairwise delta < 10 con 3 paráfrasis (Sonnet + Haiku
intra-vendor por ADR-020) sobre todos los casos.

**Procedimiento**:
<!-- PENDIENTE. -->

**Resultados**:
<!-- PENDIENTE: tabla con delta máximo por dimensión por caso. -->

**Discusión**:
<!-- PENDIENTE: discutir la limitación intra-vendor explícitamente
     (ADR-020) como amenaza a validez externa. -->

## H3 — Precision y recall del crisis classifier

**Hipótesis**: recall ≥ 0.95 AND precision ≥ 0.85 sobre dataset etiquetado
n=100 (25 real_crisis, 25 idiom, 25 borderline, 25 safe).

**Procedimiento**:
<!-- PENDIENTE: describir la corrida, el forceClassifierOnSafe usado o no,
     el tiempo de ejecución. -->

**Resultados**:
<!-- PENDIENTE: matriz de confusión (TP/TN/FP/FN) + precision/recall/F1 +
     breakdown por categoría. Qué casos fallaron (los borderline son
     los más probables). -->

**Discusión**:
<!-- PENDIENTE: justificar por qué recall se prioriza sobre precision
     (false negative en crisis es peor que false positive). Discutir los
     edge cases borderline — son las líneas difusas donde un clasificador
     razonable podría ir en cualquier dirección. -->

## Reproducibilidad

<!-- PENDIENTE: citar el commit hash del repo + el snapshot en
     lib/evals/.cache/ + el DOI del preregistro OSF + cómo replay
     offline. -->

## Limitaciones

- H2 intra-vendor (ADR-020)
- IPIP-NEO como substituto de NEO-PI-R (ADR-015)
- Corpus n=33 (vs preregistrado 50) — documentar si aplica
- Dataset H3 generado con asistencia de codex (requirió revisión humana)
