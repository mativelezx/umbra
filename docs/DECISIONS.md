# Umbra — Architecture Decision Records (ADRs)

This file is the source of truth for major architectural decisions. Each ADR
is immutable once written — if a decision changes, append a new ADR that
supersedes the old one and mark the old one as `SUPERSEDED by ADR-NNN`.

Format: `ADR-NNN — Title` · `Status` · `Context` · `Decision` · `Consequences`.

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
**Context**: MBTI is widely criticized as pseudoscience (Stein 2019, Pittenger
1993). Jung's original cognitive function theory from Tipos Psicológicos (1921)
is theoretically coherent and has renewed academic interest — Sauer (2020)
"Rehabilitating Jung's Cognitive Function Theory" frames functions as the
cognitive architecture generating Big Five behavioral traits.
**Decision**: `lib/knowledge/jung-functions.ts` cites Jung (1921) directly.
No MBTI terminology in code, prompts, or UI. The 8 functions (Se, Si, Ne, Ni,
Te, Ti, Fe, Fi) are primary.
**Consequences**: We lose the recognizability of "INFJ / INTP" labels but gain
academic defensibility. The paper can cite Sauer (2020) as theoretical framing.

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
**Consequences**: 0.5-1 day of debugging RLS edge cases during migration.
Future-proof against further auth-helpers abandonment.

## ADR-005 — Claude model ID as environment variable, pinned SKU
**Status**: Accepted (2026-04-12) · **Amended by ADR-014**
**Context**: Master doc hardcoded `CLAUDE_MODEL = 'claude-sonnet-4-20250514'`.
Claude Sonnet 4.6 is now available (April 2026) and is cheaper/faster/better.
Hardcoding a model creates a code change every time a new model lands.
**Decision**: `lib/claude/client.ts` reads `process.env.ANTHROPIC_MODEL_ID`,
default `claude-sonnet-4-6`. All routes use the env var.
**Consequences**: Model can be swapped via env var without a code deploy.
Trade-off: if the env var uses an alias (e.g. `claude-sonnet-4-6`), Anthropic
may silently upgrade the underlying version and break H1 determinism. See
ADR-014 for the pinned-SKU fix.

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
archetypes" (Hero, Sage, Explorer, Creator, Caregiver, Rebel) are behavioral,
validated for adult personality, and map cleanly to Big Five.
**Decision**: `lib/knowledge/archetypes.ts` uses Pearson's 6-archetype system
(Carol S. Pearson, "The Hero Within" 1986 / "Awakening the Heroes Within" 1991).
The 6 archetypes are frozen and match `types/index.ts` enum.
**Consequences**: Assignment criteria are rule-based (Big Five + Jung function
patterns → archetype). Prompts + narrative + SVG avatars + eval golden cases
all depend on this choice; changing archetypes later is expensive.

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
**Context**: Project needs a test runner for Phase 2 onwards (eval suite,
regression tests, unit tests). Jest is mature but slow to start and has
complex ESM handling. Vitest is Vite-native, fast ESM, built-in coverage.
**Decision**: `vitest` + `@vitest/ui`. Test files colocated with source
(`*.test.ts` next to `*.ts`) for unit tests; `lib/evals/` for eval suite.
Run via `npm run test` (unit + integration) and `npm run eval` (eval suite).
**Consequences**: Faster CI. Simpler config. Any library that requires jest
specifically won't work. No such library in our stack.

## ADR-010 — i18n library is `next-intl@^3`
**Status**: Accepted (2026-04-12)
**Context**: Master doc mentions rioplatense Spanish. For the TFG we ship only
ES-AR, but retrofit i18n later is painful (all strings inline to dictionary).
Two candidates: `next-intl` (App Router native middleware) or `@formatjs/intl`
(library-only, no middleware).
**Decision**: `next-intl@^3`. Locales: `es-AR` (primary, voseo and rioplatense
vocabulary), `en` (stub). Middleware-based locale detection. Messages live in
`messages/es-AR.json` and `messages/en.json`. All component strings pass
through `t()` from day 1.
**Consequences**: Day 1 of Phase 2 has i18n boilerplate. English dictionary
starts empty and can be filled later. No runtime penalty — JSON dictionaries
are bundled per locale.

