# Umbra — Plan de Implementación TFG

> Tracking del plan operativo para completar el TFG. Fases secuenciales,
> QA Gate estándar al cierre de cada una. La estrategia de validación
> consolidada vive en [VALIDATION.md](VALIDATION.md).

## Estado de ejecución

Las fases de código están consolidadas. La tabla siguiente resume los
bloques principales:

| Bloque | Scope | Estado |
|---|---|---|
| **Web base** — fases 1 a 7 del UMBRA_MASTER_BUILD.md | scaffolding, auth, consent, onboarding dinámico, dashboard, narrativa SSE, chat con guardrails, plan, PDF export, polish | completo |
| **Módulo analítico (`ml/`)** | DistilBERT congelado + Ridge multi-output + FastAPI + DVC + MLflow + CI ml-validate.yml | en curso (entrenamiento + métricas finales pendientes) |
| **Migration 004** — consent_text_hash + locale (ADR-024) | SQL + route update + verbatim text file + LEGAL.md | completo |
| **Mermaid diagrams** | ARCHITECTURE.md con diagramas Mermaid | completo |
| **STRIDE threat model** | THREAT_MODEL.md por componente | completo |
| **axe-core en CI** | spec + workflow update | completo |
| **Materiales SUS** | protocolo + consentimiento + cuestionario + recruitment copy | completo |
| **Esqueleto de tesis** | 16 capítulos + README + Pandoc build | completo |
| **CI tests RLS** | `lib/supabase/rls-coverage.test.ts` | completo |

**Pendiente (actividades humanas, no de código)**:

- Cierre de entrenamiento del módulo analítico y verificación de
  métricas mínimas (R² > 0.20, r > 0.30) por dimensión.
- Sesiones SUS (n=8-15) en TP3/TP4 según el cronograma de TFG.md.
- Revisión clínica del dataset de crisis por persona con criterio
  apropiado (pendiente desde la primera draft generación con asistencia
  IA).
- Capítulos personales de la tesis: 00 Portada, 01 Resumen, 02
  Introducción, 11 Discusión, 12 Conclusiones.

## Contexto

- **Autor**: Matías Vélez.
- **Programa**: Ingeniería en Software — Universidad Siglo 21.
- **Entregable**: TFG (monografía + artefacto de software).
- **Cronograma oficial**: TP1 ya entregado (26 abril 2026); TP2 (17
  mayo), TP3 (7 junio), TP4 (28 junio); defensa agosto/septiembre. Ver
  [TFG.md](TFG.md).

## Decisiones clave

1. **Arquitectura híbrida** — capa analítica propia (módulo ML en
   `ml/`, ADR-026) + capa narrativa LLM externa (ADR-005). Reporte
   por dimensión Big Five con `per_dimension_status` (ADR-027) y
   corpus latinoamericano construido con asistencia IA + rúbrica
   manual (ADR-028).
2. **Jung como lectura interpretativa, no medida** (ADR-002 + ADR-007):
   las funciones cognitivas y el arquetipo se derivan en la capa
   narrativa a partir de los Big Five inferidos por el módulo ML y de
   los textos del usuario.
3. **Consentimiento Ley 25.326 con SHA-256 verbatim** (ADR-024).
4. **Pipeline de crisis fail-closed** con recursos argentinos.
5. **Scrum semanal** + ADRs (Nygard 2011) como práctica metodológica.

---

## QA Gate Estándar

Corre al cierre de cada release o sprint relevante. Si cualquier item
falla, no se promueve a producción hasta arreglarlo.

```
[ ] 1. TypeScript strict:     pnpm exec tsc --noEmit            → 0 errores
[ ] 2. Build:                  pnpm build               → success
[ ] 3. Unit tests:             pnpm test                → 100% passing
[ ] 4. E2E relevante:          pnpm exec playwright test <spec>  → passing
[ ] 5. Lint:                   pnpm lint                → 0 errores
[ ] 6. Sin console.log:        grep app/ components/ lib/  → 0 hits
[ ] 7. Sin `: any` nuevos:     grep app/ components/ lib/  → count estable
[ ] 8. Visual check:           Playwright screenshots      → archivadas
[ ] 9. Docs actualizadas:      ADR + feature doc + VALIDATION → committed
[ ] 10. axe-core:               sin violaciones críticas/serias
[ ] 11. ML metrics gate:        eval_metrics.json sin incoherencias: dimensiones bajo umbral quedan low_confidence; si la etiqueta es binaria (Essays 0/100), reportar AUC/F1/balanced accuracy además de R²/r.
```

---

## Fase web inicial (UMBRA_MASTER_BUILD.md fases 1-7)

Documentada en detalle en [`UMBRA_MASTER_BUILD.md`](../../UMBRA_MASTER_BUILD.md)
y [`PLAN.md`](../PLAN.md) sección "Status dashboard". Resumen:

- **Fase 1** — Scaffolding + config.
- **Fase 1.5** — SSR migration, errores tipados, peppers Web Crypto,
  Vitest + Playwright, migration 002.
- **Fase 2** — Auth + Landing + Layout + Consent + i18n.
- **Fase 3** — Onboarding dinámico + AI analysis + KB + carta al futuro.
- **Fase 4** — Dashboard con Big Five radar, Jung bars, archetype card.
- **Fase 5** — Narrative SSE streaming + Chat con guardrails completos.
- **Fase 6** — Plan de desarrollo + PDF export + a11y + print stylesheet.
- **Fase 7** — Polish + deploy + smoke tests.

