# Umbra — Plan de Implementación TFG

> Tracking doc del plan maestro para completar el TFG. 6 fases secuenciales,
> QA Gate estándar al cierre de cada fase, checkboxes para marcar progreso.
> **Decisión adoptada**: Branch B (validación computacional) + M3 think-aloud
> con reclutamiento controlado (n=8-10 amigos/compañeros). Ver
> [DECISIONS.md ADR-023](../DECISIONS.md) para la justificación.

## 🟢 Estado de ejecución (2026-04-14)

**Todas las fases de código completadas y commiteadas**. Los checkboxes
individuales abajo reflejan la intención inicial del plan; la ejecución
real está consolidada en esta tabla:

| Fase | Scope | Commits | Estado |
|---|---|---|---|
| **Fase 0** — Fundación académica | ADRs 023-025, VALIDATION.md, IMPLEMENTATION_PLAN.md, TFG.md update | `98ccf76` | ✅ completa |
| **WIP coherente** | 8 grupos topológicos del trabajo previo (dimensions, chat, dashboard, onboarding, seed, tests, etc.) | `317286e`..`b88f8eb` (8 commits) | ✅ completa |
| **Fase 1** — PAIR heuristics quick wins | 7 UX fixes + ADR-025 + 3 P2 fix del codex review | `612c3b1`, `f185d25` | ✅ completa |
| **Fase 4** — H3 empirical safety | Dataset 100 casos + runner + test + script | `ecc2c3a` | ✅ completa (código) |
| **Fase 5.1** — H1/H2 eval runners | Cases.ts + consistency.ts + cross-model-paraphrase.ts + scripts | `3c06526` | ✅ completa |
| **Fase 5.2** — Migration 004 consent text hash | SQL + route update + verbatim text file + LEGAL.md | `4a90c6a` | ✅ completa |
| **Fase 5.3+5.4** — Mermaid + STRIDE threat model | ARCHITECTURE.md con Mermaid + THREAT_MODEL.md nuevo | `d579183` | ✅ completa |
| **Fase 5.5** — axe-core a11y CI | Spec nuevo + CI workflow update + dependency audit | `57b2448` | ✅ completa |
| **Fase 4.5** — M3 materials | Session protocol + consent + SUS + recruitment copy | `a3c454e` | ✅ completa (materiales) |
| **Fase 6** — Thesis skeleton | 16 chapters + README + Pandoc build + ADRs referenced | `db811cd` | ✅ completa |
| **Post-Fase 6**: 17 IPIP cases | `lib/evals/cases.ts` completo a n=50 preregistrado | `65370a5` | ✅ completa |
| **Post-Fase 6**: consent text hash client-side | Hash SHA-256 via Web Crypto en submit | `a6bf0c0` | ✅ completa |
| **Post-Fase 6**: RLS coverage CI test | `lib/supabase/rls-coverage.test.ts` (8 tests) | `9c57109` | ✅ completa |
| **Post-Fase 6**: P1 seed flow fix | seedText propagation session-store → analyze → DynamicFlow | `791bbdc` | ✅ completa |
| **Fase 2** — UMUX-Lite in-app | Migration 005 + types + instruments + route + UsabilityPrompt | `f3e930d` | ✅ completa |
| **Fase 3.1+3.2** — Disclosure + framer-motion | DashboardDepth + MotionProvider + spring animations | `e90954a` | ✅ completa |
| **Fase 3.3+3.6** — Chat persistence + autonomy dial | Sidebar + conversations routes + ChatShell refactor + autonomy backend | `ced532d`, `d012530` | ✅ completa |
| **Fase 3.4** — Undo onboarding | session-store helper + /api/onboarding/undo + DynamicFlow button | `eceb6c5` | ✅ completa |
| **Fase 3.5** — PDF export link + type fix | Dashboard button link + Html2PdfChain interface | `a6f97b2` | ✅ completa |
| **Eval runs** — H1/H2/H3 reales | Datos empíricos committeados en eval-results/*.json | `7724972`, `29b9e8e`, `c0904e2` | ✅ completa |
| **Deploy prod** — Vercel + Supabase | `vercel --prod` + `supabase db push --linked --include-all` | (no code commit; ver sección Deploy) | ✅ completa |
| **Docs sync post-implementation** | Actualización de TODA la documentación existente | (este commit) | 🟡 en curso |

**Pendiente (actividades humanas, no de código)**:

- ⏳ **OSF preregistration** — texto listo en `docs/research/osf/preregistration-standard.md`, el autor lo copy-pasta a osf.io.
- ⏳ **M3 think-aloud sessions** — 8-10 participantes reclutados por el autor, materiales listos en `docs/research/`.
- ⏳ **Dataset crisis revisado por par de ojos clínicos** — T4.0 del plan. El dataset existe en `lib/evals/crisis-dataset.ts`; requiere revisión humana antes de considerar H3 como validación final.
- ⏳ **Capítulos personales de la tesis** — 00 Portada, 01 Resumen, 02 Introducción, 11 Discusión, 12 Conclusiones. Los caps 03 Marco teórico, 06 Arquitectura y 08 Validación computacional ya están drafteados por codex.

Los checkboxes granulares abajo reflejan el **plan original** y se
mantienen como referencia histórica. El estado real es "todo lo de
código completo" como se resume en la tabla de arriba.

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
| 2026-04-14 (mañana) | Creación del plan. Decisión Branch B + M3 registrada. Audit findings: `lib/evals/` no existe, consent_text_hash falta. |
| 2026-04-14 (tarde) | **Ejecución completa de todas las fases de código**. 28 commits desde `98ccf76` hasta la sincronización de docs final. Detalle abajo. |

### Detalle de commits ejecutados (post 2026-04-14)

1. **`98ccf76` `docs(fase-0)`** — Fundación académica: ADR-023 + ADR-024 en `DECISIONS.md`, creación de `IMPLEMENTATION_PLAN.md` + `VALIDATION.md`, actualización de `TFG.md` con Branch B + M3.
2. **`317286e` `chore(types,config)`** — Foundation commit del WIP coherente: types + config + analyze route + research command slash.
3. **`9b7d0e4` `refactor(dimensions)`** — centralización de Big Five + Jung labels en `lib/dimensions/labels.ts` + archetype-compare.
4. **`e230662` `refactor(narrative)`** — 5-section markdown structure + iconography via `SectionedNarrative.tsx` + prompt update.
5. **`b2f5994` `feat(dashboard)`** — QuickGlance + ArchetypeMap + JungAxisView + InfoPopover.
6. **`282a070` `feat(chat)`** — ChatShell wrapper + ContextualGreeting + QuickPromptChips + ProfileContextPill.
7. **`b796d31` `refactor(onboarding)`** — seeded session support + conductor refinement.
8. **`66c47ad` `feat(onboarding)`** — ChatGPT seed flow con parser + session creation.
9. **`7fa2556` `test(e2e)`** — update qa-screenshots spec con nuevas surfaces.
10. **`b88f8eb` `chore(test)`** — disable CSS processing en vitest config (fix ambiental).
11. **`612c3b1` `feat(fase-1)`** — **PAIR heuristics application**: confidence surface, pull quotes, TOC sticky, InfoPopover, chips, InsightPing colapsable. **ADR-025 redactado**.
12. **`f185d25` `fix(codex-review)`** — 3 P2 regressions aplicadas (QuickGlance label, TOC gate legacy, seed flags merge). P1 documentado como known-issue (luego arreglado).
13. **`ecc2c3a` `feat(fase-4)`** — H3 empirical eval: crisis dataset 100 casos + runner + test + script `scripts/run-crisis-eval.ts`.
14. **`3c06526` `feat(fase-5)`** — H1/H2 eval runners + `cases.ts` + `consistency.ts` + `cross-model-paraphrase.ts` + scripts `run-h1.ts`, `run-h2.ts`.
15. **`4a90c6a` `feat(fase-5)`** — Migration 004 consent_text_hash + locale (Ley 25.326 art. 7).
16. **`d579183` `docs(fase-5)`** — Mermaid topology en ARCHITECTURE.md + THREAT_MODEL.md nuevo (STRIDE completo).
17. **`57b2448` `feat(fase-5)`** — axe-core a11y spec + CI integration + dependency audit.
18. **`a3c454e` `docs(fase-4.5)`** — M3 think-aloud materials: protocol + consent + SUS + recruitment copy.
19. **`db811cd` `docs(fase-6)`** — Thesis skeleton con 16 chapters + README + Pandoc build.
20. **`65370a5` `feat(evals)`** — 17 IPIP cases faltantes (ipip-01..17) para completar el corpus preregistrado n=50.
21. **`a6bf0c0` `feat(consent)`** — client-side SHA-256 hash of verbatim consent text (cierre de ADR-024).
22. **`9c57109` `test(security)`** — CI gate RLS coverage: `lib/supabase/rls-coverage.test.ts` con 8 tests.
23. **`791bbdc` `fix(seed)`** — **P1 fix del codex review**: propagate ChatGPT seed text al analyze final.
24. **`f3e930d` `feat(fase-2)`** — UMUX-Lite + METUX + CUQ + SUS in-app instrumentation (migration 005 + tabla + types + instruments + route + UsabilityPrompt component).
25. **`e90954a` `feat(fase-3.1,3.2)`** — Dashboard progressive disclosure + framer-motion LazyMotion con spring animations.
26. **`ced532d` `feat(fase-3.3,3.6)`** — Chat persistent history con sidebar + autonomy dial backend/frontend.
27. **`eceb6c5` `feat(fase-3.4)`** — Undo last onboarding answer: `/api/onboarding/undo` + `undoLastAnsweredTurn` helper + DynamicFlow button.
28. **`a6f97b2` `refactor(export)`** — type the `html2pdf.js` module con interface `Html2PdfChain` (remove `any`).
29. **`d012530` `feat(fase-3.6)`** — Autonomy dial backend: system prompt + route schema.
30. **`7724972` `feat(eval,thesis)`** — **H1 + H3 real results** committed + cap 06 arquitectura + OSF preregistration text.
31. **`29b9e8e` `docs(thesis)`** — cap 03 marco teórico + cap 08 validación computacional drafted por codex.
32. **`c0904e2` `eval(h2)`** — **H2 real results committed**: FALSIFIED (18/25 fail), mean delta 10.24, reformulable como intervalo.

**Total**: 32 commits desde la baseline Fase 0. Todos compilables, con tsc + lint cleaning en cada uno.

### Deploy a producción (2026-04-14)

- **Vercel**: proyecto `umbra` (id `prj_8S4KbDfaF0Yl8fLo8qeF8RUUm5wM`), último deploy `dpl_Cvpd9JtbHZHAdYW22SB11pXvxgQL`, URL pública https://umbra-sigma.vercel.app. 15 env vars configurados (Anthropic, Supabase, 4 peppers, rate limits, NEXT_PUBLIC_SITE_URL).
- **Supabase**: proyecto `umbra` (reference `abhtdinyegnwrnycwsca`), São Paulo region. 5 migrations aplicadas: 001 initial schema, 002 core tables, 003 onboarding_sessions, 004 consent_text_hash, 005 usability_responses. Verificable con `supabase migration list --linked`.
- **Smoke test**: landing HTTP 200 ✅, login HTTP 200 ✅, dashboard HTTP 307 redirect a /login (auth middleware funcionando) ✅, `/api/consent` validación Zod respondiendo correctamente ✅.
- **Pendiente**: RESEND_API_KEY no configurada (afecta solo flow de borrado con magic link). El flow existe en código y cae con `EmailConfigError` si el email no está disponible.

### Resultados empíricos committeados

| Experimento | Archivo en `eval-results/` | Tiempo de ejecución | Resultado |
|---|---|---|---|
| H3 crisis default | `crisis-2026-04-14_22-01-32-332.json` | 44.2 s | recall=0.520 (FALLA strict) |
| H3 crisis forced | `crisis-2026-04-14_22-06-34-640.json` | 255.4 s | recall=1.000, precision=0.862 (PASA) |
| H1 determinismo (n=25×3) | `H1-2026-04-14_23-41-39-903.json` | 1079.8 s | 13/25 fail stddev<2.5 (falsificada strict; Big Five estable, Jung inestable) |
| H2 paráfrasis (n=25×3) | `H2-2026-04-14_23-56-55-568.json` | 873.8 s | 18/25 fail delta<10, mean=10.24 (falsificada strict, marginal) |

Los findings detallados están en `docs/biz/VALIDATION.md` sección "Resultados empíricos" y en `thesis/08-validacion-computacional.md` capítulo 8.
