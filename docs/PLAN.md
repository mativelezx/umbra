# Umbra — Master Plan

> **Source of truth for the Umbra build.** Entry point a toda la documentación
> del proyecto. Linkea a cada doc relevante y trackea el estado actual.

## Status dashboard

| Phase | Description | Status | Notes |
|---|---|---|---|
| Phase 1 | Scaffolding + config | SHIPPED | tsc/build/greps clean. Dev server smoke-tested. |
| Phase 1.5 | Remediation + hygiene | SHIPPED | SSR migration, typed errors, Web-Crypto peppers, Vitest + Playwright, Migration 002. |
| Phase 2 | Auth + Landing + Layout shell + Consent + i18n | SHIPPED | Landing, /login, /register, /consent (Ley 25.326), LayoutShell, `t()` dict. |
| Phase 3 | Onboarding + AI analysis + Evidence + KB + Carta | SHIPPED | Guided/freetext/dynamic onboarding, `/api/analyze`, CartaForm, KB files filled. |
| Phase 4 | Dashboard + Big Five radar + Jung bars + Archetype | SHIPPED | Custom archetype SVGs, Recharts radar, Jung bars. |
| Phase 5 | Narrative streaming + Chat with full guardrails | SHIPPED | SSE narrative. Chat pipeline: regex + classifier fail-closed + 451 hard block. |
| Phase 6 | Development plan + PDF export + Accessibility + Print stylesheet | SHIPPED | `/api/plan` con 300-char microGoal cap. PDF export con Big Five radar + bars + narrativa + plan. |
| Phase 7 | Polish + Deploy + Smoke tests | SHIPPED | `app/error.tsx`, `app/not-found.tsx`, `app/robots.ts`, `app/sitemap.ts`, OG metadata, a11y pass, axe-core en CI, `vercel.json` con security headers. |
| Fullstack | Real Supabase + real Anthropic wire-up | SHIPPED | E2E walks register → consent → onboarding → analyze → dashboard → narrativa → plan. |
| Módulo ML | DistilBERT congelado + Ridge multi-output + FastAPI + DVC + MLflow | en `ml/` | Pipeline reproducible; entrenamiento sobre Essays + corpus latinoamericano propio. Ver [`ml/README.md`](../ml/README.md). |

## Documentation map

```
Umbra/
├── UMBRA_MASTER_BUILD.md    # Especificación de la fase web inicial
├── README.md                # Quick setup
├── TODOS.md                 # Continuaciones y riesgos asumidos
├── umbra-design-system.html # Visual design reference (open in browser)
├── .env.local.example       # Environment variables template
│
├── ml/                      # Módulo analítico propio (Python)
│   ├── README.md            # Setup + uso + métricas
│   ├── src/                 # prepare_data, baseline_tfidf, extract_embeddings, train_ridge, evaluate, predict, api_server
│   ├── data/                # essays/ + latinoamericano/ (versionados con DVC)
│   ├── models/              # artefactos joblib
│   └── tests/               # pytest
│
├── docs/
│   ├── PLAN.md              # THIS FILE — entry point
│   ├── SYSTEM_SPEC.md       # System specification (stack, components, compliance)
│   ├── API_MAP.md           # Every API route + schemas + runtime
│   ├── FEATURE_MAP.md       # Every feature with status + user flows
│   ├── DESIGN_SYSTEM.md     # Design tokens + typography + colors + icons
│   ├── PROMPT_ARCHITECTURE.md  # Prompt design + KB injection
│   ├── CLOUD_HANDOFF.md     # Deploy a Vercel + Supabase + secrets + migrations
│   ├── DECISIONS.md         # Architecture Decision Records
│   │
│   ├── biz/                 # Business / academic concerns
│   │   ├── MARKET.md
│   │   ├── LEGAL.md
│   │   ├── ETHICS.md
│   │   ├── TFG.md
│   │   ├── VALIDATION.md
│   │   └── IMPLEMENTATION_PLAN.md
│   │
│   ├── features/            # Per-feature deep-dive specs
│   │   └── ...
│   │
│   ├── generated/           # Auto-generated artifacts
│   │
│   ├── research/            # Materiales SUS (Brooke 1996) para TP3/TP4
│   │   ├── usability-protocol.md
│   │   ├── usability-recruitment.md
│   │   └── sus-spanish-latinoamericano.md
│   │
│   └── tech/                # Technical deep-dives
│       ├── ARCHITECTURE.md
│       ├── DATABASE.md
│       ├── AUTH.md
│       ├── RATE_LIMITING.md
│       ├── CHAT_SAFETY.md
│       ├── EVALS.md
│       ├── SECURITY.md
│       └── OBSERVABILITY.md
│
├── lib/
│   ├── ml-client.ts         # cliente HTTP al módulo analítico (ADR-026)
│   ├── knowledge/           # Knowledge base estructurada
│   ├── prompts/             # Prompt builders (interpret-narrative.ts, etc.)
│   ├── supabase/            # Client/server/edge/middleware variants
│   ├── claude/              # Cliente para la capa narrativa
│   ├── chat/                # Crisis lexicon + classifier + pipeline
│   ├── security/            # Peppers, HMAC helpers
│   ├── errors.ts
│   └── api/with-error-handler.ts
│
└── supabase/migrations/
    ├── 001_initial_schema.sql       # tablas base
    ├── 002_core_tables.sql          # 7 tablas + RPC
    ├── 003_onboarding_sessions.sql  # onboarding_sessions con flags JSONB
    ├── 004_consent_text_hash.sql    # consent_text_hash + locale (ADR-024)
    └── 005_usability_responses.sql  # SUS in-app
```

