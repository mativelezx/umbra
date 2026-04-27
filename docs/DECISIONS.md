# Umbra — Architecture Decision Records (ADRs)

This file is the source of truth for major architectural decisions. Each ADR
is immutable once written: if a decision evolves materially, append a new ADR
that builds on it and reference the prior record explicitly.

Format: `ADR-NNN — Title` · `Status` · `Context` · `Decision` · `Consequences`.

> Numbering note: the sequence has gaps. Numbers reflect chronological order
> of authoring; missing identifiers were never published. Cross-references in
> the rest of the documentation always cite the ADR by number, so the gaps
> are intentional and stable.

---

## ADR-001 — Edge runtime for Claude-calling API routes
**Status**: Accepted (2026-04-12)
**Context**: Claude API calls can take 3-20s (analyze 4s, narrative 15s stream,
chat 3s first-byte). Node.js runtime on Vercel has a 10s timeout on free tier;
Edge runtime has up to 60s and costs less per invocation.
**Decision**: All routes under `/api/analyze*`, `/api/narrative`, `/api/chat`,
`/api/plan` use Edge runtime. Account management routes (`/api/account/*`) use
Node runtime for Supabase service-role operations that need Node APIs.
**Consequences**: Edge routes cannot use Node built-ins (`fs`, `child_process`)
or libraries that depend on them. html2pdf.js stays client-side (ADR-006).

## ADR-002 — Jung cognitive functions used DIRECTLY, not via MBTI
**Status**: Accepted (2026-04-12)
**Context**: MBTI is widely criticized as pseudoscience (Stein & Swan 2019,
Pittenger 2005). Jung's original cognitive function theory from *Tipos
Psicológicos* (1921) is theoretically coherent and remains in the public
domain.
**Decision**: `lib/knowledge/jung-functions.ts` cites Jung (1921) directly.
No MBTI terminology in code, prompts, or UI. The 8 functions (Se, Si, Ne, Ni,
Te, Ti, Fe, Fi) are primary. The Jung layer is interpretive, not measured by
the analytical module (see ADR-026 + ADR-027).
**Consequences**: We lose the recognizability of "INFJ / INTP" labels but gain
academic defensibility. The thesis cites Jung (1921) as source for the
narrative reading layer.

## ADR-003 — Supabase + RLS instead of NextAuth
**Status**: Accepted (2026-04-12)
**Context**: Need auth + database + row-level access control. NextAuth gives us
sessions but pushes access control into TypeScript. Supabase gives us all three
in one system with Row Level Security doing access control at the DB layer.
**Decision**: Supabase Auth for signup/login, Supabase PostgreSQL for data,
RLS policies on every table enforcing `auth.uid() = user_id` (or service-role-
only for `crisis_events`, `research_dataset`, `delete_confirmations`).
**Consequences**: Vendor lock-in to Supabase. No trivial path to self-hosting.
Gain: consistent auth model from DB to API to client, no drift.

## ADR-004 — `@supabase/ssr` over deprecated `@supabase/auth-helpers-nextjs`
**Status**: Accepted (2026-04-12)
**Context**: `@supabase/auth-helpers-nextjs` was deprecated by Supabase in
favor of `@supabase/ssr`. Phase 1 scaffolding used the deprecated package
because the master doc predated the deprecation.
**Decision**: Phase 1.5 migrates all files reading cookies to `@supabase/ssr`:
`lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`,
`middleware.ts`, and any API route that trusts the session.
**Consequences**: Some debugging of RLS edge cases during migration.
Future-proof against further auth-helpers abandonment.

## ADR-005 — Claude model ID as environment variable, pinned SKU
**Status**: Accepted (2026-04-12)
**Context**: Master doc hardcoded `CLAUDE_MODEL = 'claude-sonnet-4-20250514'`.
Hardcoding a model creates a code change every time a new model lands, and
aliases can silently shift behind a fixed name.
**Decision**: `lib/claude/client.ts` reads `process.env.ANTHROPIC_MODEL_ID`
with a default of `claude-sonnet-4-6`. The thesis methods section cites the
exact SKU resolved at runtime so any reproduction step is unambiguous.
**Consequences**: Model can be swapped via env var without a code deploy.
The narrative layer is the only consumer of this variable; the analytical
module owns its own model artifacts (ADR-026).

