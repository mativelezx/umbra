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

## ADR-002 — Separación entre teoría medida (Big Five) y diseño narrativo (Jung, Pearson, Positive Computing)
**Status**: Accepted (2026-04-27) · **Reemplaza la versión original del 2026-04-12**
**Context**: La versión original de este ADR (12/04/2026) declaraba a las
funciones cognitivas de Jung como dimensiones inferidas primarias del
sistema, junto a Big Five. La auditoría defensiva del TFG (sesión 26-27/04)
identificó esa articulación como el flanco psicométrico más serio frente al
tribunal: cuatro tradiciones teóricas inferidas automáticamente sobre texto
introspectivo libre, sin instrumento validado para tres de ellas, abre una
crítica sostenida sobre el respaldo psicométrico del componente medido.
**Decision**: La inferencia psicológica automática del sistema se restringe
al modelo de los **Big Five operacionalizado mediante IPIP-NEO**
(Goldberg, 1999; ADR-015), ejecutada por el módulo ML propio (DistilBERT
congelado + Ridge multi-output; ver ADR-026). Las funciones cognitivas de
Jung (Jung, 1921), los arquetipos aplicados de Pearson (Pearson, 1991) y
los principios de Positive Computing (Calvo y Peters, 2014) pasan a ser
**elementos de diseño narrativo y conversacional, NO dimensiones inferidas**.
La capa narrativa basada en Anthropic Claude las produce como lectura
interpretativa, con encuadre explícito de su carácter heurístico y no
diagnóstico. El conocimiento estructurado de `lib/knowledge/jung-functions.ts`,
`lib/knowledge/archetypes.ts` y `lib/knowledge/positive-computing.ts`
queda como insumo del prompt narrativo y como anexo académico, no como
taxonomía de medición.
**Consequences**:
- Blindaje psicométrico del componente medido: instrumento de dominio
  público, métricas estándar de regresión por dimensión (MSE / R² / r de
  Pearson), pipeline reproducible (ver ADR-026).
- Honestidad sobre el carácter de las lecturas adicionales: el usuario
  recibe la lectura de funciones Jung y de arquetipo enmarcada como
  interpretación, no como medición.
- El módulo ML propio infiere solo Big Five (5 puntuaciones) — esquema
  `psychological_profiles.openness/conscientiousness/extraversion/agreeableness/neuroticism`.
- La capa narrativa (Pass 1.5 en `lib/prompts/interpret-narrative.ts`)
  produce las lecturas Jung + arquetipo + razonamiento como output
  estructurado interpretativo.
- En el TFG y en cualquier comunicación pública del proyecto se mantiene
  esta distinción explícitamente. Tabla de trazabilidad sección 6.4 del
  TP1 entregado.
- **Reemplaza**: la versión original de este ADR del 12/04 que declaraba
  a las 8 funciones de Jung como dimensiones primarias inferidas. Esa
  redacción estaba desalineada con el TFG entregado y se corrigió en este
  refactor.
- **Linked to**: ADR-007 (archetypes como etiqueta narrativa, amendado),
  ADR-015 (IPIP-NEO como instrumento), ADR-026 (módulo ML propio),
  ADR-027 (política UI bajo umbral por dimensión), ADR-028 (validación
  primary = métricas ML por dimensión).

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