## Gates

- **KB gate**: bloquea Phase 3. Mínimos viables: 20 IPIP-NEO facets, 8/8 funciones Jung, 6/6 arquetipos Pearson, 8/8 factores Positive Computing. Ver [PROMPT_ARCHITECTURE.md](PROMPT_ARCHITECTURE.md).
- **Eng review gate**: required antes de cada release. Currently CLEAR.
- **ML metrics gate**: bloquea liberación de cada dimensión Big Five al usuario final. Umbral por dimensión: R² > 0.20 y r > 0.30 (ADR-027). Las dimensiones por debajo se reportan como `low_confidence`.

## External references

- **Master spec**: [UMBRA_MASTER_BUILD.md](../UMBRA_MASTER_BUILD.md)
- **Visual design**: open `umbra-design-system.html` in a browser

## User journey storyboard (emotional arc)

What the user FEELS at each step, not just what the UI DOES. Time-horizon
design: 5-sec visceral, 5-min behavioral, 5-year reflective.

### First-time user complete funnel

```
STEP 1 — Landing
  USER DOES: arrives from link / search
  USER FEELS: curious, skeptical
  UI SUPPORTS: Instrument Serif hero "Conocé tu sombra" — not corporate.
               Cosmic background subtle. Subtitle disambiguates the value.
               Two CTAs: primary start, secondary learn more.

STEP 2 — Register
  USER DOES: fills 3 fields (name, email, password)
  USER FEELS: committed enough to try, not yet invested
  UI SUPPORTS: single glass card, centered, error states inline.

STEP 3 — Consent
  USER DOES: reads (or scrolls) Ley 25.326 consent, checks box, continues
  USER FEELS: slightly concerned (privacy) but reassured by transparency
  UI SUPPORTS: full consent text in readable scrollable area.
               Research opt-in is OPTIONAL, separate from the required check.

STEP 4 — Mode selector
  USER DOES: chooses guided / freetext / dynamic
  USER FEELS: curious about which approach fits them
  UI SUPPORTS: 3 glass cards, each with Phosphor icon + name + 1-line description.

STEP 5 — Onboarding flow
  USER DOES: writes responses (5 areas guided, 1 textbox freetext, or 6-8 turns dynamic)
  USER FEELS: initially uncertain, then starts flowing as they write
  UI SUPPORTS: one question at a time, ghost placeholder, word counter,
               progress dots. Draft auto-saved to localStorage.

STEP 6 — Submit → Progressive load animation
  USER DOES: clicks "mostrame lo que ves"
  USER FEELS: anticipation + mild vulnerability
  UI SUPPORTS: progressive reveal de las dimensiones inferidas por el
               módulo analítico, seguido de la lectura interpretativa
               (Jung + arquetipo) por la capa narrativa.

STEP 7 — Carta al futuro (optional final step)
  USER DOES: writes 1 paragraph to their future self (or skips)
  USER FEELS: reflective, slightly emotional
  UI SUPPORTS: single textarea with gentle prompt. Unlock date shown below.

STEP 8 — First dashboard view
  USER DOES: sees archetype first, then narrative, then explores radar
  USER FEELS: seen, understood. "This is actually about me."
  UI SUPPORTS: archetype card primary, narrative secondary, radar + Jung
               tertiary. `per_dimension_status` visible donde aplique.

STEP 9 — First chat turn (within 5 min)
  USER DOES: types their first question
  USER FEELS: tentative
  UI SUPPORTS: persistent "Umbra no es terapia" banner. Welcome message.
               Crisis pipeline invisible until triggered.
```

### Time horizons

**5 seconds (visceral)**: does the landing feel intentional vs generic? Does
the archetype card feel memorable vs a test result?

**5 minutes (behavioral)**: does the onboarding flow to dashboard transition
feel earned? Does the first chat turn feel safe + reflective?

**5 years (reflective)**: will the user remember Umbra as "that platform
that actually saw me" or "another personality test I did once"?

---

**Last updated**: junto con la sincronización de documentación post-implementación.