## ADR-006 — `html2pdf.js` client-side only, PDF export is a client component
**Status**: Accepted (2026-04-12)
**Context**: Master doc specified `app/api/export/route.ts` (Edge runtime) to
generate PDFs via html2pdf.js. But html2pdf.js runs on html2canvas, which is
browser-only — it cannot execute in Edge runtime.
**Decision**: PDF export is implemented as `app/export/page.tsx` (client
component). `html2pdf.js` is imported via `next/dynamic({ ssr: false })`.
No API route is involved; data is loaded directly from Supabase via the
client. A dedicated `app/export/print.css` overrides the cosmic design with
a flat print-safe palette (no backdrop-filter, no gradients, page-break-inside
avoidance).
**Consequences**: Simpler architecture (one less route). PDF only works when
the user's browser is online. Print stylesheet is additional maintenance surface.

## ADR-007 — Archetypes sourced from Pearson applied system
**Status**: Accepted (2026-04-12)
**Context**: Jung's structural archetypes (Anima, Animus, Shadow, Self) are
intra-psychic and don't map cleanly to behavioral profiles. Pearson's "applied
archetypes" (Hero, Sage, Explorer, Creator, Caregiver, Rebel) are behavioral
and map cleanly to the Big Five.
**Decision**: `lib/knowledge/archetypes.ts` uses Pearson's 6-archetype system
(Pearson, *Awakening the Heroes Within*, 1991). The 6 archetypes are frozen
and match `types/index.ts` enum. Like Jung functions, archetypes are an
interpretive narrative reading, not a measured dimension of the analytical
module (ADR-026).
**Consequences**: Assignment criteria are heuristic (Big Five + Jung function
patterns → archetype). Prompts, narrative, SVG avatars all depend on this
choice; changing archetypes later is expensive.

## ADR-008 — `crisis_events` observability: salted hashes, 30-day rotation
**Status**: Accepted (2026-04-12)
**Context**: The chat safety system (regex + classifier) will have false
positives and false negatives. To debug the safety system you need visibility
into what triggered it — but storing raw message bodies of crisis events
creates a privacy risk worse than the one we're mitigating.
**Decision**: `crisis_events` stores `user_hash = HMAC(user_id, CRISIS_PEPPER)`,
`message_hash = HMAC(message, CRISIS_PEPPER)`, regex hits, classifier JSON,
severity, timestamp. No raw text. 30-day rotation via nightly cron. Disclosed
in consent text verbatim.
**Consequences**: Can debug patterns (which regex fires most, classifier
confidence distribution) but cannot retrieve original text for review. If a
user disputes a crisis classification, we can only show them regex hit terms
and classifier severity, not their original message.

## ADR-009 — Test runner is vitest, not jest
**Status**: Accepted (2026-04-12)
**Context**: Project needs a test runner for unit and integration tests. Jest
is mature but slow to start and has complex ESM handling. Vitest is
Vite-native, fast ESM, built-in coverage.
**Decision**: `vitest` + `@vitest/ui`. Test files colocated with source
(`*.test.ts` next to `*.ts`) for unit tests. Run via `npm run test`.
**Consequences**: Faster CI. Simpler config. Any library that requires jest
specifically won't work. No such library in our stack.

## ADR-010 — i18n library is `next-intl@^3`
**Status**: Accepted (2026-04-12)
**Context**: Master doc mentions latinoamericano Spanish. For the TFG we ship only
ES-AR, but retrofit i18n later is painful (all strings inline to dictionary).
Two candidates: `next-intl` (App Router native middleware) or `@formatjs/intl`
(library-only, no middleware).
**Decision**: `next-intl@^3`. Locales: `es-AR` (primary, voseo and latinoamericano
vocabulary), `en` (stub). Middleware-based locale detection. Messages live in
`messages/es-AR.json` and `messages/en.json`. All component strings pass
through `t()` from day 1.
**Consequences**: Initial i18n boilerplate. English dictionary
starts empty and can be filled later. No runtime penalty — JSON dictionaries
are bundled per locale.

