# Umbra — Plan de Implementación TFG

> Tracking doc del plan maestro para completar el TFG. 6 fases secuenciales,
> QA Gate estándar al cierre de cada fase, checkboxes para marcar progreso.
> **Decisión adoptada**: Branch B (validación computacional) + M3 think-aloud
> con reclutamiento controlado (n=8-10 amigos/compañeros). Ver
> [DECISIONS.md ADR-023](../DECISIONS.md) para la justificación.

## Contexto

- **Autor**: Matías Vélez
- **Programa**: Ingeniería en Software — Universidad Siglo 21
- **Entregable**: TFG (monografía + artefacto de software)
- **Modalidad de validación**: mixed-methods (H1/H2/H3 computacional + M3 usuarios)
- **Fecha de inicio del plan**: 2026-04-14
- **Fecha estimada de defensa**: ~6-7 semanas desde kick-off

## Decisiones clave

1. **Branch B, no Branch A** — validación computacional como primary. Sin comité
   de ética, sin reclutamiento masivo. Ver [ETHICS.md Branch B](ETHICS.md#branch-b--research-dataset-deferred)
   y ADR-023.
2. **M3 think-aloud, no M1/M2** — reclutamiento controlado (amigos y compañeros
   de Siglo 21) en vez de estudio formal n≥30 o opt-in dependiente de tráfico.
   Defendible con la regla de Nielsen: n=5 detecta 85% de problemas de
   usabilidad.
3. **Scope cut explícito** — quedan fuera del TFG y se documentan como trabajo
   futuro: framer-motion, disclosure 2 capas, chat persistente, PDF export,
   autonomy dial, UMUX-Lite/METUX in-app, shipeo a producción.

## Hallazgos del audit de Fase 0 (2026-04-14)

Audit read-only del repo para detectar gaps antes de arrancar:

| Item | Estado | Impacto en el plan |
|---|---|---|
| `lib/evals/` | ❌ **No existe** | Fase 5 incluye **escribir** el eval suite (no solo correrlo). +2 días de trabajo. |
| `consent_records` schema | ⚠️ **Parcial** | Falta `consent_text_hash` (SHA256 verbatim) y `locale`. Tratado en ADR-024 + migration 004. |
| `crisis_events` schema | ✅ Presente | Migration 002. RLS service-role-only. HMAC salteado por [lib/security/peppers.ts](../../lib/security/peppers.ts). |
| Tests unit | ✅ Presente | vitest en [lib/chat/pipeline.test.ts](../../lib/chat/pipeline.test.ts), [lib/knowledge/build-block.test.ts](../../lib/knowledge/build-block.test.ts), etc. |
| Tests E2E | ✅ Presente | Playwright en `e2e/` (7 specs). |
| CI/CD | ✅ Presente | [.github/workflows/ci.yml](../../.github/workflows/ci.yml). |
| ADRs | ✅ Presente (22) | ADR-023 y ADR-024 se agregan en Fase 0. |
| ETHICS.md | ✅ Presente | Declaración de Helsinki + Calvo & Peters + Branch A/B. |
| Ley 25.326 consent route | ✅ Presente | [app/api/consent/route.ts](../../app/api/consent/route.ts) con peppers. |
| OSF preregistration | ⚠️ **Templateada en TFG.md**, no submitida | Fase 5. |
| Mermaid diagrams | ❌ Ausentes | Fase 5 (convertir ASCII → Mermaid). |
| axe-core en CI | ❌ Ausente | Fase 5. |
| Threat model | ❌ Ausente | Fase 5. |

---

## QA Gate Estándar

**Corre al cierre de cada fase. Si cualquier item falla, no avanzo hasta arreglarlo.**

```
□ 1. TypeScript strict:     npx tsc --noEmit            → 0 errores
□ 2. Build:                  npm run build               → success, sin warnings nuevos
□ 3. Unit tests:             npm run test                → 100% passing
□ 4. E2E relevante:          npx playwright test <spec>  → passing
□ 5. Lint:                   npm run lint                → 0 errores
□ 6. Sin console.log:        grep app/ components/ lib/  → 0 hits
□ 7. Sin `: any` nuevos:     grep app/ components/ lib/  → count estable
□ 8. Visual check:           Playwright screenshots      → archivadas en docs/assets/
□ 9. Docs actualizadas:      ADR + feature doc + VALIDATION → committed
□ 10. Commit limpio:         feat/fix/docs(fase-N): ...  → 1 commit por fase
```

---

## Fase 0 — Fundación académica (docs only) 🔴 bloqueante

**Duración estimada**: 1 día
**Estado**: en progreso
**Objetivo**: dejar todos los documentos académicos actualizados con la decisión Branch B + M3 antes de tocar código.

- [x] T0.0 Audit read-only de repo (este doc tiene los findings)
- [ ] T0.A Crear `docs/biz/IMPLEMENTATION_PLAN.md` (este archivo)
- [ ] T0.B Redactar **ADR-023** (Branch B + M3) en `docs/DECISIONS.md`
- [ ] T0.C Crear `docs/biz/VALIDATION.md` con H1/H2/H3 + protocolo M3
- [ ] T0.D Actualizar `docs/biz/TFG.md` metodología (Branch B + M3)
- [ ] T0.E Redactar **ADR-024** (consent_text_hash + locale patch) en `docs/DECISIONS.md`
- [ ] **QA Gate F0**: docs linting, ADR format consistency, commit limpio

### Criterio de cierre Fase 0
- [ ] ADR-023 y ADR-024 mergeados
- [ ] IMPLEMENTATION_PLAN.md, VALIDATION.md vivos
- [ ] TFG.md reformulado
- [ ] 1 commit limpio: `docs(fase-0): fundación académica TFG Branch B + M3`

---

## Fase 1 — Quick wins UI + explainability

**Duración estimada**: 3-5 días
**Objetivo**: 7 mejoras UX reformuladas como aplicación de heurísticas Google PAIR (explainability, mental models, feedback). Producen un demo profesional para la defensa oral.

- [ ] T1.1 **Confidence surface** en [components/dashboard/QuickGlance.tsx](../../components/dashboard/QuickGlance.tsx) y [components/dashboard/ArchetypeCard.tsx](../../components/dashboard/ArchetypeCard.tsx) — PAIR cap. 4 Explainability
- [ ] T1.2 **Pull quotes** en [components/dashboard/SectionedNarrative.tsx](../../components/dashboard/SectionedNarrative.tsx) + actualizar [lib/prompts/generate-narrative.ts](../../lib/prompts/generate-narrative.ts) para marcar con `> `
- [ ] T1.3 **Line-length 65ch** en contenedor de narrativa
- [ ] T1.4 **Sticky TOC** con scroll-spy — nuevo `components/dashboard/NarrativeTOC.tsx`
- [ ] T1.5 **InfoPopover en dimensiones** — wrap bars en [components/dashboard/JungAxisView.tsx](../../components/dashboard/JungAxisView.tsx) + radar
- [ ] T1.6 **InsightPing colapsable** en [components/onboarding/LiveProfilePanel.tsx](../../components/onboarding/LiveProfilePanel.tsx)
- [ ] T1.7 **QuickPromptChips siempre visibles** en [components/chat/ChatShell.tsx](../../components/chat/ChatShell.tsx)
- [ ] T1.8 **ADR-025** "Aplicación de heurísticas PAIR en Dashboard/Chat"
- [ ] T1.9 Screenshots antes/después en `docs/assets/phase1/` vía Playwright
- [ ] **QA Gate F1** completo

### Criterio de cierre Fase 1
- [ ] Todos los cambios visibles en dev
- [ ] QA Gate pasando
- [ ] Screenshots archivados
- [ ] Commit limpio: `feat(fase-1): quick wins UI + explainability (PAIR heuristics)`

---

## Fase 4 — Safety empírico (H3)

**Duración estimada**: 2-3 días
**Objetivo**: convertir el crisis classifier de "tested" a "measured" con precision/recall sobre dataset etiquetado. H3 de la tesis.

- [ ] T4.0 Revisión del dataset por segundo par de ojos (director/a o psicólogo)
- [ ] T4.1 Crear `lib/evals/crisis-dataset.ts` con 100 casos etiquetados (crisis real / idiom argentino / borderline / safe)
- [ ] T4.2 Crear `lib/evals/crisis-eval.ts` — runner con precision/recall/F1/matriz de confusión
- [ ] T4.3 Crear `lib/evals/crisis-eval.test.ts` — test automatizado que falla si recall < 0.95
- [ ] T4.4 Ejecutar eval → guardar en `eval-results/crisis-YYYYMMDD.json`
- [ ] T4.5 Iterar prompt si recall < 0.95, documentar mejoras
- [ ] T4.6 Actualizar [docs/tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) con tabla de resultados
- [ ] T4.7 Actualizar `VALIDATION.md` con resultados H3
- [ ] **QA Gate F4** completo

### Criterio de cierre Fase 4
- [ ] Dataset revisado por segundo par de ojos (entrada firmada en `docs/biz/VALIDATION.md`)
- [ ] Recall ≥ 0.95 y precision ≥ 0.85 documentados
- [ ] Test automatizado corriendo en CI
- [ ] Commit limpio: `feat(fase-4): H3 safety empírico con dataset etiquetado n=100`

---

## Fase 5 — Rigor académico (escribir + correr evals H1/H2 + cierres)

**Duración estimada**: 3-5 días (más que estimado inicial por el gap de lib/evals)
**Objetivo**: ejecutar lo académicamente pendiente. **Incluye escribir el eval suite desde cero** — el audit confirmó que [lib/evals/](../../lib) no existe.

### T5.1 Eval suite H1 (determinismo) — NUEVO, no existía
- [ ] T5.1.a Crear `lib/evals/cases.ts` — 50 casos (20 IPIP + 20 Jung + 10 adversariales)
- [ ] T5.1.b Crear `lib/evals/consistency.ts` — runner H1: 5 iteraciones × 50 casos × temperature=0
- [ ] T5.1.c Implementar committed cache snapshot (ADR-014): `lib/evals/.cache/snapshot-YYYYMMDD-<model>.json`
- [ ] T5.1.d Script npm: `npm run eval:h1`
- [ ] T5.1.e Ejecutar H1 y guardar resultados en `eval-results/H1-YYYYMMDD.json`
- [ ] T5.1.f Análisis: stddev por dimensión → pasa si stddev < 2.5 en todos

### T5.2 Eval suite H2 (robustez paráfrasis)
- [ ] T5.2.a Crear `lib/evals/cross-model-paraphrase.ts` — runner H2: 3 paráfrasis × 50 casos
- [ ] T5.2.b Rewriters: Claude Sonnet + Claude Haiku pinned SKU (ADR-020)
- [ ] T5.2.c Script npm: `npm run eval:h2`
- [ ] T5.2.d Ejecutar H2 y guardar en `eval-results/H2-YYYYMMDD.json`
- [ ] T5.2.e Análisis: max pairwise delta → pasa si < 10 en todos

### T5.3 Preregistro OSF
- [ ] T5.3.a Completar plantilla OSF Standard Prereg con hash de commit + hipótesis finales
- [ ] T5.3.b Enviar al director/a para revisión antes de submit
- [ ] T5.3.c (**vos**) Submitir a osf.io, obtener DOI
- [ ] T5.3.d Linkear DOI en TFG.md y README

### T5.4 Mermaid diagrams
- [ ] T5.4.a Convertir topology ASCII → Mermaid en [docs/tech/ARCHITECTURE.md](../tech/ARCHITECTURE.md)
- [ ] T5.4.b Dependency graph ASCII → Mermaid
- [ ] T5.4.c Data flow analyze ASCII → Mermaid
- [ ] T5.4.d Sequence diagram nuevo para crisis pipeline

### T5.5 axe-core en CI
- [ ] T5.5.a `npm i -D @axe-core/playwright`
- [ ] T5.5.b Crear `e2e/a11y.spec.ts` cubriendo /, /onboarding, /chat, /dashboard, /login
- [ ] T5.5.c Agregar job al CI workflow
- [ ] T5.5.d Fix violations críticas si aparecen

### T5.6 Threat model STRIDE
- [ ] T5.6.a Crear `docs/tech/THREAT_MODEL.md`
- [ ] T5.6.b Diagrama Mermaid STRIDE por componente (Claude API, Supabase, Edge routes, Client)
- [ ] T5.6.c Linkear a ADRs de seguridad existentes

### T5.7 Dependency audit en CI
- [ ] T5.7.a `npm audit --audit-level=high` como step
- [ ] T5.7.b Documentar exclusiones justificadas si hay

### T5.8 Migration 004 (consent_text_hash + locale) — ADR-024
- [ ] T5.8.a Crear `supabase/migrations/004_consent_patch.sql` con nuevas columnas
- [ ] T5.8.b Actualizar `app/api/consent/route.ts` para computar y persistir `consent_text_hash`
- [ ] T5.8.c Actualizar `lib/security/peppers.ts` si hace falta
- [ ] T5.8.d Test: verificar persistencia de hash
- [ ] T5.8.e Actualizar [docs/features/CONSENT.md](../features/CONSENT.md) y [docs/biz/LEGAL.md](LEGAL.md)

- [ ] **QA Gate F5** completo

### Criterio de cierre Fase 5
- [ ] H1 y H2 con resultados documentados
- [ ] OSF DOI obtenido
- [ ] Mermaid renders en GitHub
- [ ] axe-core passing en CI
- [ ] THREAT_MODEL.md mergeado
- [ ] Migration 004 aplicada
- [ ] Commit limpio por subfase

---

## Fase 4.5 — Field work M3 (paralelo post-Fase 5)

**Duración estimada**: 2 semanas (mayormente vos)
**Objetivo**: ejecutar el estudio think-aloud con n=8-10 reclutas controlados.

### Hago yo (materiales)
- [ ] T4.5.A Copy de reclutamiento (WhatsApp + email)
- [ ] T4.5.B Guión de sesión think-aloud (script minuto a minuto)
- [ ] T4.5.C Formulario de consentimiento informado (PDF imprimible)
- [ ] T4.5.D Template de notas de sesión
- [ ] T4.5.E Cuestionario SUS en español (10 ítems, escala 1-5)
- [ ] T4.5.F Setup OBS para grabación + estructura de carpetas
- [ ] T4.5.G Template de transcripción
- [ ] T4.5.H Script de análisis SUS en Python (promedio, stddev, distribución)
- [ ] T4.5.I Protocolo de coding temático para transcripciones

### Hago vos
- [ ] T4.5.J Reclutar 10 participantes (3 días)
- [ ] T4.5.K Agendar 10 sesiones (1 semana)
- [ ] T4.5.L Ejecutar sesiones (1 semana, 2 por día)
- [ ] T4.5.M Transcribir (con ayuda mía si querés)

### Hago yo (cierre)
- [ ] T4.5.N Procesar SUS, agregar tabla a VALIDATION.md
- [ ] T4.5.O Coding temático de 5 temas recurrentes con citas textuales
- [ ] T4.5.P Actualizar VALIDATION.md con resultados M3

### Criterio de cierre Fase 4.5
- [ ] n ≥ 8 sesiones completadas
- [ ] SUS promedio + stddev calculados
- [ ] 5 temas cualitativos identificados con citas
- [ ] Plan B activado si n < 8 (documentado honestamente)

---

## Fase 6 — Tesis (paralelo a 4.5 y Fase 5)

**Duración estimada**: 2-3 semanas
**Objetivo**: documento ~50-80 páginas formato Siglo 21.

- [ ] T6.1 Setup `thesis/` con Markdown + Pandoc para PDF
- [ ] T6.2 Estructura de archivos por capítulo
- [ ] T6.3 Extracción de contenido de docs existentes (ADRs, knowledge, ethics)
- [ ] T6.4 Drafts de capítulos técnicos (yo)
- [ ] T6.5 Redacción de capítulos personales (vos): Introducción, Discusión, Conclusiones
- [ ] T6.6 Bibliografía BibTeX desde fuentes citadas
- [ ] T6.7 Integración final + TOC + anexos
- [ ] T6.8 Revisión director/a
- [ ] T6.9 Correcciones + entrega

### Mapeo capítulo → fuente primaria

| Capítulo | Fuente | Acción |
|---|---|---|
| Portada, Resumen | - | Fresh write |
| Introducción | [TFG.md](TFG.md) | Expandir con contexto personal (vos) |
| Marco teórico | [lib/knowledge/](../../lib/knowledge/) + [ETHICS.md](ETHICS.md) | Extract + citas APA |
| Estado del arte | [MARKET.md](MARKET.md) + research skill outputs | Tabla comparativa |
| Metodología | [VALIDATION.md](VALIDATION.md) | Reformatear a prosa académica |
| Arquitectura | [ARCHITECTURE.md](../tech/ARCHITECTURE.md) + ADRs 1-25 | Diagramas Mermaid + justificación |
| Implementación | [UMBRA_MASTER_BUILD.md](../../UMBRA_MASTER_BUILD.md) + features/ | Resumen, no pegar código |
| Validación computacional | H1/H2/H3 resultados + CHAT_SAFETY.md | Tablas + análisis |
| Validación con usuarios | M3 results (Fase 4.5) | SUS + coding temático |
| Resultados | Agregado | Discusión honesta |
| Discusión | - | Fresh (vos) |
| Conclusiones | - | Fresh (vos) |
| Trabajo futuro | Scope cut items + Branch A + M1 | Documentar lo que no entra |
| Bibliografía | - | Zotero o BibTeX |
| Anexos | ADRs + eval datasets + consent copy + screenshots | Append |

---

## Scope explícitamente FUERA del TFG (Trabajo Futuro)

Se documentan en el capítulo "Trabajo futuro" de la tesis pero no se implementan:

- ❌ Instrumentación UMUX-Lite/METUX in-app (tabla `usability_responses`, modal opt-in)
- ❌ Framer-motion + disclosure 2 capas en Dashboard
- ❌ Chat persistente (historial sidebar)
- ❌ PDF export enriquecido
- ❌ Autonomy dial en chat ("Modo espejo / guía / reto")
- ❌ Edit de respuestas en onboarding
- ❌ Shipeo a producción con flujo público
- ❌ Estudio formal n≥30 con comité de ética (M1)

Si post-TFG querés retomar, el plan maestro completo está documentado en el
[research output previo](#) (conversación Claude Code) — se puede expandir este
mismo archivo con una sección "Fase 7 — post-TFG".

---

## Timeline estimado

| Semana | Actividad |
|---|---|
| W1 | Fase 0 (1d) + Fase 1 (4d) |
| W2 | Fase 4 (3d) + inicio Fase 5 (2d) |
| W3 | Cierre Fase 5 (3d) + preparar materiales Fase 4.5 (2d) |
| W4 | Reclutamiento + inicio sesiones M3; inicio drafts tesis |
| W5 | Cierre sesiones M3 + análisis; tesis avanza |
| W6 | Integración tesis + revisión director/a |
| W7 | Correcciones + entrega + preparar defensa |

Realista si trabajás 3-4 hs/día sostenido. Full-time llegás en 4-5 semanas.

---

## Referencias cruzadas

- [DECISIONS.md](../DECISIONS.md) — ADR-023 (Branch B + M3), ADR-024 (consent patch), ADR-025+ (PAIR heuristics)
- [VALIDATION.md](VALIDATION.md) — H1/H2/H3 + protocolo M3 + instrumentos
- [TFG.md](TFG.md) — estructura de tesis, preregistro OSF, defensa
- [ETHICS.md](ETHICS.md) — Declaración de Helsinki, Calvo & Peters, Branch A/B
- [CHAT_SAFETY.md](../tech/CHAT_SAFETY.md) — pipeline crisis, target de H3
- [ARCHITECTURE.md](../tech/ARCHITECTURE.md) — topology, data flows (a Mermaid en Fase 5)

## Changelog

| Fecha | Cambio |
|---|---|
| 2026-04-14 | Creación del plan. Decisión Branch B + M3 registrada. Audit findings: `lib/evals/` no existe, consent_text_hash falta. |