---

## Sprints del módulo analítico (`ml/`)

Cronograma alineado con [TFG.md](TFG.md):

### Sprint ML 1 — Datasets + baseline (11-24 mayo 2026)
- Preparar Essays (descarga + acceso académico).
- Ampliar corpus latinoamericano propio: n=20 actual, meta mínima TP2-TP4 n=300 con consentimiento, texto introspectivo e IPIP/BFI breve.
  contra la rúbrica documentada en
  `ml/data/latinoamericano/rubrica_validacion.md`.
- Versionar ambos corpus con DVC (split 80/10/10 con `SEED=42`).
- Baseline TF-IDF + Ridge multi-output (`ml/src/baseline_tfidf.py`)
  para tener una línea base contra la cual comparar embeddings.
- Registrar el experimento baseline en MLflow.

### Sprint ML 2 — Embeddings + Ridge final (25 mayo – 7 junio)
- Extraer embeddings DistilBERT base multilingual cased congelados
  sobre la unión Essays + corpus latinoamericano
  (`ml/src/extract_embeddings.py`).
- Entrenar 5 regresores Ridge con `GridSearchCV` para tunear `alpha`
  por dimensión (`ml/src/train_ridge.py`).
- Registrar métricas (MSE, R², r) por dimensión en MLflow para los
  tres bloques: `english_only`, `latinoamericano_only`, `combined`.
- Serializar artefactos en `ml/models/*.joblib`.

### Sprint ML 3 — Validación + serving (8-21 junio)
- Verificar que las métricas del bloque `latinoamericano_only`
  cumplen R² > 0.20 y r > 0.30 en al menos 3 de las 5 dimensiones.
  Las que no pasen se marcan `low_confidence` (ADR-027).
- Documentar cualquier dimensión `low_confidence` en
  `eval_metrics.json` y en la sección 9 de la tesis.
- Verificar reproducibilidad end-to-end vía `make all` y `dvc repro`.
- Levantar FastAPI (`ml/src/api_server.py`) y validar el endpoint
  `POST /infer` desde el frontend via `lib/ml-client.ts`.

---

## Validación SUS — TP3/TP4 (22 junio – 5 julio)

Materiales listos en [`docs/research/`](../research/):
- `usability-protocol.md` — guion minuto a minuto de las sesiones.
- `usability-recruitment.md` — copy de reclutamiento (WhatsApp, email).
- `sus-spanish-latinoamericano.md` — cuestionario SUS adaptado.
- `content/consent/research-m3-v1-es-AR.md` — consentimiento informado.

Ejecución:
1. Reclutar 8-15 participantes (3-5 días).
2. Agendar y ejecutar sesiones de 40 min (1 semana).
3. Transcribir y anonimizar (1 semana).
4. Análisis cuantitativo (promedio SUS + stddev + comparación con
   mediana histórica) y cualitativo (codificación temática inductiva
   con citas verbatim).
5. Reporte en el capítulo 9 de la tesis.

---

## Tesis (paralelo a sprints ML y SUS)

Estructura completa en [`thesis/README.md`](../../thesis/README.md). El
esqueleto de los 16 capítulos está listo; los técnicos (03 marco
teórico, 06 arquitectura, 08 validación) están drafteados; los
personales (00, 01, 02, 11, 12) quedan a cargo del autor.

---

## Scope explícitamente FUERA del TFG

Documentados en el capítulo 13 de la tesis como trabajo futuro:

- Cross-vendor en la capa narrativa (comparación con un proveedor
  alternativo de IA generativa).
- Validación con n≥30 participantes y comité de ética formal.
- Longitudinal test-retest con usuarios reales (requiere
  consentimiento especial y diseño temporal).
- Migración del módulo analítico a un modelo entrenado fine-tuned
  (vs los embeddings congelados actuales).

---

## Timeline consolidado

| Semana | Actividad |
|---|---|
| TP1 entregado | 26 abril 2026 |
| Sprint ML 1 | 11-24 mayo |
| TP2 | 17 mayo |
| Sprint ML 2 | 25 mayo - 7 junio |
| TP3 | 7 junio |
| Sprint ML 3 | 8-21 junio |
| Validación SUS | 22 junio - 5 julio |
| TP4 | 28 junio |
| Tesis final + correcciones | julio-agosto |
| Defensa | agosto/septiembre |

---

## Referencias cruzadas

- [DECISIONS.md](../DECISIONS.md) — ADRs.
- [VALIDATION.md](VALIDATION.md) — plan de validación consolidado.
- [TFG.md](TFG.md) — estructura de tesis y cronograma.
- [ETHICS.md](ETHICS.md) — Helsinki + Calvo & Peters.
- [CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) — pipeline de crisis.
- [ARCHITECTURE.md](../tech/ARCHITECTURE.md) — topología y diagramas.
- [ml/README.md](../../ml/README.md) — módulo analítico.

## Changelog

| Fecha | Cambio |
|---|---|
| 2026-04 | Plan operativo consolidado para alinear con el cronograma TP1-TP4 y la arquitectura híbrida (web + módulo ML propio). |
