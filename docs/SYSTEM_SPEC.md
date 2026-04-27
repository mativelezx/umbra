# Umbra — System Specification

> Top-level technical contract. What the system IS, what it DOES, what it
> DOES NOT do, and what it promises to its users and to the academic tribunal.

## 1. System identity

**Name**: Umbra
**Tagline**: Conocé tu sombra. Iluminá tu camino.
**Project type**: TFG (Trabajo Final de Grado) — Ingeniería en Software, Universidad Siglo 21. Dual deliverable: academic thesis + functional product.
**Target users**: Spanish-speaking (latinoamericano) adults interested in self-knowledge, psychology, and personal development. Not a clinical population.
**Primary persona**: 25-40 year old Argentine, some university exposure to psychology, skeptical of MBTI but curious about personality frameworks, seeks depth over quick tests.

## 2. What the system does

Umbra takes a user's introspective written text (either through guided 5-area prompts or a single freetext block) and produces:

1. A **psychological profile** with:
   - Big Five scores (5 dimensions, 0-100 each)
   - Jung cognitive function scores (8 functions, 0-100 each)
   - Dominant archetype (Pearson applied: Hero / Sage / Explorer / Creator / Caregiver / Rebel)
   - Secondary archetype
   - Confidence score (self-reported by Claude)
   - Reasoning trace citing evidence from the user's text

2. A **personalized narrative** (800-1200 words, Spanish latinoamericano, second-person voseo) that interprets the profile as a story rather than diagnosis.

3. A **contextualized chat** where the user can explore their profile with Claude, with full safety guardrails: crisis detection, session timeouts, token budgets, permanent "not therapy" banner.

4. A **development plan** with 3 growth areas, each with 2-3 concrete actions and 2-3 micro-goals each.

5. A **PDF export** containing the full profile, narrative, and plan for offline reflection.

Optional (user opt-in during consent flow):

6. **Research participant mode** — user's anonymized textual data and generated profile are added to a research dataset used for the TFG paper, with a visible "contributed" badge.

7. **Carta al futuro** — user writes a letter to their future self at the end of onboarding. Unlocks after 180 days. Shows letter + snapshot of profile at write-time.

## 3. What the system does NOT do

- **Not therapy.** Explicit non-goal. Permanent banner. Crisis detection routes users to professional resources.
- **Not MBTI.** Uses Jung cognitive functions directly as a narrative reading of the Big Five inferred by the analytical module. Cites Jung (1921). No 16-personality labels.
- **Not a diagnostic tool.** No DSM codes, no clinical language, no "disorder" framing.
- **Not multi-user.** Single-user product; no teams, no organizations, no shared profiles.
- **Not real-time.** No collaborative editing, no presence, no websockets.
- **Not mobile-native.** Responsive web PWA only.
- **Not longitudinal (in v1).** Schema is forward-compatible but re-analysis features are deferred to v1.5.

## 4. Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | `14.2.35+` | Edge runtime for Claude routes |
| Language | TypeScript | `5.5.4+` | strict mode |
| Styling | Tailwind CSS | `3.4.13` | Tokens in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| Fonts | Instrument Serif, Space Grotesk, Inter, JetBrains Mono | via Google Fonts | |
| Icons | @phosphor-icons/react | `2.1.7` | NO emoji in UI |
| State | Zustand | `5.0.0` | One store per domain |
| Auth | Supabase Auth | latest | Via `@supabase/ssr` |
| Database | Supabase PostgreSQL | 15+ | RLS on every table |
| AI (capa narrativa) | Anthropic Claude SDK | `0.30.1` | Identificador de modelo fijado vía `ANTHROPIC_MODEL_ID` |
| Capa analítica | Módulo propio en `ml/` | DistilBERT base multilingual cased congelado + Ridge multi-output (FastAPI + DVC + MLflow) | Ver ADR-026 |
| Charts | Recharts | `2.13.0` | Radar + bars |
| PDF | html2pdf.js | `0.10.2` | Client-side only |
| Validation | Zod | `3.23.8` | All API inputs |
| i18n | next-intl | `^3` | es-AR primary, en stub |
| Testing | Vitest + Playwright | latest | Vitest for units, Playwright for E2E |
| Deploy | Vercel | — | Git-connected CI/CD |

## 5. Component inventory

### App routes
- `/` — Landing
- `/(auth)/login` — Login form
- `/(auth)/register` — Registration form
- `/consent` — Ley 25.326 consent (blocks /onboarding)
- `/onboarding` — Mode selector + guided/freetext flow
- `/dashboard` — Profile visualization
- `/chat` — Contextualized chat with crisis banner
- `/plan` — Development plan
- `/export` — PDF export preview
- `/settings/profile` — Edit personal data
- `/settings/research-opt-out` — Toggle research mode
- `/settings/export` — Data export (ZIP)
- `/settings/delete` — Account deletion request
- `/settings/delete/confirm` — Magic-link delete confirmation

