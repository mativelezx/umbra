# Implementación

<!-- FUENTE PRIMARIA: UMBRA_MASTER_BUILD.md + docs/features/*. -->

> Resumen por fases del desarrollo. El doc maestro tiene el nivel de
> detalle operacional; este capítulo cuenta la historia narrativa de
> cómo se construyó Umbra, decisiones clave, y trade-offs.

## Fases de desarrollo

<!-- FUENTE: UMBRA_MASTER_BUILD.md. -->

<!-- PENDIENTE: listar las fases 0-7 del master build + qué se logró
     en cada una + problemas encontrados + decisiones tomadas. -->

## Base de conocimiento

<!-- FUENTE: lib/knowledge/* + ADR-018 (citation comment format). -->

<!-- PENDIENTE: explicar el formato @source/@reference/@page_or_section/@verbatim
     y por qué es importante para la auditabilidad académica. Mostrar
     el test citation-check.test.ts como evidencia de enforcement. -->

## Prompts estructurados

<!-- FUENTE: lib/prompts/*. -->

<!-- PENDIENTE: discutir la arquitectura de prompts (analyze-profile,
     generate-narrative, onboarding-conductor, crisis-classifier,
     chatgpt-seed-parser) y por qué están separados del código de
     componentes (regla de CLAUDE.md). -->

## Onboarding conversacional dinámico

<!-- FUENTE: docs/features/ONBOARDING.md + components/onboarding/. -->

<!-- PENDIENTE: explicar el conductor loop con 6 tipos de pregunta
     (OpenText, MultiChoice, Scenario, Ranking, Polarity, Metaphor),
     el LiveProfilePanel con insight pings colapsables, el modo seeded
     desde ChatGPT + su regression P1 documentada. -->

## Dashboard y narrativa

<!-- FUENTE: docs/features/DASHBOARD.md + docs/features/NARRATIVE.md +
     components/dashboard/. -->

<!-- PENDIENTE: explicar la composición del dashboard (ArchetypeCard +
     QuickGlance + NarrativeSection + JungAxisView + ArchetypeMap), la
     aplicación de heurísticas PAIR (ADR-025), el pull-quote parser,
     el sticky TOC con scroll-spy, el confidence surface. -->

## Chat con contexto de perfil

<!-- FUENTE: docs/features/CHAT.md + docs/tech/CHAT_SAFETY.md +
     components/chat/. -->

<!-- PENDIENTE: explicar ChatShell + ContextualGreeting + ProfileContextPill
     + QuickPromptChips (con compact mode), el pipeline de crisis 2-stage
     con fail-closed semantics. -->

## Export a PDF

<!-- FUENTE: docs/features/PDF_EXPORT.md + ADR-006. -->

<!-- PENDIENTE: explicar por qué html2pdf.js client-side (ADR-006),
     el print stylesheet dedicado, y cómo se genera el snapshot que
     el usuario puede descargar. -->

## Testing + CI/CD

<!-- FUENTE: .github/workflows/ci.yml + lib/chat/pipeline.test.ts +
     lib/evals/crisis-eval.test.ts + e2e/a11y.spec.ts. -->

<!-- PENDIENTE: listar la cobertura de tests (unit en vitest + E2E en
     Playwright + a11y en axe-core), el CI de 2 jobs (quality +
     e2e-hardening), y las garantías que da: tsc, lint, tests, build,
     Playwright smoke, a11y automated, dependency audit. -->

## Scope cortado del TFG

<!-- FUENTE: docs/biz/IMPLEMENTATION_PLAN.md sección "Scope explícitamente
     FUERA del TFG". -->

<!-- PENDIENTE: listar honestamente qué se dejó afuera y por qué
     (framer-motion, disclosure 2 capas, UMUX-Lite in-app, chat
     persistente, shipeo a producción, estudio formal n≥30). Esto va
     al capítulo 13 Trabajo Futuro pero se menciona acá para marcar
     los límites del scope ejecutado. -->