## ADR-007 — Archetypes sourced from Pearson applied system (used as narrative label, not measurement)
**Status**: Accepted (2026-04-12) · **Amended (2026-04-27) by ADR-002 v2 + ADR-026**
**Context**: Jung's structural archetypes (Anima, Animus, Shadow, Self) are
intra-psychic and don't map cleanly to behavioral profiles. Pearson's "applied
archetypes" (Hero, Sage, Explorer, Creator, Caregiver, Rebel) are behavioral,
validated for adult personality, and articulan bien con Big Five como lectura
interpretativa.
**Decision**: `lib/knowledge/archetypes.ts` uses Pearson's 6-archetype system
(Carol S. Pearson, "The Hero Within" 1986 / "Awakening the Heroes Within" 1991).
The 6 archetypes are frozen and match `types/index.ts` enum. **A partir del
pivot ML (ADR-002 v2, 2026-04-27), el arquetipo NO se infiere como medición
psicométrica**: la capa narrativa (Claude, Pass 1.5 en
`lib/prompts/interpret-narrative.ts`) lo asigna como **etiqueta interpretativa
derivada de los Big Five inferidos por el módulo ML propio**, con encuadre
explícito de su carácter heurístico. Sirve como ancla narrativa para el
retrato escrito y la conversación contextualizada.
**Consequences**: Assignment criteria are heurísticas (Big Five inferido por
módulo ML → arquetipo más resonante asignado por Claude con racional citado).
Prompts + narrative + SVG avatars dependen de esta elección; el campo
`psychological_profiles.archetype` se mantiene en el esquema porque es
input narrativo persistido, no medición.
**Linked to**: ADR-002 (separación medido vs narrativo), ADR-026 (módulo ML
propio), ADR-028 (validación primary = métricas ML por dimensión).

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
**Status**: SUPERSEDED by ADR-028 (2026-04-27) · Originally Accepted (2026-04-12) · **Amended by ADR-014**

**Nota de migración (2026-04-27)**: H1 y H2 surgieron cuando el Pass 1
inferencial era íntegramente Claude. Tras el pivot ML (ADR-002 v2 +
ADR-026), la inferencia Big Five la realiza un regresor entrenado y
determinístico por construcción; el determinismo conceptual de H1 deja
de ser una pregunta de investigación. La validación primary del TFG
entregado son **métricas estándar de regresión por dimensión Big Five**
(MSE / R² / r de Pearson) reportadas por el módulo ML — ver ADR-028.
H2 queda absorbida en la robustez del regresor entrenado sobre Essays +
corpus rioplatense. Los resultados empíricos viejos de H1/H2 se preservan
en `eval-results/legacy/` como histórico, no son evidencia primary del
TFG.


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
**Status**: SUPERSEDED by ADR-023 v2 + ADR-028 (2026-04-27) · Originally Accepted (2026-04-12)

**Nota de migración (2026-04-27)**: La preregistración en OSF se descartó
como parte del pivot ML. La validación primary del TFG entregado pasó a
ser el reporte honesto de métricas por dimensión Big Five del módulo ML
propio, sostenida por el versionado DVC del corpus + tracking MLflow del
entrenamiento + commits del repo público + métricas committeadas en
`metrics.json` y `eval_metrics.json`. Esa cadena de auditabilidad cumple
el rol que tenía OSF (reproducibilidad + trazabilidad de decisiones de
análisis) sin la fricción de subir y mantener un preregistro externo. El
archivo `docs/research/osf/preregistration-standard.md` queda eliminado;
su contenido vivo se redistribuyó a ADR-026 + ADR-028 + VALIDATION.md.


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
**Status**: PARTIALLY SUPERSEDED by ADR-026 (2026-04-27) · Originally Accepted (2026-04-12) · **Amends ADR-005, ADR-011**

**Nota de migración (2026-04-27)**: La parte que aplicaba a la
reproducibilidad de H1/H2 sobre Claude (snapshots de respuestas) queda
descontinuada porque H1/H2 ya no son validación primary (ADR-011
SUPERSEDED). La parte que sigue vigente: **el modelo Claude usado por la
capa narrativa permanece pinned a SKU dateado** (`ANTHROPIC_MODEL_ID`
nunca un alias) para que la narrativa generada sea estable sesión a
sesión y la auditoría de cualquier output narrativo sea trazable a un
modelo concreto. La reproducibilidad del componente analítico (Big Five)
ahora se sostiene en **DVC + MLflow + metrics.json committeado**
(ADR-026), no en snapshots de respuestas Claude.


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
**Status**: SUPERSEDED by ADR-026 + ADR-028 (2026-04-27) · Originally Accepted (2026-04-12, from plan-eng-review)

