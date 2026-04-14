# Umbra — TODOS

Deferred items captured during `/plan-ceo-review` on 2026-04-12 (CEO plan at
`~/.gstack/projects/Umbra/ceo-plans/2026-04-12-umbra-full-project.md`).

Format: one line per TODO. Priority: P1 (soon) / P2 (next quarter) / P3 (someday).

---

## Resolved on 2026-04-13 (dynamic onboarding refactor — shipped)

The guided/freetext/hybrid onboarding was replaced by a single conductor-driven
adaptive flow. 6–8 turns, Haiku conductor picks the next interaction type
(open_text, multi_choice, scenario, ranking, polarity, metaphor), the live
profile updates next to the question card, and the whole transcript is serialized
into the existing `/api/analyze` synthesis step.

- [x] **Migration 003 onboarding_sessions + widened input_mode** — applied
  against the local Supabase stack. `psychological_profiles.input_mode` now
  accepts `'dynamic'` alongside the legacy `'guided' | 'freetext'`.
- [x] **Conductor prompt hardening** — dropped the 6.5k-token knowledge blocks
  from the conductor (they belong in the analyzer), added explicit probe-shape
  rules, and wrote a `normalizeConductorJson` repair step that tolerates the
  three observed LLM misses: `direction: "moderate"` signals, insights with
  missing `id`/`tone`, and `probe.kind` variants without their required field.
- [x] **Robust JSON extractor** — replaced the greedy `/\{[\s\S]*\}/` regex in
  `/api/onboarding/next` with a brace-matched extractor that also strips
  markdown code fences. Bumped conductor `maxTokens` 2000 → 4096.
- [x] **E2E happy path** — `e2e/full-flow.spec.ts` rewritten to drive the
  dynamic flow (structural card detection, 10-turn loop, synthesis wait).
  Chromium suite runs 21/21 green including the full real-Claude happy path
  (register → consent → 8-turn conductor → analyze → dashboard narrative
  stream → plan generation in ~2.9 min).
- [x] **Unblock tangential e2e regressions** — removed HTML5 `minLength={8}`
  on the register password input (was blocking the JS weak-password error
  test), and fixed the strict-mode violation on the /privacy "Ley 25.326"
  locator.
- [x] **Rate limit env bump** — `DAILY_TOKEN_CAP` 80k → 400k and
  `DAILY_COST_CAP_CENTS` 500 → 1500 in `.env.local.example` to reflect
  realistic conductor usage (~13k tokens/turn × 8 turns + analyze + narrative
  + plan per user).

## Resolved on 2026-04-13 (QA + Phase 7 completeness sprint)

These items moved from open to resolved in the 2026-04-13 session. Kept in the
log as a changelog rather than deleted so future reviewers can see the closing
timeline against the CEO plan.

- [x] **KB research kickoff** — `lib/knowledge/` is fully populated (1,484 lines
  across big-five, jung-functions, archetypes, positive-computing). Zero
  `/* COMPLETAR */` markers left in live source.
- [x] **Pin Claude model SKU** — reverted to alias `claude-sonnet-4-6` (commit
  cf255c2) because the dated SKU `claude-sonnet-4-6-20260301` was not resolvable
  on the live API and was blocking every Claude call. H1 determinism claim now
  relies on seed + temperature pinning + the dated Haiku SKU for the judge.
- [x] **Sidebar vs TabBar taxonomy fix** — decided on the 5-item sidebar
  (Dashboard, Chat, Plan, Export, Settings). `/settings` now has a root landing
  page linking to the four subpages (profile, export, research-opt-out, delete).
- [x] **ISSUE-001 Input hydration mismatch** — `components/ui/Input.tsx` and
  `components/ui/Textarea.tsx` were using `Math.random()` for fallback label
  ids; fixed by swapping to React's `useId()` (commits 71ddc56 + this sprint).
- [x] **ISSUE-002 /api/plan microGoal schema too tight** — Zod cap raised from
  200 → 300 chars (commit 0eae299). Plan generation verified end-to-end with
  real Claude (3 areas, 15 microGoals, max text 192 chars).
- [x] **Phase 7 SEO hardening** — added `app/robots.ts`, `app/sitemap.ts`,
  OpenGraph + Twitter metadata, `metadataBase` for absolute URL resolution,
  and a themed viewport color.
- [x] **Phase 7 error boundaries** — added `app/error.tsx` (global) and
  `app/not-found.tsx` (404) with consistent Umbra voice + crisis footer.
- [x] **Phase 7 a11y pass** — labeled chat + onboarding textareas, swapped
  plan microgoals from `<button>` to real `<input type="checkbox">` with
  keyboard focus ring, added focus trap + Escape handling + scroll lock to
  the CartaFuturaCard modal, added `aria-labelledby`/`aria-describedby` to
  the dialog.
- [x] **Account delete Resend integration** — `lib/email/resend.ts` now sends
  real HTML + text emails via the Resend REST API when `RESEND_API_KEY` is
  set, and cleanly falls back to a logged + inline magic link in dev mode.
  UI no longer lies to the user: shows "email sent" only when actually sent,
  otherwise shows the dev link inline.
- [x] **Phase 6 PDF radar** — `app/export/page.tsx` now renders an inline
  SVG Big Five radar chart in the PDF preview (html2canvas-safe), alongside
  the existing bar rows.
- [x] **Phase 5 chat partial persistence** — when the chat SSE stream fails
  mid-response, the partial assistant turn is still persisted to `messages`
  and conversation activity is bumped, so retries don't lose context.
- [x] **CI/CD bootstrap** — `.github/workflows/ci.yml` runs lint + typecheck +
  unit tests + build on every push/PR with placeholder envs. `vercel.json`
  pins framework + region + security headers.
- [x] **package.json scripts drift** — added `typecheck` script + switched
  `test` to `vitest run` for CI safety. README commands now match reality.
- [x] **README freshness** — reflects Phase 7 completion, new env vars
  (`RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`), demo mode
  walkthrough, corrected page + route counts.

---

## P1 — Phase 0/1.5 blockers (close before production launch)

- [ ] **Ethics Gate meeting with TFG advisor** — close before Migration 002
  is run against a prod Supabase project with `research_dataset` enabled.
  Questions: (1) consent-only sufficient for research_dataset? (2) IRB path
  parallel to dev or blocking? Decision determines Branch A vs B.
- [ ] **Commit eval cache snapshot policy** — `lib/evals/.cache/snapshot-*.json`
  is committed, `lib/evals/.cache/live/*` is gitignored. Wire this in `.gitignore`
  when the eval harness lands.

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