### API routes (Edge unless noted)
- `POST /api/analyze` — Pass 1 profile analysis
- `POST /api/analyze/evidence` — Pass 2 phrase highlights
- `POST /api/narrative` — SSE streaming narrative
- `POST /api/chat` — Chat with full crisis pipeline
- `POST /api/plan` — Development plan generation
- `GET /api/account/export` — Full user data export (Node runtime)
- `POST /api/account/delete/request` — Generate delete magic link (Node)
- `POST /api/account/delete/confirm` — Confirm + cascade delete (Node)
- `POST /api/account/research-opt-out` — Toggle research mode (Node)

### Supabase tables (post-Migration 002)
- `profiles` (Phase 1)
- `psychological_profiles` (Phase 1, + version column in 002)
- `narratives` (Phase 1)
- `conversations` (Phase 1, + last_activity_at in 002)
- `messages` (Phase 1)
- `development_plans` (Phase 1)
- `consent_records` (Migration 002)
- `crisis_events` (Migration 002)
- `rate_limits` (Migration 002)
- `research_dataset` (Migration 002, opt-in)
- `future_letters` (Migration 002)
- `delete_confirmations` (Migration 002)
- `evidence_highlights` (Migration 002, from eng review E4)

All tables have explicit `ENABLE ROW LEVEL SECURITY` and `CREATE POLICY` DDL. See [tech/DATABASE.md](tech/DATABASE.md).

### Knowledge base (`lib/knowledge/`)
- `big-five.ts` — IPIP-NEO (not NEO-PI-R) facets with textual indicators
- `jung-functions.ts` — 8 cognitive functions with Jung (1921) citations
- `archetypes.ts` — Pearson applied 6-archetype system
- `positive-computing.ts` — Calvo & Peters (2014) principles
- `build-block.ts` — Shared helper `buildKnowledgeBlock<T>()`

### Prompts (`lib/prompts/`)
- `interpret-narrative.ts` — Pass 1.5: lectura interpretativa Jung + arquetipo + reasoning a partir del Big Five medido por el módulo ML (temperature=0)
- `analyze-evidence.ts` — Pass 2 phrase highlight prompt (temperature=0.3)
- `generate-narrative.ts` — Personalized narrative (800-1200 words)
- `chat-context.ts` — System prompt for contextualized chat
- `crisis-classifier.ts` — Classifier system prompt (JSON mode, idiom-aware)
- `development-plan.ts` — 3-area development plan
- `analyze-profile.ts` — helper histórico (pre-integración ML); reservado por compatibilidad pero no usado en el flujo actual

### Eval suite (`lib/evals/`)
- `cases.ts` — corpus de casos golden derivados de IPIP-NEO + Jung + adversariales (utilizable por el módulo ML como fuente de viñetas etiquetadas en español latinoamericano).
- `crisis-dataset.ts` — 100 casos etiquetados para evaluar el clasificador de crisis.
- `crisis-eval.ts` — runner que computa precision/recall/F1/matriz de confusión.
- `crisis-eval.test.ts` — CI gate (recall ≥ 0.95 sobre la corrida controlada).

### Módulo analítico (`ml/`)
- DistilBERT base multilingual cased congelado + 5 regresores Ridge.
- Pipeline reproducible (`make all`, `dvc repro`).
- Tracking en MLflow; datasets versionados con DVC.
- Métricas reportadas por dimensión Big Five (MSE, R², r) en `eval_metrics.json`.
- Ver [`ml/README.md`](../ml/README.md) y ADR-026.

## 6. Data flow (end-to-end)

```
USER TEXT (onboarding)
    │
    ▼
zod validate ──▶ [error] ──▶ 400
    │
    ▼
consent check ──▶ [no consent] ──▶ /consent
    │
    ▼
charge_rate_limit RPC (atomic) ──▶ [over budget] ──▶ 429
    │
    ▼
Capa analítica (módulo ML propio): DistilBERT congelado + Ridge → Big Five
    │        ml/api_server.py via lib/ml-client.ts
    │        retorna scores + per_dimension_status
    │
    ▼
Capa narrativa (LLM externo, identificador de modelo fijado):
    │        Pass 1.5 — interpret-narrative.ts
    │        infiere funciones Jung + arquetipo Pearson
    │        a partir de los Big Five medidos + textos del usuario
    │
    ├── parallel ──▶ INSERT psychological_profiles (version=1)
    │
    ▼
Pass 2: analyze-evidence prompt (capa narrativa)
    │
    ▼
INSERT evidence_highlights (RLS-policed)
    │
    ├── if research_opt_in ──▶ INSERT research_dataset (HMAC user_hash)
    │
    ▼
UPDATE profiles.onboarding_completed = true
    │
    ▼
reconcile_rate_limit RPC (in finally block)
    │
    ▼
Return profile JSON to client
    │
    ▼
ProgressiveLoad animation reveals dimensions over ~8s
    │
    ▼
Evidence highlights fade in (lazy via SWR)
    │
    ▼
Redirect to /dashboard
```