## ADR-013 — `research_dataset` is pseudonymization, not anonymization
**Status**: Accepted (2026-04-12)
**Context**: Consent forms often promise "anonymization," which implies
irreversibility. In practice, any scheme that lets us delete a specific
user's research rows on request (legal requirement under Ley 25.326 if the
consent is revocable) is by definition reversible by whoever holds the
linking key. We cannot promise both irreversibility AND right-to-delete.
**Decision**: `research_dataset.user_hash = HMAC(user_id, RESEARCH_PEPPER)`.
This is pseudonymization — the server with pepper access can re-link.
Consent text discloses this honestly. Research rows ARE included in
`/api/account/export` when `research_opt_in=true` (same code path that
enables delete-with-purge). Legal basis under Ley 25.326 is explicit
informed consent + data minimization + access control.
**Consequences**: Consent text is longer and less marketable. Legally honest
and ethically defensible.

## ADR-015 — Big Five content from IPIP-NEO (public domain), not NEO-PI-R
**Status**: Accepted (2026-04-12)
**Context**: The NEO-PI-R manual (Costa & McCrae 1992) is proprietary; PAR
Inc. licenses its use for commercial and some academic purposes. IPIP-NEO
(International Personality Item Pool, Goldberg 1999) is public domain, maps
to the same 5-factor structure, and its item content + scoring rationale can
be freely bundled with the repo and thesis.
**Decision**: `lib/knowledge/big-five.ts` cites IPIP-NEO, not NEO-PI-R. The
thesis methods section names IPIP-NEO as the Big Five instrument. Facet
names follow IPIP conventions where they differ from NEO-PI-R.
**Consequences**: Slight loss of brand recognition (NEO-PI-R is more famous
in psychology circles) but legal clarity. Academic defensibility is
actually stronger — IPIP is used in hundreds of peer-reviewed studies.

## ADR-016 — Global daily budget check via cached SQL sum (Edge-safe)
**Status**: Accepted (2026-04-12)
**Context**: Edge/serverless runtimes have no singleton startup — functions
are spawned on-demand. "Check GLOBAL_DAILY_BUDGET_USD at app startup" as
originally written is impossible in this architecture.
**Decision**: A cached SQL view `daily_cost_summary` computes `SUM(cost_usd_cents)
WHERE day = CURRENT_DATE` on-demand. Wrap in `unstable_cache` from Next.js
with `revalidate: 300` (5 min TTL). Every Edge route reads this before each
Claude call. If over budget, return 503 with maintenance message.
**Consequences**: 5-min TTL means worst-case overshoot is 5min × per-second
burn rate, which for a TFG with 1-10 concurrent users is cents. Acceptable.
Tighter cap requires a more sophisticated mechanism (e.g., Redis pub/sub).

## ADR-018 — Citation comment format for `lib/knowledge/` items
**Status**: Accepted (2026-04-12)
**Context**: KB content is "paraphrased-with-citation" as policy
but never had a defined comment format. Without enforcement, citations drift
into inconsistent styles and the thesis methods section becomes impossible to
audit.
**Decision**: Every item in `lib/knowledge/*.ts` arrays MUST have a JSDoc
comment block immediately above it with exactly these tags:
```ts
/**
 * @source Goldberg (1999) IPIP-NEO
 * @reference https://ipip.ori.org/newNEOFacetsKey.htm
 * @page_or_section "Openness — Imagination facet"
 * @verbatim false
 */
```
`@source` is the citation. `@reference` is a URL or DOI. `@page_or_section`
pinpoints the text. `@verbatim` is `true` if the text is a direct quote,
`false` if paraphrased. A CI test (`lib/knowledge/citation-check.test.ts`)
parses all KB files and fails if any item is missing the block.
**Consequences**: Strict enforcement. Adding a KB item requires citation
discipline. Thesis methods section becomes trivially auditable — grep for
`@verbatim false` to find all paraphrased content.