**Nota de migración (2026-04-27)**: H2 quedó deprecada con el pivot ML
(ADR-011 SUPERSEDED). La robustez del componente analítico ahora se mide
sobre el regresor entrenado (no sobre Claude rewriters), y se reporta
como métrica MSE / R² / r de Pearson por dimensión Big Five sobre
splits train/val/test 80/10/10 del corpus combinado Essays + corpus
rioplatense (ver ADR-026, ADR-028).


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

## ADR-023 — Validación mixed-methods: módulo ML (primary) + crisis classifier (H3) + M3 think-aloud (secondary)
**Status**: AMENDED (2026-04-27) · Originally Accepted (2026-04-14)

**Nota de migración (2026-04-27)**: La versión original de este ADR
adoptaba un enfoque mixed-methods con tres hipótesis preregistradas en
OSF (H1 determinismo, H2 paráfrasis, H3 crisis classifier) + M3
think-aloud. Tras el pivot ML (ADR-002 v2 + ADR-026), el pilar
computacional primary se reemplaza por las **métricas estándar de
regresión por dimensión Big Five** del módulo ML propio (ver ADR-028).
El esquema mixed-methods vigente es: (1) **primary computational**:
métricas MSE / R² / r de Pearson por dimensión Big Five sobre el
regresor Ridge entrenado (umbrales R² > 0.20 y r > 0.30 por dimensión;
las que caen por debajo se reportan honestamente y quedan fuera del
componente cuantitativo del perfil); (2) **safety computational**: H3
mantiene precision/recall del crisis classifier (recall ≥ 0.95,
precision ≥ 0.85) — es ortogonal al pivot ML; (3) **secondary user**:
M3 think-aloud n=8-10 con SUS en español rioplatense + coding temático,
sin cambios. La preregistración OSF queda eliminada (ver ADR-012
SUPERSEDED).


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

## ADR-025 — Aplicación de heurísticas Google PAIR en Fase 1 Dashboard/Chat/Onboarding
**Status**: Accepted (2026-04-14)
**Context**: El IMPLEMENTATION_PLAN.md Fase 1 introduce 7 cambios de UX
(confidence surface, pull quotes, line-length 65ch, sticky TOC con
scroll-spy, InfoPopover en dimensiones Big Five/Jung, InsightPing
colapsable, QuickPromptChips siempre visibles). Para un TFG de Ingeniería
en Software estas mejoras necesitan estar fundamentadas como decisiones
técnicas defendibles, no como preferencia estética. Sin una fundamentación
explícita, un tribunal puede objetar "son solo cambios de estilo". La
literatura de HCI aplicada a IA tiene un marco establecido y citable: el
**People + AI Guidebook** de Google PAIR (pair.withgoogle.com/guidebook),
con 6 capítulos de heurísticas que cubren todo el ciclo de vida de un
producto human-centered AI: (1) User Needs + Success Definition,
(2) Data Collection + Evaluation, (3) Mental Models, (4) Explainability +
Trust, (5) Feedback + Control, (6) Errors + Graceful Failure.
**Decision**: Cada tarea de Fase 1 se mapea explícitamente a uno de los
capítulos del PAIR Guidebook y se documenta el racional:

- **T1.1 Confidence surface** (ArchetypeCard + QuickGlance) → PAIR cap. 4
  Explainability + Trust. Fundamento: "the user should be able to see
  the model's confidence in its output and the basis for that
  confidence". Implementación: se lee `analysis_raw.confidence` del
  profileRow, se renderiza como barra + porcentaje + "basado en N
  respuestas" con InfoPopover que explica qué significa certeza baja vs
  alta. El usuario entiende que un valor bajo no es "falla" sino
  "refinable con más contexto".