## ADR-011 — Eval hypotheses: H1 (determinism) + H2 (cross-model paraphrase)
**Status**: Accepted (2026-04-12) · **Amended by ADR-014**
**Context**: The paper needs falsifiable preregistered hypotheses. User-level
test-retest (same user, new text at day 7) is the strongest methodologically
but requires human subjects + ethics approval. Model-level determinism is
cheap and runs on CI.
**Decision**: Two hypotheses preregistered on OSF:
- H1: Determinism at `temperature=0` with pinned model SKU → scores deviate
  < 5 points across 5 runs on the same case.
- H2: Cross-model paraphrase consistency — 3 rewrites of each case produced
  by two different rewriters (GPT + local Llama) → scores deviate < 10 points
  across rewrites.
User-level test-retest is NOT preregistered. It's noted as future work if
ethics clearance unblocks a longitudinal study.
**Consequences**: H1 is technically a determinism check of the instrument,
not a construct check. H2 is a construct check but also measures cross-model
robustness (stronger claim). Both run on CI against the committed eval cache.

## ADR-012 — OSF Standard Prereg with computational-study framing
**Status**: Accepted (2026-04-12)
**Context**: OSF offers Secondary-Data Prereg (for reanalyzed existing data),
Primary-Data Prereg (for human-subjects trials), and Standard Prereg. Umbra's
eval cases are forward-collected computational stimuli — neither secondary
nor human-subjects.
**Decision**: Use OSF Standard Preregistration with an explicit computational-
study framing paragraph: "the model acts as a stochastic instrument; eval
cases are the fixed stimuli; temperature=0 with pinned SKU defines
determinism." Template sections map to Umbra's hypotheses as documented in
the CEO plan.
**Consequences**: Template choice is non-standard but defensible. Thesis
advisor should review the framing before OSF submission.

## ADR-013 — `research_dataset` is pseudonymization, not anonymization
**Status**: Accepted (2026-04-12)
**Context**: Consent forms often promise "anonymization," which implies
irreversibility. In practice, any scheme that lets us delete a specific
user's research rows on request (legal requirement under Ley 25.326 if the
consent is revocable) is by definition reversible by whoever holds the
linking key. We cannot promise both irreversibility AND right-to-delete.
**Decision**: `research_dataset.user_hash = HMAC(user_id, RESEARCH_PEPPER)`.
This is pseudonymization — the server with pepper access can re-link.
Consent text discloses this honestly: "sus datos seran seudonomizados, no
anonimizados irreversiblemente; el responsable con acceso a la clave secreta
podria tecnicamente re-vincularlos." Research rows ARE included in
`/api/account/export` when `research_opt_in=true` (same code path that
enables delete-with-purge). Legal basis under Ley 25.326 is explicit
informed consent + data minimization + access control.
**Consequences**: Consent text is longer and less marketable. Legally honest
and ethically defensible.

## ADR-014 — Eval reproducibility via committed cache snapshots + pinned SKU
**Status**: Accepted (2026-04-12) · **Amends ADR-005, ADR-011**
**Context**: The reproducibility claim "clone repo, run `npm run eval`"
depends on a live third-party API, a mutable hosted model, and a gitignored
cache. If Anthropic silently updates `claude-sonnet-4-6` (the alias) to a
new version, H1 determinism breaks and past results become unreproducible.
**Decision**: (1) Pin `ANTHROPIC_MODEL_ID` to a dated SKU like
`claude-sonnet-4-6-20260301`, never an alias. (2) Eval snapshots are written
to `lib/evals/.cache/snapshot-{date}-{model}.json` and **committed to the
repo** (not gitignored). (3) Paper methods section points to the git commit
hash of the snapshot used for published results. (4) Reviewers reproduce via
`npm run eval -- --from-cache` offline with zero API cost.
**Consequences**: Snapshot files add ~1-5 MB to the repo per eval run.
Eval runs that regenerate the snapshot must be intentional
(`npm run eval -- --no-cache`). Paper reproducibility claim is now honest:
"reproducible against committed snapshot at commit X" not "reproducible by
running against the live API".

## ADR-015 — Big Five content from IPIP-NEO (public domain), not NEO-PI-R
**Status**: Accepted (2026-04-12)
**Context**: The NEO-PI-R manual (Costa & McCrae 1992) is proprietary; PAR
Inc. licenses its use for commercial and some academic purposes. "Paraphrased
with citation" of manual content in a public repo + real product is not a
license. IPIP-NEO (International Personality Item Pool, Goldberg 1999) is
public domain, maps to the same 5 factors × 30 facets structure, and its
item content + scoring rationale can be freely bundled with the repo and paper.
**Decision**: `lib/knowledge/big-five.ts` cites IPIP-NEO, not NEO-PI-R. The
paper methods section names IPIP-NEO as the Big Five instrument. Facet
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
**Status**: Accepted (2026-04-12, from plan-eng-review)
**Context**: The plan says KB content is "paraphrased-with-citation" as policy
but never defines the comment format. Without enforcement, citations drift
into inconsistent styles and the paper methods section becomes impossible to
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
discipline. Paper methods section becomes trivially auditable — grep for
`@verbatim false` to find all paraphrased content.