## ADR-019 — `analysis_raw` JSONB retention policy (30 days)
**Status**: Accepted (2026-04-12)
**Context**: `psychological_profiles.analysis_raw` stores the full Claude
response JSON (~5-10KB per row) for debugging. On Supabase free tier (500MB
total), this fills up at ~50k profiles. For a TFG this is fine but creates a
cliff post-launch.
**Decision**: A nightly Supabase cron job purges `analysis_raw` for rows
older than 30 days: `UPDATE psychological_profiles SET analysis_raw = NULL
WHERE created_at < NOW() - INTERVAL '30 days' AND analysis_raw IS NOT NULL`.
The profile itself (Big Five + Jung + archetype) remains — only the raw
debug payload is dropped.
**Consequences**: Can debug recent analysis issues (last 30 days) in detail,
older analyses only have the structured result. Trade-off: debug depth vs
storage cost.

## ADR-021 — Pepper versioning for rotation safety
**Status**: Accepted (2026-04-12)
**Context**: HMAC peppers need to be rotatable on compromise. Without
versioning, rotating a pepper invalidates all existing hashes — crisis_events
become un-linkable, research_dataset can't be re-associated for export, etc.
**Decision**: Every table using HMAC gets a `pepper_version SMALLINT NOT NULL
DEFAULT 1` column. A `lib/security/peppers.ts` module maps version → env var:
```ts
export const PEPPERS = {
  crisis:       { 1: process.env.CRISIS_PEPPER_V1 },
  research:     { 1: process.env.RESEARCH_PEPPER_V1 },
  consent_ip:   { 1: process.env.CONSENT_IP_PEPPER_V1 },
  delete_token: { 1: process.env.DELETE_TOKEN_PEPPER_V1 },
};
export const CURRENT_PEPPER_VERSION = 1;
```
Rotation: add `CRISIS_PEPPER_V2` env var, increment `CURRENT_PEPPER_VERSION`
for new writes. Old rows still readable via their stored `pepper_version`.
**Consequences**: Migration-free rotation. Slightly more complex lookup code.
Future-proof against security incidents.

## ADR-022 — Rate limit: estimate-then-reconcile with finally-block cleanup
**Status**: Accepted (2026-04-12)
**Context**: The original spec charged tokens BEFORE the Claude call based on
estimates, then "reconciled on success." But if Claude times out at 10s, the
reconcile never runs and the user's cupo is permanently debited for tokens
that were never generated. A user with network issues agota su cupo diario
sin recibir respuestas.
**Decision**: The reconcile call runs in a `finally` block in the Edge route,
so it executes on success, error, AND timeout. On error, it passes
`actual_input = estimatedInput` (we did send the request) and
`actual_output = 0` (or the partial streaming tokens received). The
reconcile function subtracts the delta from rate_limits so the user is only
charged for actual consumption.
**Consequences**: Users never lose cupo to failed calls. Slightly more complex
error handling per route. The `reconcile_rate_limit` SQL function is in
Migration 002 alongside `charge_rate_limit`.

## ADR-024 — Consent text hash + locale en consent_records
**Status**: Accepted (2026-04-14)
**Context**: `supabase/migrations/002_core_tables.sql` crea la tabla
`consent_records` con `consent_version TEXT`, `accepted_at`, `ip_hash +
pepper_version`, y `user_agent`, pero **no almacena un hash verificable del
texto consentido verbatim ni el locale**. Para datos psicológicos sensibles
bajo Ley 25.326 (datos sensibles — art. 2 y art. 7), la autoridad de
aplicación (AAIP) exige que el consentimiento sea "preciso e informado", lo
cual requiere poder demostrar qué texto específico vio el usuario al
aceptar. El campo `consent_version TEXT` no es suficiente: si mañana se
corrige una tipografía manteniendo la versión, no hay forma de auditar qué
vio históricamente el usuario X. Adicionalmente, el `consent_records` schema
no captura `locale`, lo cual en un contexto multi-idioma futuro (next-intl
ya está instalado — ADR-010) puede hacer imposible distinguir a un usuario
que consintió en español vs inglés.
**Decision**: Se agregan dos columnas a `consent_records` vía migration 004:
```sql
ALTER TABLE public.consent_records
  ADD COLUMN consent_text_hash TEXT NOT NULL DEFAULT '',
  ADD COLUMN locale TEXT NOT NULL DEFAULT 'es-AR';
```
`consent_text_hash` es SHA-256 del texto de consentimiento verbatim tal como
fue renderizado al usuario (computado client-side o server-side
deterministicamente). `locale` es BCP-47 (`es-AR`, `en`, etc.).
[app/api/consent/route.ts](../app/api/consent/route.ts) se actualiza para
aceptar ambos campos en el `ConsentSchema` Zod y persistirlos. El texto
verbatim de cada versión se mantiene en archivos versionados bajo
`content/consent/<version>-<locale>.md` para poder verificar hashes a
posteriori. El test `consent-text-integrity.test.ts` valida que el hash
computado sobre el archivo coincide con el que el cliente envía.
**Consequences**:
- **Ganancia**: auditabilidad completa del consentimiento bajo Ley 25.326;
  capacidad de probar ante la AAIP o ante el usuario mismo qué texto
  consintió; preparación para multi-idioma futuro.
