# Umbra — System Specification (post-pivot ML, 2026-04-27)

> Top-level technical contract. What the system IS, what it DOES, what it
> DOES NOT do, and what it promises to its users and to the academic tribunal.
>
> **Banner pivot ML (ADR-002 v2 + ADR-026, 2026-04-27)**: la inferencia
> Big Five la realiza un módulo ML propio en `/ml/` (DistilBERT
> congelado + Ridge multi-output, FastAPI). Jung, arquetipos y Positive
> Computing son **lectura interpretativa** de la capa Claude, no
> mediciones. La validación primary del componente analítico son
> métricas estándar de regresión por dimensión Big Five (ADR-028).

## 1. System identity

**Name**: Umbra
**Tagline**: Conocé tu sombra. Iluminá tu camino.
**Project type**: TFG (Trabajo Final de Grado) — Ingeniería en Software, Universidad Siglo 21. Dual deliverable: academic thesis + functional product.
**Target users**: Spanish-speaking (rioplatense) adults interested in self-knowledge, psychology, and personal development. Not a clinical population.
**Primary persona**: 25-40 year old Argentine, some university exposure to psychology, skeptical of MBTI but curious about personality frameworks, seeks depth over quick tests.

## 2. What the system does

Umbra takes a user's introspective written text (either through guided 5-area prompts or a single freetext block) and produces:

1. A **psychological profile** con:
   - **Big Five scores** (5 dimensiones, 0-100 cada una) — **medidos por
     el módulo ML propio en `/ml/`** (DistilBERT congelado + Ridge
     multi-output entrenado sobre Essays + corpus rioplatense propio).
     Las dimensiones que caen bajo el umbral mínimo de aceptación
     (R² > 0.20 y r > 0.30) se reportan como `low_confidence` por
     dimensión (ADR-027).
   - **Jung cognitive function scores** (8 funciones, 0-100 cada una) —
     **lectura interpretativa de Claude (Pass 1.5)**, NO medición.
     Derivada del Big Five inferido + texto del usuario.
   - **Arquetipo dominante** (Pearson aplicado: Hero / Sage / Explorer /
     Creator / Caregiver / Rebel) — **lectura interpretativa de Claude**,
     NO medición.
   - Arquetipo secundario.
   - Confianza global de la lectura interpretativa (self-reported por
     Claude para Pass 1.5; ortogonal al `per_dimension_status` del
     módulo ML).
   - Razonamiento citando evidencia textual del usuario.

2. A **personalized narrative** (800-1200 words, Spanish rioplatense, second-person voseo) that interprets the profile as a story rather than diagnosis.

3. A **contextualized chat** where the user can explore their profile with Claude, with full safety guardrails: crisis detection, session timeouts, token budgets, permanent "not therapy" banner.

4. A **development plan** with 3 growth areas, each with 2-3 concrete actions and 2-3 micro-goals each.

5. A **PDF export** containing the full profile, narrative, and plan for offline reflection.

Optional (user opt-in during consent flow):

6. **Research participant mode** — user's anonymized textual data and generated profile are added to a research dataset used for the TFG paper, with a visible "contributed" badge.

7. **Carta al futuro** — user writes a letter to their future self at the end of onboarding. Unlocks after 180 days. Shows letter + snapshot of profile at write-time.

## 3. What the system does NOT do

- **Not therapy.** Explicit non-goal. Permanent banner. Crisis detection routes users to professional resources.
- **Not MBTI.** Cita a Jung (1921) directamente para vocabulario interpretativo de la capa narrativa. No 16-personality labels.
- **No infiere Jung ni arquetipos como medición psicométrica.** Solo Big Five se mide automáticamente; el resto es lectura interpretativa de la capa narrativa (ADR-002 v2 + ADR-007 amendado).
- **Not a diagnostic tool.** No DSM codes, no clinical language, no "disorder" framing.
- **Not multi-user.** Single-user product; no teams, no organizations, no shared profiles.
- **Not real-time.** No collaborative editing, no presence, no websockets.
- **Not mobile-native.** Responsive web PWA only.
- **Not longitudinal (in v1).** Schema is forward-compatible but re-analysis features are deferred to v1.5.

## 4. Stack