## ADR-019 — `analysis_raw` JSONB retention policy (30 days)
**Status**: Accepted (2026-04-12, from plan-eng-review)
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

## ADR-020 — H2 cross-model rewriters: Sonnet + Haiku, intra-vendor
**Status**: Accepted (2026-04-12, from plan-eng-review)
**Context**: H2 preregistered hypothesis requires "cross-model paraphrase
consistency" — run a case through different rewriters, assert profile
shifts < 10 points. Originally specified GPT + local Llama (via Ollama), but
local Llama doesn't run on GitHub Actions runners (no GPU, size limits).
**Decision**: H2 uses Claude Sonnet (pinned SKU) + Claude Haiku (pinned SKU)
as the two rewriters. Both Anthropic, but architecturally distinct model
sizes. This is "intra-vendor cross-model" rather than "cross-vendor."
Paper methods section documents this as a known limitation: "H2 measures
robustness across model scales within a single vendor family; a full
cross-vendor test is future work."
**Consequences**: Lower methodological strength than cross-vendor but fully
automatable on CI. Honest limitation disclosed upfront.

## ADR-021 — Pepper versioning for rotation safety
**Status**: Accepted (2026-04-12, from plan-eng-review)
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
**Status**: Accepted (2026-04-12, from plan-eng-review)
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

## ADR-017 — Phase 0 Ethics Gate blocks Migration 002
**Status**: Accepted (2026-04-12)
**Context**: The research participant feature requires ethics clearance
(Siglo 21 institutional policy varies). Shipping the schema (`research_dataset`,
`profiles.research_opt_in`), consent text, and OSF wording BEFORE knowing
whether ethics path is cleared creates a sequencing contradiction — codex
outside voice finding 1.
**Decision**: Phase 0 is a 30-min meeting with the TFG advisor, held BEFORE
Phase 1.5.6 (Migration 002). Two branches: **Branch A** (ethics cleared with
consent-only) ships the full schema + research feature. **Branch B** (ethics
path unclear or blocked) ships Migration 002 without `research_dataset` and
without the research section in the consent form. The paper's validation
evidence rests solely on eval H1 + H2 in Branch B.
**Consequences**: 30-min gate protects weeks of rework. Branch B is still a
defensible TFG — the eval suite is the primary evidence regardless.

## ADR-023 — Validación mixed-methods: Branch B (computacional) + M3 think-aloud (n=8-10)
**Status**: Accepted (2026-04-14)
**Context**: ADR-017 dejó abierta la elección entre Branch A (dataset de
investigación con usuarios reales pseudonimizados) y Branch B (validación
puramente computacional). Con la decisión del autor de optimizar para
aprobación del TFG con mínimo riesgo, se evaluaron tres modalidades de
validación con usuarios: M1 (estudio formal n≥30 con sesiones controladas y
posible comité de ética), M2 (instrumentación in-app opt-in dependiente de
tráfico), M3 (think-aloud con reclutamiento controlado de amigos y
compañeros, n=8-10). M1 tiene alta varianza por dropout y burocracia ética;
M2 depende de tráfico que el autor no controla (riesgo de n=0 a dos semanas
de defensa); M3 es controlable de punta a punta y es defendible
académicamente por la regla de Nielsen (n=5 detecta 85% de problemas de
usabilidad; Nielsen & Landauer 1993). Adicionalmente, el audit de Fase 0
reveló que `lib/evals/` no existe todavía — H1/H2 deben ser escritos, no
solo corridos.
**Decision**: El TFG adopta un enfoque mixed-methods con dos pilares:
(1) **Branch B computacional como primary validation evidence** con tres
hipótesis preregistradas en OSF: H1 (determinismo, stddev<2.5 a temp=0),
H2 (robustez a paráfrasis intra-vendor, max pairwise delta<10 — ADR-020),
H3 (safety empírico del crisis classifier, recall≥0.95 y precision≥0.85
sobre un dataset etiquetado n=100).
(2) **M3 think-aloud como secondary user validation** con reclutamiento
controlado de 8-10 amigos y compañeros de Siglo 21, protocolo fijo (SUS en
español + 3 preguntas abiertas + grabación con consentimiento), análisis
cuanti (SUS promedio + stddev) y cuali (coding temático con citas textuales
anonimizadas). Sin comité de ética formal — es usability testing informal
con consentimiento escrito simple, práctica estándar en HCI aplicada.
El código `lib/evals/` se escribe en Fase 5 del IMPLEMENTATION_PLAN.md
antes de correr H1/H2. La tesis presenta Branch B como primary y M3 como
secondary en la sección de Validación.
**Consequences**:
- **Ganancia**: control total sobre variables, cero dependencia de tráfico
  externo, cero burocracia ética, timeline defendible (~6-7 semanas),
  mixed-methods convincente para tribunal de Ingeniería en Software.
