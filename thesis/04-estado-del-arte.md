# Estado del arte

<!-- FUENTE PRIMARIA: docs/biz/MARKET.md + outputs del skill /research
     que revisaron el paisaje 2026. -->

## Productos comerciales de autoconocimiento 2026

<!-- PENDIENTE: expandir con screenshots + tabla comparativa de features. -->

Referencia rápida:

| Producto | Base teórica | IA generativa | Trazabilidad | Validación empírica | Open source |
|---|---|---|---|---|---|
| 16Personalities | MBTI | No | Baja | No pública | No |
| Crystal Knows | DISC | Parcial | Baja | No pública | No |
| Pattern | MBTI + astrología | No | Muy baja | No | No |
| Truity | Big Five / Enneagram | No | Media | Papers citados | No |
| **Umbra** | **Jung + Big Five + Positive Computing** | **Sí (Claude)** | **Alta** | **H1/H2/H3 preregistradas** | **Sí** |

## Literatura académica relevante

<!-- PENDIENTE: citar papers sobre LLM + personality assessment,
     AI chatbot usability, crisis detection in conversational AI. -->

- Brown University (2024) identificó 15 riesgos éticos en chatbots de "terapia" con IA.
- Illinois (2025) — Wellness and Oversight for Psychological Resources Act.
- Caso "Noni": chatbot que dio información de ubicación de puentes tras
  mencionar pérdida de trabajo — ejemplo canónico de fail-open.
- **Nielsen & Landauer (1993)**: el modelo matemático de detección de
  problemas de usabilidad — justifica n=5-10 para estudios tipo M3.

## Google PAIR — People + AI Guidebook

<!-- FUENTE: output del skill /research; ADR-025. -->

Umbra aplica explícitamente las heurísticas de los 6 capítulos del PAIR
Guidebook en su diseño, documentado en ADR-025. Capítulos relevantes:

1. User Needs + Success Definition
2. Data Collection + Evaluation
3. **Mental Models** (aplicado en pull quotes + line-length + TOC)
4. **Explainability + Trust** (aplicado en confidence surface + InfoPopover)
5. **Feedback + Control** (aplicado en InsightPing collapsible + QuickPromptChips persistentes)
6. Errors + Graceful Failure (aplicado en crisis fail-closed pipeline)

## Gap que Umbra llena

<!-- PENDIENTE: articular el gap en 1 párrafo — trazabilidad +
     validación preregistrada + open source + ética Ley 25.326. -->
