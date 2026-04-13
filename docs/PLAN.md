# Umbra — Master Plan

> **Source of truth for the Umbra build.** This file is the entry point to all
> project documentation. It links out to every other doc and tracks current
> status at a glance.

## Status dashboard

| Phase | Description | Status | Notes |
|---|---|---|---|
| Phase 1 | Scaffolding + config | ✓ SHIPPED 2026-04-12 | tsc/build/greps all clean. Dev server smoke-tested. |
| Phase 0 | Ethics gate (advisor meeting) | PENDING | Blocks Migration 002. Branch A vs B decision. See [DECISIONS.md ADR-017](DECISIONS.md). |
| Phase 1.5 | Remediation + hygiene | BLOCKED on Phase 0 | 7 subtasks. See section below. |
| Phase 2 | Auth + Landing + Layout shell + Consent + i18n | PENDING | ~20 files. Depends on Phase 1.5. |
| Phase 3 | Onboarding + AI analysis + Evidence + KB + Evals + Carta | PENDING | Biggest phase. KB research runs in parallel with earlier phases. |
| Phase 4 | Dashboard + Big Five radar + Jung bars + Archetype | PENDING | |
| Phase 5 | Narrative streaming + Chat with full guardrails | PENDING | Critical safety path. Crisis classifier + lexicon + rate limits. |
| Phase 6 | Development plan + PDF export + Accessibility + Print stylesheet | PENDING | |
| Phase 7 | Polish + Deploy + Smoke tests + Paper preregistration on OSF | PENDING | |

## Documentation map

```
Umbra/
├── UMBRA_MASTER_BUILD.md    # Original specification (Phase 1 source)
├── README.md                # Quick setup
├── TODOS.md                 # Deferred items + acknowledged risks
├── umbra-design-system.html # Visual design reference (open in browser)
├── .env.local.example       # Environment variables template
│
├── docs/
│   ├── PLAN.md              # THIS FILE — entry point
│   ├── SYSTEM_SPEC.md       # System specification (stack, components, compliance)
│   ├── API_MAP.md           # Every API route + schemas + runtime
│   ├── FEATURE_MAP.md       # Every feature with status + user flows
│   ├── DESIGN_SYSTEM.md     # Design tokens + typography + colors + icons
│   ├── PROMPT_ARCHITECTURE.md  # Prompt design + KB injection + evals
│   ├── CLOUD_HANDOFF.md     # Deploy to Vercel + Supabase + secrets + migrations
│   ├── DECISIONS.md         # 22 Architecture Decision Records
│   │
│   ├── biz/                 # Business concerns
│   │   ├── MARKET.md        # Landscape, competitors, differentiation
│   │   ├── LEGAL.md         # Ley 25.326 compliance, consent, data rights
│   │   ├── ETHICS.md        # Ethics review path, research participant mode
│   │   └── TFG.md           # Academic deliverables (thesis, paper, defense)
│   │
│   ├── features/            # Per-feature deep-dive specs
│   │   ├── ONBOARDING.md
│   │   ├── ANALYSIS.md
│   │   ├── DASHBOARD.md
│   │   ├── CHAT.md
│   │   ├── NARRATIVE.md
│   │   ├── DEVELOPMENT_PLAN.md
│   │   ├── PDF_EXPORT.md
│   │   ├── CONSENT.md
│   │   ├── CARTA_AL_FUTURO.md
│   │   └── RESEARCH_MODE.md
│   │
│   ├── generated/           # Auto-generated / export artifacts
│   │   ├── README.md        # How to regenerate
│   │   ├── env-vars.md      # Auto-extracted from .env.local.example
│   │   └── (sql schema dump, api types, etc. — generated on build)
│   │
│   └── tech/                # Technical deep-dives
│       ├── ARCHITECTURE.md  # System architecture + component diagram
│       ├── DATABASE.md      # Schema, RLS policies, migrations
│       ├── AUTH.md          # Supabase Auth + SSR + middleware
│       ├── RATE_LIMITING.md # charge_rate_limit RPC + cost accounting
│       ├── CHAT_SAFETY.md   # Crisis pipeline + classifier + lexicon
│       ├── EVALS.md         # Eval methodology + H1/H2 + caches
│       ├── SECURITY.md      # Peppers, HMACs, RLS, threat model
│       └── OBSERVABILITY.md # Logs, metrics, alerts, runbooks
│
├── lib/
│   ├── knowledge/           # NotebookLM research → structured TS
│   ├── prompts/             # Prompt builders (import from knowledge/)
│   ├── evals/               # Golden test cases + eval runners
│   ├── supabase/            # Client/server/edge/middleware variants
│   ├── claude/              # Claude SDK wrapper + pricing table
│   ├── chat/                # Crisis lexicon + classifier + pipeline
│   ├── security/            # Peppers, HMAC helpers
│   ├── errors.ts            # Typed error classes
│   └── api/with-error-handler.ts  # Response envelope wrapper
│
└── supabase/migrations/
    ├── 001_initial_schema.sql       # Phase 1 — 6 original tables
    └── 002_core_tables.sql          # Phase 1.5.6 — 7 new tables + columns
```