- **Costo**: no podemos afirmar usabilidad con poder estadístico de n≥30;
  el coding temático cualitativo depende de la calidad de las 8-10
  sesiones.
- **Plan B documentado**: si M3 no llega a n=8 por dropout, pivotamos a
  reporte honest con el n obtenido y nos apoyamos en H1/H2/H3 como evidencia
  primary. El tribunal no puede objetar si el pivot está documentado desde
  antes de la recolección.
- **Scope cut explícito**: UMUX-Lite/METUX in-app, shipeo a producción,
  framer-motion, chat persistente, y todos los items estructurales del
  research de UX quedan fuera del TFG y pasan a "Trabajo futuro" en la
  tesis. Ver IMPLEMENTATION_PLAN.md sección "Scope explícitamente FUERA del
  TFG".
- **Timeline realista**: 6-7 semanas calendario con 3-4 hs/día; 4-5 semanas
  full-time. Ver IMPLEMENTATION_PLAN.md timeline.
- **Supersedes**: reemplaza la ambigüedad de ADR-017 sobre qué branch
  adoptar. ADR-017 sigue vigente para la estructura de Migration 002.

## ADR-024 — Parche Ley 25.326: consent_text_hash + locale en consent_records
**Status**: Accepted (2026-04-14)
**Context**: El audit de Fase 0 (2026-04-14) identificó que
`supabase/migrations/002_core_tables.sql` crea la tabla `consent_records`
con `consent_version TEXT`, `accepted_at`, `ip_hash + pepper_version`, y
`user_agent`, pero **no almacena un hash verificable del texto consentido
verbatim ni el locale**. Para datos psicológicos sensibles bajo Ley 25.326
(datos sensibles — art. 2 y art. 7), la autoridad de aplicación (AAIP)
exige que el consentimiento sea "preciso e informado", lo cual requiere
poder demostrar qué texto específico vio el usuario al aceptar. El campo
`consent_version TEXT` alone no es suficiente: si mañana se corrige una
tipografía o una frase del texto de consentimiento manteniendo la versión
(o incluso cambiando la versión retroactivamente por error), no hay forma
de auditar qué vio históricamente el usuario X. Adicionalmente, el
`consent_records` schema no captura `locale`, lo cual en un contexto
multi-idioma futuro (next-intl ya está instalado — ADR-010) puede hacer
imposible distinguir a un usuario que consintió en español vs inglés.
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
Esta migration es parte de Fase 5 del IMPLEMENTATION_PLAN.md (task T5.8).
**Consequences**:
- **Ganancia**: auditabilidad completa del consentimiento bajo Ley 25.326;
  capacidad de probar ante la AAIP o ante el usuario mismo qué texto
  consintió; preparación para multi-idioma futuro.
- **Costo**: una migration adicional + actualización de copy en consent
  flow + mantenimiento de archivos verbatim en repo (`content/consent/`).
- **Migración de datos existentes**: los registros anteriores a la
  migration quedan con `consent_text_hash=''` y `locale='es-AR'` (defaults).
  Se documenta en LEGAL.md como "consentimientos pre-migración 004
  auditables solo por `consent_version`".
- **Dependencia**: [docs/features/CONSENT.md](../features/CONSENT.md) y
  [docs/biz/LEGAL.md](biz/LEGAL.md) deben actualizarse para reflejar el
  nuevo schema.
- **Linked to**: IMPLEMENTATION_PLAN.md T5.8, ADR-021 (pepper versioning —
  mismo patrón de immutable audit trail).
