# Resultados

<!-- FUENTE: síntesis de capítulos 08 + 09. -->

> Capítulo de síntesis. Recoge los hallazgos de validación
> computacional (métricas del módulo analítico, tests automatizados,
> evaluación del clasificador de crisis) y validación con usuarios
> (SUS + codificación temática) en una narrativa única que responde
> las cuatro preguntas de investigación.

## Respuesta a las preguntas de investigación

### RQ1 — Arquitectura híbrida

<!-- PENDIENTE: responder con la integración medida vs interpretativa
     verificada en el sistema (ADR-026 + ADR-002 + ADR-007), los
     tests E2E que cubren el flujo completo y la separación de
     responsabilidades visible en el código. -->

### RQ2 — Métricas Big Five por dimensión

<!-- PENDIENTE: responder con la tabla de MSE/R²/r por dimensión
     sobre el bloque latinoamericano_only, indicando qué
     dimensiones superan los umbrales R² > 0.20 y r > 0.30 y cuáles
     quedan marcadas como per_dimension_status: low_confidence. -->

### RQ3 — Cumplimiento normativo y safety

<!-- PENDIENTE: responder con la matriz de cumplimiento Ley 25.326
     (5 mecanismos), los principios Positive Computing
     operacionalizados en el system prompt, y los resultados de la
     evaluación del clasificador de crisis (precision/recall/F1
     por categoría). -->

### RQ4 — Usabilidad percibida (SUS)

<!-- PENDIENTE: responder con datos de SUS (promedio, stddev,
     comparación con mediana histórica del instrumento) + temas
     cualitativos relevantes. -->

## Contribuciones

<!-- PENDIENTE: enumerar las contribuciones concretas del TFG:

     1. Sistema Umbra como artefacto de software funcional con
        arquitectura híbrida medido vs interpretativo.
     2. Módulo analítico open-source con pipeline reproducible
        (DVC + MLflow + DistilBERT congelado + Ridge multi-output)
        replicable en otros productos de inferencia de
        personalidad por texto.
     3. Plantilla de cumplimiento Ley 25.326 con cinco mecanismos
        técnicos implementados (consent text hash SHA-256,
        exportación, rectificación, cancelación con magic link,
        oposición a investigación), referencia para productos
        similares en jurisdicción argentina.
     4. Threat model STRIDE documentado para un producto de datos
        psicológicos sensibles.
     5. Dataset balanceado de 100 casos de crisis etiquetados en
        español latinoamericano (sin PII, paraphraseado, sin
        detalle operacional) como referencia para evaluar
        clasificadores en superficies similares.
     6. ADRs que documentan las decisiones arquitectónicas con
        trazabilidad completa.
-->
