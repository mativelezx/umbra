# Metodología

<!-- FUENTE PRIMARIA: docs/biz/VALIDATION.md — reformatear a prosa
     académica manteniendo la estructura de hipótesis + diseño +
     instrumentos + análisis. -->

> El plan detallado vive en [`docs/biz/VALIDATION.md`](../docs/biz/VALIDATION.md).
> Este capítulo de la tesis presenta la metodología en formato narrativo
> académico, sin duplicar el nivel de detalle operacional. Las tablas y
> protocolos específicos se incluyen como referencia en Anexos.

## Enfoque mixed-methods (Branch B + M3)

<!-- FUENTE: ADR-023, docs/biz/VALIDATION.md. -->

Umbra adopta una metodología mixed-methods de dos pilares:

1. **Pilar computacional** (primary evidence) — tres hipótesis
   preregistradas en OSF que miden propiedades del sistema sin requerir
   sujetos humanos: H1 (determinismo), H2 (robustez a paráfrasis),
   H3 (precision/recall del crisis classifier).
2. **Pilar con usuarios** (secondary validation) — estudio think-aloud
   M3 con reclutamiento controlado de 8-10 participantes, SUS en español
   rioplatense + coding temático.

## H1 — Determinismo del análisis

<!-- FUENTE: docs/biz/VALIDATION.md sección H1. -->

**Hipótesis**: dado temperature=0 y modelo SKU fijado, analizar el mismo
texto produce scores Big Five con stddev<2.5 en 5 corridas consecutivas
sobre todos los casos del corpus.

<!-- PENDIENTE: expandir con diseño, muestra, variables, análisis. -->

## H2 — Robustez a paráfrasis

<!-- FUENTE: docs/biz/VALIDATION.md sección H2. -->

**Hipótesis**: dadas 3 paráfrasis semánticamente preservantes (Sonnet +
Haiku, intra-vendor por ADR-020), los scores Big Five del texto
parafraseado desvían <10 puntos del original.

<!-- PENDIENTE: expandir con diseño, limitación intra-vendor. -->

## H3 — Safety empírico del crisis classifier

<!-- FUENTE: docs/biz/VALIDATION.md sección H3, docs/tech/CHAT_SAFETY.md. -->

**Hipótesis**: el pipeline de 2 etapas (regex con idioms argentinos +
Claude classifier fail-closed) alcanza recall≥0.95 y precision≥0.85
sobre un dataset etiquetado de 100 casos balanceados (25 real_crisis,
25 idiom, 25 borderline, 25 safe).

<!-- PENDIENTE: expandir — recall priorizada sobre precision,
     justificación ética de los umbrales. -->

## M3 — Think-aloud con reclutamiento controlado

<!-- FUENTE: docs/biz/VALIDATION.md sección M3. -->

**Pregunta**: ¿es Umbra percibido como usable y alineado con autonomía
y competencia del Positive Computing por usuarios reales del perfil
target? Umbral: SUS promedio ≥ 68 (baseline Sauro 2011).

<!-- PENDIENTE: expandir con reclutamiento, consentimiento Ley 25.326,
     protocolo de sesión, SUS + coding temático, plan B si n<8. -->

## Preregistro OSF y reproducibilidad

<!-- FUENTE: ADR-012, ADR-014, docs/biz/TFG.md sección Preregistration. -->

<!-- PENDIENTE: explicar el uso del Standard Prereg template con framing
     computacional, los committed cache snapshots (ADR-014), y el DOI
     que se obtiene al submitir. -->

## Ética de investigación

<!-- FUENTE: docs/biz/ETHICS.md. -->

<!-- PENDIENTE: Declaración de Helsinki + Calvo & Peters + red lines
     éticas de Umbra + por qué no se requiere comité de ética formal
     para M3 (usability testing informal con consentimiento escrito). -->
