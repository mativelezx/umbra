# Arquitectura del sistema

<!-- FUENTE PRIMARIA: docs/tech/ARCHITECTURE.md + docs/DECISIONS.md
     (25 ADRs). -->

> El diagrama Mermaid de topología vive en
> [`docs/tech/ARCHITECTURE.md`](../docs/tech/ARCHITECTURE.md). Este
> capítulo reproduce los diagramas clave (topología, crisis pipeline,
> trust boundaries STRIDE) y justifica las decisiones de arquitectura
> usando las ADRs relevantes como soporte.

## Stack tecnológico

<!-- FUENTE: docs/tech/ARCHITECTURE.md + ADRs 001, 003, 004, 009, 010. -->

- **Next.js 14** (App Router, TypeScript strict)
- **Supabase** (Auth + Postgres + RLS + SSR)
- **Anthropic Claude API** (Sonnet 4.6 + Haiku 4.5, SKU pinned — ADR-005, ADR-014)
- **Zod** para validación de inputs
- **Zustand** para estado cliente
- **Recharts** para visualizaciones
- **Tailwind CSS 3.4** con design system custom
- **next-intl** para i18n (ADR-010)
- **vitest + Playwright** para testing (ADR-009)
- **@axe-core/playwright** para a11y automatizada

## Topología

<!-- FUENTE: docs/tech/ARCHITECTURE.md sección "High-level topology". -->

<!-- Incluir diagrama Mermaid; se renderiza en Pandoc via filter
     mermaid-filter o se exporta manualmente a PNG antes del build. -->

## Decisiones arquitectónicas clave

<!-- FUENTE: docs/DECISIONS.md. Incluir 3-5 ADRs verbatim como bloques
     citados (no como anexos) porque cuentan la historia de cómo se
     llegó a la arquitectura actual. -->

**ADR-001**: Edge runtime para rutas Claude
<!-- citar verbatim -->

**ADR-002**: Jung directo, no MBTI
<!-- citar verbatim — contrarresta la posible objeción "¿por qué no MBTI?" -->

**ADR-008**: Observability `crisis_events` con salted hashes
<!-- citar verbatim — muestra la tensión privacidad vs auditoría -->

**ADR-014**: Committed cache snapshots + pinned SKU
<!-- citar verbatim — muestra cómo se garantiza reproducibilidad -->

**ADR-023**: Validación mixed-methods Branch B + M3
<!-- citar verbatim — justifica la elección metodológica -->

## Pipeline de crisis (safety)

<!-- FUENTE: docs/tech/CHAT_SAFETY.md. -->

<!-- PENDIENTE: copiar el diagrama de flujo del pipeline + explicar la
     lógica fail-closed + mostrar el test gate de H3. -->

## Threat model (STRIDE)

<!-- FUENTE: docs/tech/THREAT_MODEL.md. -->

<!-- Incluir el diagrama de trust boundaries y la tabla STRIDE por
     componente. Este capítulo de la tesis es uno de los más fuertes
     para el tribunal: muestra pensamiento de seguridad explícito. -->

## Cumplimiento Ley 25.326

<!-- FUENTE: docs/biz/LEGAL.md + ADR-017 + ADR-024 + migration 004. -->

<!-- PENDIENTE: explicar la implementación del consent flow, el hash
     verbatim del texto consentido (ADR-024), los peppers versionados
     (ADR-021), y los derechos del usuario (acceso, rectificación,
     cancelación, oposición). -->