### Capa web

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | `14.2.35+` | Edge runtime para rutas Claude |
| Language | TypeScript | `5.5.4+` | strict mode |
| Styling | Tailwind CSS | `3.4.13` | Tokens en [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| Fonts | Instrument Serif, Space Grotesk, Inter, JetBrains Mono | via Google Fonts | |
| Icons | @phosphor-icons/react | `2.1.7` | NO emoji en UI |
| State | Zustand | `5.0.0` | Un store por dominio |
| Auth | Supabase Auth | latest | Vía `@supabase/ssr` |
| Database | Supabase PostgreSQL | 15+ | RLS en cada tabla |
| Capa narrativa AI | Anthropic Claude SDK | `0.30.1` | Sonnet 4.6 pinned SKU. Pass 1.5 narrativo + chat + plan + crisis classifier. |
| Charts | Recharts | `2.13.0` | Radar + bars |
| PDF | html2pdf.js | `0.14.0` | Client-side only |
| Validation | Zod | `3.23.8` | Todos los inputs de API |
| Testing | Vitest + Playwright | latest | Vitest unit, Playwright E2E |
| Deploy | Vercel | — | Git-connected CI/CD (Edge runtime) |

### Capa analítica (módulo ML propio, ADR-026)

| Layer | Technology | Notes |
|---|---|---|
| Lenguaje | Python 3.11 | Servicio independiente, fuera del bundle Next.js |
| Etapa 1 — embeddings | DistilBERT base multilingual cased (Sanh et al. 2019) | Frozen, CLS pooling, sin fine-tuning |
| Etapa 2 — regresor | scikit-learn Ridge (Hoerl y Kennard 1970) | 5 regresores independientes, GridSearchCV alpha |
| Tracking | MLflow (Zaharia et al. 2018) | Local file store, runs por dimensión |
| Versionado de datos | DVC | Corpus Essays + rioplatense versionados |
| Serialización | joblib | `models/ridge_v1.joblib` |
| Servir | FastAPI + uvicorn | `localhost:8000` (dev) / Render-Fly.io (prod) |
| Cliente desde Next.js | `lib/ml-client.ts` | Vía `ML_API_URL` env var |

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
- `research_dataset` (Migration 002, gated on Ethics Gate Branch A)
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
- `analyze-profile.ts` — Pass 1 analysis prompt (temperature=0)
- `analyze-evidence.ts` — Pass 2 phrase highlight prompt (temperature=0.3)
- `generate-narrative.ts` — Personalized narrative (800-1200 words)
- `chat-context.ts` — System prompt for contextualized chat
- `crisis-classifier.ts` — Classifier system prompt (JSON mode, idiom-aware)
- `development-plan.ts` — 3-area development plan

### Eval suite (`lib/evals/`)
- `cases/` — 50 golden test cases (20 IPIP-NEO adapted + 20 Jung literature + 10 adversarial)
- `run.ts` — Main eval runner
- `consistency.ts` — H1 determinism runner (temperature=0, pinned SKU)
- `cross-model-paraphrase.ts` — H2 paraphrase runner (Sonnet + Haiku)
- `.cache/snapshot-*.json` — Committed cache snapshots for offline reproduction
- `.cache/live/` — Local-only transient cache (gitignored)

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
Pass 1: analyze-profile prompt
    │        (Claude Sonnet, temperature=0, pinned SKU)
    │
    ├── parallel ──▶ INSERT psychological_profiles (version=1)
    │
    ▼
Pass 2: analyze-evidence prompt
    │        (Claude Sonnet, temperature=0.3, shorter prompt)
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
| Research ethics (Siglo 21) | [biz/ETHICS.md](biz/ETHICS.md) | BLOCKED on Phase 0 |
| WCAG AA contrast | [tech/ARCHITECTURE.md](tech/ARCHITECTURE.md) | Phase 6 |
| ARIA labels | [tech/ARCHITECTURE.md](tech/ARCHITECTURE.md) | Phase 6 |
| Keyboard navigation | [tech/ARCHITECTURE.md](tech/ARCHITECTURE.md) | Phase 6 |
| Crisis safety (regulatory) | [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md) | Spec complete |

## 12. Reference

- [PLAN.md](PLAN.md) — Master plan + status
- [DECISIONS.md](DECISIONS.md) — 22 ADRs
- [API_MAP.md](API_MAP.md) — API surface
- [FEATURE_MAP.md](FEATURE_MAP.md) — Feature inventory
- [PROMPT_ARCHITECTURE.md](PROMPT_ARCHITECTURE.md) — Prompt design
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Visual tokens
- [CLOUD_HANDOFF.md](CLOUD_HANDOFF.md) — Deployment guide