- **T1.2 Pull quotes** (SectionedNarrative parser + prompt) → PAIR cap. 3
  Mental Models. Fundamento: los modelos mentales se construyen mejor
  con anclas memorables, no con texto plano. Implementación: el prompt
  de generación de narrativa ahora instruye a Claude a marcar 1-2
  frases esenciales por sección con \`> \` (markdown blockquote); el
  parser reconoce esos blockquotes y los renderiza como callouts
  italic grandes. La prosa gana ritmo y el usuario recuerda las frases
  destacadas mucho más que un muro de texto.
- **T1.3 Line-length 65ch** → PAIR cap. 3 Mental Models (cognitive load
  reduction). Fundamento: la investigación en tipografía (Bringhurst
  2005, Smashing 2022) establece que líneas de 60-80 caracteres son
  óptimas para comprensión. Implementación: la columna interna de
  SectionedNarrative se restringe a \`max-w-[68ch]\`, lo cual deja ~65ch
  para la prosa y aproxima los pull quotes dentro del mismo ritmo.
- **T1.4 Sticky TOC con scroll-spy** (NarrativeTOC nuevo) → PAIR cap. 5
  Feedback + Control. Fundamento: el usuario necesita saber dónde está
  y poder navegar un documento largo sin perder contexto. Implementación:
  nuevo componente client-side que usa IntersectionObserver para spy la
  sección visible y resaltar su anchor. Los 5 headers (Apertura, Cómo
  te movés, Lo que te cuesta, Lo que te mueve, Lo que queda por explorar)
  son fijos por el prompt de narrativa, así que la fuente de verdad está
  en \`lib/dimensions/narrative-sections.ts\` con regex + slugs. Visible
  solo en \`lg:\` (desktop) para no crowdear el scroll en mobile.
- **T1.5 InfoPopover en dimensiones** (DimensionBar + LiveProfilePanel +
  QuickGlance + JungAxisView) → PAIR cap. 4 Explainability + Trust y
  cap. 3 Mental Models. Fundamento: toda etiqueta técnica que ve el
  usuario (openness, conscientiousness, Ni, Ti, etc.) debe estar a un
  click de una explicación en español plano con ejemplo. Implementación:
  \`DimensionBar\` gana un prop opcional \`info\` con title/body/example;
  si está presente, renderiza un botón "?" al lado del label que abre
  un popover. Se aplica a las 5 Big Five + 8 funciones Jung en
  LiveProfilePanel y QuickGlance; JungAxisView ya lo tenía desde antes.
- **T1.6 InsightPing colapsable** (InsightPing simplificado +
  LiveProfilePanel con botón toggle) → PAIR cap. 5 Feedback + Control.
  Fundamento: los insights generados durante el onboarding son
  discoveries del usuario sobre sí mismo; hacerlos auto-expire en 4.2s
  los vuelve efímeros, el usuario los pierde si está leyendo la pregunta.
  Implementación: InsightPing ya no tiene setTimeout; LiveProfilePanel
  renderiza los insights como una lista colapsable con header
  "Descubrimientos · N" + caret que toggle expand/collapse. Por default
  expandido; el usuario puede contraer para reducir clutter visual.
- **T1.7 QuickPromptChips siempre visibles** (QuickPromptChips con prop
  \`compact\` + ChatShell siempre renderiza) → PAIR cap. 5 Feedback +
  Control y cap. 1 User Needs + Success. Fundamento: los prompts
  sugeridos son entry-points al mirror; limitarlos al empty state
  significa que una vez que la conversación arranca, el usuario no tiene
  forma de volver a descubrir qué preguntas puede hacer. Implementación:
  QuickPromptChips ahora acepta \`compact?: boolean\`; el ChatShell los
  renderiza siempre que haya profile, con \`compact={!isEmpty}\` —
  horizontal scroll strip de 4 pills pequeñas arriba del ChatInput cuando
  hay mensajes, hero full-size cuando el chat está vacío.

**Consequences**:
- **Ganancia académica**: cada cambio de UX está citable en el capítulo
  de Implementación de la tesis con una referencia al PAIR Guidebook,
  transformando "mejoras de estilo" en "aplicación de heurísticas HCI
  validadas". El tribunal no puede objetar "son solo cambios estéticos".
- **Ganancia de producto**: las decisiones son internamente consistentes
  (todas las partes del sistema reducen jerga via InfoPopover, todas
  refuerzan mental models via pull quotes + TOC, todas dan control al
  usuario via collapsible + chips) — el producto se siente más pensado.
- **Costo**: los cambios se deben describir uno a uno en la tesis (no
  agrupar como "polish"). Agrega ~2 páginas al capítulo de
  Implementación pero son páginas defendibles.
- **Positive Computing alignment**: los 7 cambios respetan autonomía
  (el usuario navega, no el sistema), competencia (entiende lo que ve
  sin jerga clínica), y relación (el mirror sigue sintiéndose cercano,
  no clínico). Linkea directamente con [ETHICS.md](biz/ETHICS.md) Calvo
  & Peters principles.
- **Linked to**: IMPLEMENTATION_PLAN.md Fase 1, [VALIDATION.md](biz/VALIDATION.md)
  RQ4, [biz/TFG.md](biz/TFG.md) Metodología, PAIR Guidebook
  (https://pair.withgoogle.com/guidebook/).
- **Superseded by**: future ADRs if PAIR Guidebook is updated or if the
  narrative structure changes.

## ADR-026 — Módulo ML propio: DistilBERT congelado + Ridge multi-output, FastAPI separado, MLflow + DVC
**Status**: Accepted (2026-04-27)
**Context**: El TFG entregado (TP1, 26-04-2026) describe un componente
analítico propio bajo prácticas MLOps que infiere las cinco dimensiones
del modelo Big Five sobre texto introspectivo, en respuesta directa al
pedido del director de tesis (Mainero, inbox Canvas 16/04/2026: "buscaría
la forma de que este módulo lo realizara algún sistema del tipo MLOp
realizado por vos"). El código pre-pivot inferenciaba Big Five con un
prompt a Claude Sonnet (`lib/prompts/analyze-profile.ts`), lo que
contradecía explícitamente al TFG. Este ADR documenta la decisión
arquitectónica que cierra esa brecha.
**Decision**: El componente analítico de Umbra se implementa como
**módulo Python independiente** ubicado en `/ml/` del repositorio,
servido como API HTTP por FastAPI (`/ml/src/api_server.py` con endpoint
`POST /infer`). El frontend Next.js lo consume vía cliente TypeScript
(`lib/ml-client.ts`) usando la variable de entorno `ML_API_URL`. El
módulo NO se empaqueta en el bundle de Vercel — corre como servicio
separado (en desarrollo: `localhost:8000`; despliegue listo en Render
o Fly.io vía `Dockerfile` y `render.yaml` committeados). La arquitectura
del módulo es de **dos etapas**:

1. **Etapa 1 — extractor de embeddings congelado**: DistilBERT base
   multilingual cased (Sanh et al., 2019), cargado preentrenado, con
   pesos congelados (`requires_grad = False`). Pooling sobre el token
   CLS. Cobertura lingüística inglés + español rioplatense en un solo
   modelo. Estrategia "frozen embeddings" recomendada por Howard y
   Ruder (2018) y Peters et al. (2019) cuando el dataset descendente es
   pequeño. NO se hace fine-tuning, NO se exporta a ONNX, NO se publica
   en HuggingFace Hub.
2. **Etapa 2 — regresor lineal regularizado**: cinco regresores Ridge
   (Hoerl y Kennard, 1970) independientes, uno por dimensión Big Five,
   implementados en scikit-learn (Pedregosa et al., 2011). Hiperparámetro
   `alpha` ajustado por GridSearchCV con `cv=5` sobre el conjunto de
   entrenamiento. Serialización con joblib en `/ml/models/ridge_v1.joblib`.

**Pipeline MLOps**:
- **MLflow** (Zaharia et al., 2018) para tracking de experimentos:
  cada corrida de entrenamiento registra dimensión, alpha óptimo,
  métricas por dimensión, artefactos y enlace al commit.
- **DVC** para versionado del corpus combinado Essays + rioplatense y
  de los splits train/val/test 80/10/10.
- **Pipeline DVC declarado en `/ml/dvc.yaml`** con stages
  `prepare_data → extract_embeddings → train → evaluate`, con métricas
  trackeadas en `metrics.json` y `eval_metrics.json`.
- **GitHub Actions workflow `.github/workflows/ml-validate.yml`**
  ejecuta tests + verifica que las métricas committeadas mantengan los
  umbrales mínimos por dimensión (R² > 0.20 y r > 0.30) o, si caen
  bajo umbral, que la dimensión esté declarada como excluida del
  componente cuantitativo (ver ADR-027).

**Datasets**:
- **Essays** (Pennebaker y King, 1999): ~2500 textos en inglés con
  puntajes Big Five.
- **Corpus rioplatense propio**: 50 casos en español argentino, voseo,
  generados con asistencia LLM y validados manualmente con rúbrica
  documentada en `/ml/data/rioplatense/rubrica_validacion.md`. Origen
  histórico: `lib/evals/cases.ts` (corpus pre-existente del proyecto,
  preservado en su uso original para crisis classifier + tests TS).
- **Versionado**: ambos corpus bajo DVC.
- **Split**: 80/10/10 train/val/test, fijado por seed determinístico.

**Reemplazo del Pass 1 viejo**: `app/api/analyze/route.ts` ahora
infiere Big Five vía `inferBigFive()` del cliente ML, y delega
**solo** funciones cognitivas Jung + arquetipo + razonamiento a un
nuevo prompt narrativo `lib/prompts/interpret-narrative.ts` (Pass 1.5)
que recibe el Big Five inferido como contexto. El archivo viejo
`lib/prompts/analyze-profile.ts` queda marcado deprecated.

**Feature flag**: `ANALYZE_BIG_FIVE_SOURCE` (`ml` | `claude`) permite
rollback inmediato durante la primera iteración tras deploy.

**Consequences**:
- **Ganancia académica**: el código del repo coincide con el TFG
  entregado (sección 6.2.2 Capa analítica + 6.2.3 MLOps + 7.2.3
  Stack ML + 7.3.1 Datasets). En defensa oral, el tribunal puede
  abrir `/ml/`, ejecutar `make eval` y reproducir las métricas
  reportadas en el documento.
- **Costo de infraestructura**: el módulo ML no corre en Vercel
  (Edge runtime no soporta Python). Hosting separado en Render/Fly.io
  agrega ~7-10 USD/mes si se activa producción; en desarrollo y
  defensa académica corre en `localhost:8000` sin costo.
- **Alcance**: la inferencia psicológica automática del sistema queda
  restringida a Big Five (5 puntuaciones). Jung, arquetipos y Positive
  Computing son lectura interpretativa de la capa Claude (ver
  ADR-002 v2).
- **Limitación honestamente reportada**: el corpus rioplatense propio
  es chico (n=50). Las métricas por dimensión sobre rioplatense pueden
  estar bajo el umbral mínimo en algunas dimensiones; en ese caso, la
  dimensión queda excluida del componente cuantitativo del perfil y
  se aborda solo desde la capa narrativa (ADR-027).
- **Linked to**: ADR-002 v2 (separación medido vs narrativo),
  ADR-007 amendado (archetype como narrativa), ADR-011 SUPERSEDED,
  ADR-012 SUPERSEDED, ADR-014 partially SUPERSEDED, ADR-020 SUPERSEDED,
  ADR-023 amendado, ADR-027 (UI bajo umbral), ADR-028 (validación
  primary), TFG TP1 secciones 6.2 y 7.2-7.4.

## ADR-027 — Política de reporte por dimensión bajo umbral mínimo de aceptación
**Status**: Accepted (2026-04-27) · Decisión técnica cerrada; decisión de UX diferida
**Context**: ADR-026 fija umbrales mínimos por dimensión Big Five
(R² > 0.20 y r de Pearson > 0.30). El corpus disponible (Essays +
rioplatense propio n=50) es heterogéneo en idioma y tamaño; es
plausible que una o más dimensiones queden bajo umbral en evaluación
honesta. El TFG entregado (sección 7.4.1 Riesgos) declara
explícitamente que esa situación se reporta y se acota.
**Decision**:
- **Decisión técnica (cerrada en este refactor)**: la API del módulo ML
  (`POST /infer`) devuelve siempre las cinco puntuaciones Big Five y un
  campo adicional `per_dimension_status` con valores `"ok"` o
  `"low_confidence"` por dimensión, calculado al boot del servicio
  leyendo `eval_metrics.json` y comparando contra los umbrales.
- **Decisión de UX (diferida a sesión siguiente)**: la política
  de qué hace el dashboard del usuario con dimensiones marcadas
  `low_confidence` (no mostrar / mostrar con flag visible / mostrar
  con copy interpretativo) se decide cuando estén las métricas reales
  en mano, no antes. Hasta entonces, el frontend consume las cinco
  puntuaciones igual que hoy (compatibilidad backward).
**Consequences**:
- El módulo ML hace su trabajo honesto sin sobrepasar su rol; el
  dashboard hereda la decisión de UX como TODO trazable.
- La cita "umbral mínimo de aceptación por dimensión" del TFG queda
  respaldada con código verificable: la lógica vive en
  `/ml/src/predict.py` y se testea en `/ml/tests/test_predict.py`.
- **Linked to**: ADR-002 v2, ADR-026, TFG TP1 sección 7.4.1.

## ADR-028 — Validación primary del componente analítico = métricas estándar de regresión por dimensión Big Five
**Status**: Accepted (2026-04-27)
**Context**: El TFG entregado (sección 7.2.4 Aseguramiento de calidad +
7.3.1 Datasets) establece que la evaluación del módulo ML se reporta
**por dimensión** con tres métricas estándar de regresión: error
cuadrático medio (MSE), coeficiente de determinación (R²) y coeficiente
de correlación lineal r de Pearson (en referencia al estadístico Karl
Pearson, sin relación con el sistema de arquetipos de Carol Pearson —
clarificación crítica documentada en HANDOFF). Esa metodología reemplaza
las hipótesis pre-pivot H1/H2 (ADR-011 SUPERSEDED) en el rol de
evidencia primary del TFG.
**Decision**: La validación primary del componente analítico de Umbra
es el reporte de **MSE, R² y r de Pearson por cada una de las cinco
dimensiones Big Five**, calculadas sobre el split de test (10% del
corpus combinado Essays + rioplatense, fijado por seed). Las métricas se
reportan en tres bloques en `eval_metrics.json`:
1. `english_only` — solo casos del corpus Essays.
2. `rioplatense_only` — solo casos del corpus propio.
3. `combined` — sobre la unión.

El bloque `rioplatense_only` es el que sustenta la narrativa del TFG
porque es el idioma de uso real del sistema; los otros dos sirven para
mostrar generalización del modelo y para auditoría de cualquier
afirmación cruzada. Las dimensiones que caen bajo umbral (R² ≤ 0.20 o
r ≤ 0.30) se reportan explícitamente como **no incluidas en el
componente cuantitativo del perfil** (ADR-027). H3 (precision/recall del
crisis classifier) se mantiene como validación adicional del pipeline
de seguridad (ortogonal al pivot ML, ver ADR-023 amendado). M3
(think-aloud n=8-10 con SUS) se mantiene como validación secundaria de
usabilidad.
**Consequences**:
- La sección "Validación" del TFG cita números reales del módulo ML
  entrenado, no resultados pre-pivot de H1/H2 sobre Claude.
- La reproducibilidad se garantiza por la cadena DVC (corpus
  versionado) + MLflow (experimento trackeado) + commit del repo
  público (código y métricas committeados) + script `make eval`
  (reproducción local). El tribunal puede ejecutar la cadena completa
  desde cero.
- **Linked to**: ADR-002 v2, ADR-026, ADR-027, ADR-023 amendado, TFG
  TP1 secciones 7.2.4 + 7.3.1 + 7.4.1.