- **Costo**: una migration adicional + actualización de copy en consent
  flow + mantenimiento de archivos verbatim en repo (`content/consent/`).
- **Migración de datos existentes**: los registros anteriores a la
  migration quedan con `consent_text_hash=''` y `locale='es-AR'` (defaults).
- **Linked to**: ADR-021 (pepper versioning — mismo patrón de immutable
  audit trail).

## ADR-026 — Módulo analítico propio (DistilBERT congelado + Ridge multi-output)
**Status**: Accepted (2026-04-14)
**Context**: La capa cuantitativa del perfil necesita inferir las cinco
dimensiones del modelo Big Five sobre texto introspectivo de manera
trazable, reproducible y sin depender de un proveedor externo en cada
inferencia. Las opciones consideradas fueron: (a) usar el LLM externo para
también inferir Big Five; (b) construir un módulo analítico propio basado
en embeddings preentrenados + un regresor clásico. La opción (a) hereda la
opacidad del proveedor y exige métricas reproducibles que dependen de su
catálogo. La opción (b) ofrece un instrumento auditable, con artefactos
serializables y métricas calculables por dimensión.
**Decision**: Se construye un módulo analítico propio en `ml/` con dos
etapas: (1) DistilBERT base multilingual cased (Sanh et al. 2019) usado en
modo *frozen embeddings* — sin fine-tuning, siguiendo la línea de Howard y
Ruder (2018) y Peters et al. (2019) — para extraer un vector de 768
dimensiones por texto; (2) cinco regresores Ridge (Hoerl & Kennard 1970)
multi-output, uno por dimensión Big Five, entrenados con scikit-learn
(Pedregosa et al. 2011) sobre la unión de los corpus Essays (Pennebaker &
King 1999) y el corpus latinoamericano propio. El módulo se sirve como API
HTTP via FastAPI; el frontend Next.js consume el endpoint via
`lib/ml-client.ts`. Versionado de datos via DVC, tracking de experimentos
via MLflow (Zaharia et al. 2018), CI con GitHub Actions verifica métricas
mínimas. La capa narrativa (Jung + arquetipo + retrato + plan + chat)
queda separada y delegada al proveedor externo de IA generativa.
**Consequences**:
- **Ganancia**: instrumento auditable, métricas (MSE, R², r) calculables y
  reportables por dimensión, artefactos serializables (joblib), pipeline
  reproducible (`make all` o `dvc repro`), independencia operativa de la
  API externa para el componente cuantitativo.
- **Costo**: complejidad operacional adicional (módulo Python separado,
  servir FastAPI, DVC remote). El módulo no corre en Vercel.
- **Riesgo**: heterogeneidad EN vs ES-AR de los datasets; mitigación con
  reporte por dimensión y umbrales (ADR-027).
- **Linked to**: ADR-027 (reporte por dimensión + per_dimension_status),
  ADR-028 (corpus latinoamericano), ADR-002 (Jung directo, lectura
  interpretativa).

