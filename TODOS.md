# Umbra — TODOS

Deferred items captured during `/plan-ceo-review` on 2026-04-12 (CEO plan at
`~/.gstack/projects/Umbra/ceo-plans/2026-04-12-umbra-full-project.md`).

Format: one line per TODO. Priority: P1 (soon) / P2 (next quarter) / P3 (someday).

---

## P1 — Phase 0/1.5 blockers (close before Phase 2 implementation)

- [ ] **Ethics Gate meeting with TFG advisor** — close before Migration 002.
  Questions: (1) consent-only sufficient for research_dataset? (2) IRB path
  parallel to dev or blocking? Decision determines Branch A vs B.
- [ ] **KB research kickoff** (parallel to Phase 1.5). 2 weeks wall-clock.
  Fill `lib/knowledge/` per the KB gate thresholds. IPIP-NEO (not NEO-PI-R)
  for Big Five.
- [ ] **Pin Claude model SKU** — set `ANTHROPIC_MODEL_ID` env var to a dated
  version like `claude-sonnet-4-6-20260301`, never an alias. Required for H1
  determinism claim.
- [ ] **Commit eval cache snapshot policy** — `lib/evals/.cache/snapshot-*.json`
  is committed, `lib/evals/.cache/live/*` is gitignored. Wire this in `.gitignore`
  at Phase 1.5.

## P2 — Deferred scope (add to a future version)

- [ ] **Longitudinal tracking** (user chose to skip in opt-in ceremony). DB
  schema is forward-compat (`psychological_profiles.version` + UNIQUE(user_id,
  version)). Unblocks when user returns for re-analysis at 30/90 days.
  Re-enables the "diff perfil entonces vs. ahora" at carta al futuro unlock.
- [ ] **OAuth social login** (Google/Apple/GitHub). Email+password covers MVP.
  Reduces friction at signup.
- [ ] **og:image social share** — dynamic OG image via `@vercel/og` with
  archetype + Big Five summary. Growth loop for organic signups.
- [ ] **Cmd+K global search** — `cmdk` library, search profile/narrative/chat
  by text. Power-user feature.
- [ ] **QR en PDF export** — QR codes to `/p/{share_token}` for auth-gated
  online view. Bridge analog ↔ digital.
- [ ] **Modo silencio** — dashboard button that transforms view into
  meditation mode (one random narrative quote on cosmic background).
  Positive Computing principle: allow silence.
- [ ] **Longitudinal diff at carta al futuro unlock** — when carta unlocks at
  180 days, show a "you were / you are" diff. Requires longitudinal tracking
  above as prerequisite.

## P2 — Gaps from CEO review sections

- [ ] **Export pagination** — `/api/account/export` for users with 10k+
  messages needs to stream gzip or paginate; currently would OOM the Edge
  runtime.
- [ ] **Export+delete race** — user simultaneously exporting and deleting
  their account has no lock. Add symbolic "export in progress" check.
- [ ] **Chat session timeout mid-type** — 45min idle expiry is checked server
  side but client doesn't warn before submit. Add client-side warning at
  40min + "your session is about to expire."
- [ ] **Partial loading states for dashboard and plan** — radar finishes
  loading but narrative still streaming; currently the UI doesn't handle
  this gracefully. Add skeleton components per section.
- [ ] **Sidebar vs TabBar taxonomy fix** — master doc has sidebar
  (Dashboard, Chat, Plan, Export) and mobile tabbar (Home, Insights, Session,
  Stats, Profile). Inconsistent. Pick one 5-item set: Dashboard, Chat, Plan,
  Export, Settings.

## P2 — Observability + ops

- [ ] **Runbook: Claude API down** — degrade to Haiku; if all Claude models
  down, show maintenance banner.
- [ ] **Runbook: crisis false-positive reported by user** — query
  `crisis_events` by user_hash, review lexicon, decide if re-training or
  exception needed.
- [ ] **Runbook: daily budget exceeded** — communicate to active users, raise
  cap if justified.
- [ ] **Alert: `crisis_events` severity=high count > 5/day** — investigate
  manually.
- [ ] **Alert: API error rate > 5% over 5min** — page developer via email
  (no oncall rotation for TFG).
- [ ] **Dashboard: daily cost spend** — Supabase SQL query over `rate_limits`
  joined with pricing. Track burn rate vs `GLOBAL_DAILY_BUDGET_USD`.

## P3 — Polish and nice-to-have

- [ ] **Knowledge block helper DRY refactor** — the 4 `*KnowledgeBlock()`
  functions share structure. Extract `buildKnowledgeBlock<T>(items, renderFn)`.
- [ ] **Admin panel** — currently operated via Supabase dashboard + SQL.
  Future: `/admin` with read-only views of rate_limits, crisis_events,
  research_dataset counts.
- [ ] **Export to Notion / Obsidian** — markdown export of profile + narrative
  + plan. Power-user feature.
- [ ] **Voice input** via Whisper — record audio, transcribe, feed to analyze.
  Bigger than it sounds; out of scope for v1-v3.
- [ ] **Research collaboration mode** — let other researchers swap their own
  `lib/knowledge/` + `lib/prompts/` to test different frameworks on their
  own data. Platform play.

## P3 — Engineering convention (from plan-eng-review)

- [ ] **Zod schemas convention**: schemas live in `lib/schemas/{feature}.ts` and
  imported into routes. Exception: one-off schemas can be inline. Document in
  CLAUDE.md when Phase 2 lands.
- [ ] **`analysis_raw` JSONB retention cron** (ADR-019): nightly Supabase cron
  purges rows > 30 days. Land in Phase 3 or Phase 6. Monitors storage usage.
- [ ] **Self-hosted Llama runner** (post-ship): if paper reviewers request full
  cross-vendor H2 (not Sonnet+Haiku intra-vendor), add self-hosted GitHub
  Actions runner with Llama 3.3 70B via Ollama. Currently ADR-020 documents
  the intra-vendor choice as a known limitation.

## P2 — Performance (from plan-eng-review)

- [ ] **Redis atomic DECR for global budget** (post-ship): replace `unstable_cache`
  5-min TTL with Redis pub/sub if the product scales beyond TFG. ADR-016
  documents current trade-off.
- [ ] **CI full eval on main merge**: GitHub Actions workflow that runs the
  full 50 golden cases + H1 + H2 on every main-branch merge (not every PR).
  PRs run 10-case subset for speed. Cost model aligned with
  `ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN`.

## Acknowledged Cathedral Risks (user chose to carry, document here for future reference)

- [ ] **Chat cut-order risk** — if runway shrinks < 5 months, the cut
  sequence per codex finding 4 is: chat → archetype SVGs → carta → research.
  This is the inverse of the initial iter-1 cut order and reflects codex's
  view that chat is where the risk concentrates.
- [ ] **Advisor buy-in risk** — user chose not to validate "Model = instrument"
  framing with advisor before building. If the tribunal rejects the
  psychometric framing at defense, the fallback is: defend as a software
  engineering thesis with the eval suite + product quality + methodology as
  evidence, rather than as a psychology thesis.