## Phase 1.5 remediation breakdown (blocks Phase 2)

1. **1.5.1** — Supabase SSR migration (`@supabase/auth-helpers-nextjs` → `@supabase/ssr`) with client split per runtime (Node/Edge/middleware/browser). See [tech/AUTH.md](tech/AUTH.md).
2. **1.5.2** — Next.js `14.2.15` → `14.2.35+` (CVE-2025-58060 patch).
3. **1.5.3** — Claude model SKU pinned via `ANTHROPIC_MODEL_ID` env var. See [DECISIONS.md ADR-005 + ADR-014](DECISIONS.md).
4. **1.5.4** — Vitest bootstrap + `npm run test` + `npm run eval`.
5. **1.5.5** — TODOS.md + docs/DECISIONS.md (this is you're looking at, already shipped).
6. **1.5.6** — Migration 002 (7 new tables + 2 forward-compat columns). See [tech/DATABASE.md](tech/DATABASE.md).
7. **1.5.7** — `psychological_profiles.version` forward-compat column + `UNIQUE(user_id, version)`.

Plus from eng review (Phase 1.5 scope additions):
- `lib/errors.ts` + `lib/api/with-error-handler.ts`
- `lib/security/peppers.ts` (pepper versioning per ADR-021)
- Refreshed `.env.local.example`

## Gates

- **Phase 0 gate (ethics)**: blocks Migration 002. 30-min advisor meeting must close before Phase 1.5.6. Decision determines Branch A (full research mode) vs Branch B (research deferred). See [biz/ETHICS.md](biz/ETHICS.md).
- **KB gate**: blocks Phase 3. Minimum viable KB thresholds: 20/30 IPIP-NEO facets, 8/8 Jung functions, 6/6 Pearson archetypes, 5/7 Positive Computing principles. See [PROMPT_ARCHITECTURE.md](PROMPT_ARCHITECTURE.md).
- **Eng review gate**: required before ship. Currently CLEAR (2026-04-12).
- **CEO review gate**: optional but ran. CLEAR (2026-04-12).

## External references

- **Master spec**: [UMBRA_MASTER_BUILD.md](../UMBRA_MASTER_BUILD.md) (the original Phase 1 source)
- **CEO plan**: `~/.gstack/projects/Umbra/ceo-plans/2026-04-12-umbra-full-project.md` (the full expansion scope, 1100+ lines, 22 ADRs, 7 codex findings applied)
- **Visual design**: open `umbra-design-system.html` in a browser for tokens + components reference
- **TFG framing paper**: Sauer (2025) "Rehabilitating Jung's Cognitive Function Theory" — the academic backbone for using Jung functions directly instead of MBTI

## Review history

| Date | Review | Outcome | Notes |
|---|---|---|---|
| 2026-04-12 | Phase 1 QA | PASS | tsc, build, greps, dev server smoke test |
| 2026-04-12 | `/plan-ceo-review` | CLEAR (mode: SCOPE_EXPANSION) | 22 proposed, 15 accepted, 7 deferred |
| 2026-04-12 | 3× adversarial spec review (Claude subagent) | 9/10 after iter 3 | 37/38 issues fixed |
| 2026-04-12 | `/codex-plan-review` (outside voice) | 7 findings | 5 fixed, 2 acknowledged |
| 2026-04-12 | `/plan-eng-review` | CLEAR | 20 findings, all applied |

## User journey storyboard (emotional arc)

What the user FEELS at each step, not just what the UI DOES. Time-horizon
design: 5-sec visceral, 5-min behavioral, 5-year reflective.

### First-time user complete funnel

```
STEP 1 — Landing
  USER DOES: arrives from link / search
  USER FEELS: curious, skeptical ("is this another MBTI test?")
  UI SUPPORTS: Instrument Serif hero "Conocé tu sombra" — not corporate,
               not "welcome to [X]". Cosmic background subtle, not loud.
               Subtitle disambiguates: "autoconocimiento con rigor académico,
               en tu idioma". Two CTAs: primary start, secondary learn more.
  RISK: if the hero looks like every SaaS landing, user bounces in 5s
  MITIGATION: Instrument Serif + rioplatense voseo copy + no 3-column
              feature grid (see AI slop blacklist)

STEP 2 — Register
  USER DOES: fills 3 fields (name, email, password)
  USER FEELS: committed enough to try, not yet invested
  UI SUPPORTS: single glass card, no distractions, form max 300px wide
               centered. Error states inline (not toast). "Crear cuenta" not
               "Submit".
  RISK: friction kills conversion; email verify would drop 30%
  MITIGATION: v1 ships without email verification (Supabase option off).
              OAuth deferred to TODOS.

STEP 3 — Consent
  USER DOES: reads (or scrolls) Ley 25.326 consent, checks box, continues
  USER FEELS: slightly concerned (privacy) but reassured by transparency
  UI SUPPORTS: full consent text in readable scrollable area, not a modal.
               Research opt-in is an OPTIONAL checkbox below the required
               one. "Entendí y acepto" button, not "I Agree".
  RISK: user treats consent as friction and rushes through
  MITIGATION: scrollable but NOT behind an accordion. Honest copy. Concrete
              examples ("tus textos se guardan en Supabase en US")

STEP 4 — Mode selector
  USER DOES: chooses guided / freetext / hybrid
  USER FEELS: curious about which approach fits them
  UI SUPPORTS: 3 glass cards side-by-side (desktop) / stacked (mobile), each
               with Phosphor icon + name + 1-line description. Hover state
               highlights border.
  RISK: decision paralysis between 3 modes
  MITIGATION: "Recomendado para empezar" small badge on guided (default)

STEP 5 — Onboarding flow (guided)
  USER DOES: writes 5 area responses (or 1 freetext block)
  USER FEELS: initially uncertain, then starts flowing as they write
  UI SUPPORTS: one question at a time, ghost placeholder with tone example,
               word counter that becomes reassuring ("55 palabras, buen
               ritmo" at 50+). Progress dots at top. Back/next buttons.
               Draft auto-saved to localStorage every keystroke.
  RISK: user abandons mid-flow (most drop-off point)
  MITIGATION: ~45s average per area = 4 min total. Short enough to finish
              in one sitting. Progress dots make progress visible.

STEP 6 — Submit → Progressive load animation
  USER DOES: clicks "mostrame lo que ves"
  USER FEELS: anticipation ("what is Claude going to say about me?") +
              mild vulnerability
  UI SUPPORTS: 8-second progressive reveal. NOT a generic spinner.
               - Starts: "analizando tus palabras..."
               - Second 1-2: "Big Five" label fades in, 5 dimension
                 skeletons appear
               - Second 2-4: dimension bars animate width from 0 to final
                 value, one at a time
               - Second 4-6: "funciones cognitivas" label + 8 Jung bars
                 animate
               - Second 6-7: "tu arquetipo" label + SVG fade-in
               - Second 7-8: evidence highlights fade in (Pass 2 arrives)
  RISK: this is the highest-stakes moment. If it feels generic, trust
        breaks immediately
  MITIGATION: deliberately slower than necessary (would be 2s of raw API
              call) so user SEES the system working. Evidence highlights
              make it concrete.

STEP 7 — Carta al futuro (optional final step)
  USER DOES: writes 1 paragraph to their future self (or skips)
  USER FEELS: reflective, slightly emotional
  UI SUPPORTS: single textarea with gentle prompt "escribile a tu vos de 6
               meses. ¿Qué querés que recuerde?" Unlock date shown below.
               "Saltear" and "guardar" buttons.
  RISK: optional step feels tacked-on
  MITIGATION: copy positions it as a gift ("una carta que se abre sola")

STEP 8 — First dashboard view
  USER DOES: sees archetype first, then narrative, then explores radar
  USER FEELS: seen, understood, validated. "This is actually about me."
  UI SUPPORTS: archetype card primary, narrative secondary (already
               streaming or ready), radar + Jung tertiary. Greeting "hola,
               {nombre}" in small text at top. No "welcome screen", no
               tutorial overlay — the dashboard IS the reward.
  RISK: overwhelming information density
  MITIGATION: primary→secondary→tertiary hierarchy from Pass 1 fix

STEP 9 — First chat turn (within 5 min)
  USER DOES: types their first question
  USER FEELS: tentative ("can I talk to this like a therapist?")
  UI SUPPORTS: persistent "Umbra no es terapia" banner. Welcome message
               from assistant: "Hola. ¿En qué estás pensando hoy?" Input
               placeholder: "escribí tu reflexión...".
  RISK: user crosses therapy boundary, feels unheard, or writes crisis
        content
  MITIGATION: crisis pipeline is invisible until triggered. Banner sets
              expectations. System prompt establishes mirror, not therapist.

STEP 10 — Return visit at +30 days (if retention works)
  USER DOES: logs back in after email reminder (future v1.5)
  USER FEELS: curious about changes, emotional about time passing
  UI SUPPORTS: dashboard unchanged (no longitudinal in v1) + carta card
               showing countdown to unlock
  RISK: nothing to bring user back in v1
  MITIGATION: this is the deferred longitudinal tracking (TODOS.md P2).
              v1 acknowledges retention is weak without it.

STEP 11 — Return visit at +180 days (carta unlock)
  USER DOES: clicks "leer tu carta" card
  USER FEELS: reconnection with past self, nostalgia, reflection
  UI SUPPORTS: modal with letter + "cuando escribiste esto eras: {archetype}
               + top 2 Jung functions". Static snapshot, no diff.
  RISK: letter feels stale if life changed
  MITIGATION: the letter WAS meant for that past self. Framing it as a
              snapshot rather than a comparison respects that.
```

### Time horizons

**5 seconds (visceral)**: does the landing feel intentional vs generic? Does
the archetype card feel memorable vs a test result?

**5 minutes (behavioral)**: does the onboarding flow to dashboard transition
feel earned? Does the first chat turn feel safe + reflective?

**5 years (reflective)**: will the user remember Umbra as "that platform
that actually saw me" or "another personality test I did once"?

The archetype custom SVGs, the evidence highlights, and the carta al futuro
are the three interventions that specifically target the 5-year reflective
layer — they're designed to be memorable.

## Next actions

1. ☐ Schedule Phase 0 ethics meeting with TFG advisor (30 min)
2. ☐ Start KB research in NotebookLM (parallel with Phase 1.5 engineering)
3. ☐ Execute Phase 1.5 remediation (~1 day)
4. ☐ Run `/plan-design-review` for UI scope validation
5. ☐ Begin Phase 2 implementation

---

**Last updated**: 2026-04-12 by `/plan-eng-review`