## 7. Security model

- **Auth**: Supabase Auth with email + password (Phase 2). OAuth deferred.
- **Access control**: Row Level Security on every table. `auth.uid() = user_id` for user-owned data; `service_role`-only for sensitive audit tables (`crisis_events`, `research_dataset`, `delete_confirmations`).
- **Secrets**: 4 HMAC peppers (`CONSENT_IP_PEPPER`, `CRISIS_PEPPER`, `RESEARCH_PEPPER`, `DELETE_TOKEN_PEPPER`), version-pinned for rotation. See [tech/SECURITY.md](tech/SECURITY.md).
- **Input validation**: Zod on every API boundary.
- **Rate limiting**: atomic `charge_rate_limit` RPC. Daily token cap + cost cap + global daily budget (cached via `unstable_cache` with 5min TTL).
- **Crisis pipeline**: regex pre-filter → Claude classifier (fail-closed) → hard block + resource routing.
- **LLM prompt injection defense**: zod input sanitization, 2000-char cap, log suspicious patterns.
- **SECURITY DEFINER functions**: all include `SET search_path = public, pg_temp` to prevent search_path injection.

## 8. Legal / compliance

- **Ley 25.326 (Argentina)**: informed consent + data rights (access, rectification, cancellation, opposition). See [biz/LEGAL.md](biz/LEGAL.md).
- **Consent versioning**: `consent_records.consent_version`. Material changes trigger re-prompt.
- **Data rights endpoints**:
  - `GET /api/account/export` — full data ZIP
  - `POST /api/account/delete/request` + `/confirm` — cascading delete with magic link
  - `POST /api/account/research-opt-out` — toggle research mode
- **Research dataset**: pseudonymization (HMAC, not anonymization) — legally honest in consent text. See [DECISIONS.md ADR-013](DECISIONS.md).

## 9. Observability

- **Logs**: structured JSON via `console.log` (Vercel collects). Every Edge route logs entry/exit with user_id_hash + model + cost.
- **Metrics**: Vercel Analytics for traffic. Daily SQL queries over `rate_limits` for cost tracking.
- **Alerts**: (TODO) daily budget overshoot, crisis_events high-severity count > 5, API error rate > 5% over 5 min.
- **Dashboards**: Supabase SQL dashboards sufficient for TFG scale.
- **Runbooks**: see [tech/OBSERVABILITY.md](tech/OBSERVABILITY.md).

## 10. Performance targets

- **Onboarding analyze**: ~8s end-to-end (Pass 1 ~6s + Pass 2 ~1s in parallel with DB write)
- **Chat first byte**: < 2s
- **Chat stream**: continuous tokens, no > 3s gap
- **Narrative full**: 15-20s via SSE
- **Dashboard first paint**: < 1.5s (Next.js Edge SSR + cached profile)
- **PDF export**: < 5s client-side

## 11. Compliance matrix

| Concern | Ref | Status |
|---|---|---|
| Ley 25.326 consent | [biz/LEGAL.md](biz/LEGAL.md) | Spec complete |
| Ley 25.326 data rights | [biz/LEGAL.md](biz/LEGAL.md) | Endpoints specified |
| Research ethics (Siglo 21) | [biz/ETHICS.md](biz/ETHICS.md) | Documented |
| WCAG AA contrast | [tech/ARCHITECTURE.md](tech/ARCHITECTURE.md) | Phase 6 |
| ARIA labels | [tech/ARCHITECTURE.md](tech/ARCHITECTURE.md) | Phase 6 |
| Keyboard navigation | [tech/ARCHITECTURE.md](tech/ARCHITECTURE.md) | Phase 6 |
| Crisis safety (regulatory) | [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md) | Spec complete |

## 12. Reference

- [PLAN.md](PLAN.md) — Master plan + status
- [DECISIONS.md](DECISIONS.md) — Architecture Decision Records
- [API_MAP.md](API_MAP.md) — API surface
- [FEATURE_MAP.md](FEATURE_MAP.md) — Feature inventory
- [PROMPT_ARCHITECTURE.md](PROMPT_ARCHITECTURE.md) — Prompt design
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Visual tokens
- [CLOUD_HANDOFF.md](CLOUD_HANDOFF.md) — Deployment guide