## ADR-027 — Reporte por dimensión Big Five con umbrales R²>0.20, r>0.30
**Status**: Accepted (2026-04-14)
**Context**: El módulo analítico (ADR-026) entrena cinco regresores
independientes; nada garantiza que las cinco dimensiones alcancen el mismo
nivel de calidad de inferencia. La literatura de inferencia de personalidad
por texto reporta consistentemente que ciertas dimensiones (típicamente
extraversión y apertura) son más predecibles desde estilo lingüístico que
otras (amabilidad, neuroticismo). Reportar un único score global oculta esa
heterogeneidad y daría al usuario y al tribunal una falsa sensación de
uniformidad psicométrica.
**Decision**: Las métricas (MSE, R² de Pearson, r de Pearson) se calculan
y reportan **por dimensión Big Five**. Se adoptan dos umbrales mínimos
conservadores: **R² > 0.20** y **r > 0.30**, valores típicos de la
literatura para inferencia de rasgos a partir de texto libre. Las
dimensiones que **no** alcancen ambos umbrales en el split de test se
reportan honestamente como "no incluidas en el componente cuantitativo del
perfil"; en el contrato del módulo eso se traduce como
`per_dimension_status: "low_confidence"`. Las que pasan se marcan como
`"ok"`. La capa narrativa recibe ambas señales y, ante una dimensión
`low_confidence`, modera explícitamente su lectura interpretativa.
**Consequences**:
- **Ganancia**: honestidad psicométrica; el usuario ve qué dimensiones son
  fiables y cuáles no; el tribunal puede auditar dimensión por dimensión.
- **Costo**: el reporte público es más complejo que un single score.
- **Linked to**: ADR-026 (módulo analítico propio), ADR-002 (Jung directo,
  lectura interpretativa que se modera ante `low_confidence`),
  `lib/prompts/interpret-narrative.ts` (consume `per_dimension_status`).

## ADR-028 — Corpus latinoamericano construido con asistencia IA generativa + rúbrica manual
**Status**: Accepted (2026-04-14)
**Context**: El corpus Essays (Pennebaker & King 1999) está en inglés y
representa estudiantes universitarios estadounidenses; usarlo solo
introduciría un sesgo cultural/lingüístico inaceptable para una plataforma
que se presenta en español latinoamericano con voseo argentino. El proyecto
necesita un corpus complementario en español latinoamericano. Las opciones
fueron: (a) recolectar textos reales con consentimiento (timeline largo,
requiere ética formal); (b) usar un corpus académico latinoamericano
existente (no se identificó uno con etiquetas Big Five en la cantidad
necesaria); (c) construir el corpus con asistencia de IA generativa
guiada por un prompt explícito y validado manualmente con rúbrica.
**Decision**: Se construye un corpus latinoamericano propio con n=50-100
casos en `ml/data/latinoamericano/`. Cada caso se redacta en voseo
argentino, dirigido por un prompt que especifica una dimensión Big Five
target con dirección alta o baja, y se valida manualmente contra una
rúbrica documentada en `ml/data/latinoamericano/rubrica_validacion.md`. La
rúbrica cubre: claridad de marcadores lingüísticos asociados a la
dimensión target (Pennebaker & King 1999), naturalidad del voseo, ausencia
de jerga clínica, longitud apropiada y diversidad temática. El versionado
del corpus es responsabilidad de DVC (ADR-026).
**Consequences**:
- **Ganancia**: corpus en idioma de uso real del producto, disponible en
  el timeline del TFG, controlable de punta a punta.
- **Riesgo declarado**: sesgo del modelo generador (los textos pueden
  reflejar el sesgo estilístico del LLM más que la diversidad real de la
  población). **Mitigación**: rúbrica documentada y aplicada
  manualmente; validación cruzada con muestras ciegas de textos humanos
  como trabajo posterior recomendado.
- **Reproducibilidad**: el prompt usado y la rúbrica se versionan con el
  corpus para que cualquier auditor pueda evaluar la construcción.
- **Linked to**: ADR-026 (módulo analítico), ADR-027 (umbrales por
  dimensión sobre el split test del corpus), Pennebaker & King (1999)
  como anclaje de "linguistic styles + personality" para justificar el
  enfoque text → Big Five.
