# Umbra — Feature Map

> Every user-visible feature in Umbra with status, phase, dependencies,
> success criteria, and link to its deep-dive spec.

## Legend
- **Status**: `SHIPPED` · `PLANNED` · `DEFERRED` · `SKIPPED`
- **Phase**: which build phase it lands in (see [PLAN.md](PLAN.md))
- **Ref**: link to deep-dive spec in `docs/features/`

## Core funnel features

| Feature | Status | Phase | Ref |
|---|---|---|---|
| Landing page | PLANNED | 2 | [features/LANDING.md](features/LANDING.md) |
| Registration | PLANNED | 2 | [features/LANDING.md](features/LANDING.md) |
| Login | PLANNED | 2 | [features/LANDING.md](features/LANDING.md) |
| Consent flow (Ley 25.326) | PLANNED | 2 | [features/CONSENT.md](features/CONSENT.md) |
| Onboarding — mode selector | PLANNED | 3 | [features/ONBOARDING.md](features/ONBOARDING.md) |
| Onboarding — guided flow | PLANNED | 3 | [features/ONBOARDING.md](features/ONBOARDING.md) |
| Onboarding — freetext flow | PLANNED | 3 | [features/ONBOARDING.md](features/ONBOARDING.md) |
| AI analysis (Pass 1) | PLANNED | 3 | [features/ANALYSIS.md](features/ANALYSIS.md) |
| Evidence highlights (Pass 2) | PLANNED | 3 | [features/ANALYSIS.md](features/ANALYSIS.md) |
| Progressive load animation | PLANNED | 3 | [features/ONBOARDING.md](features/ONBOARDING.md) |
| Dashboard — Big Five radar | PLANNED | 4 | [features/DASHBOARD.md](features/DASHBOARD.md) |
| Dashboard — Jung function bars | PLANNED | 4 | [features/DASHBOARD.md](features/DASHBOARD.md) |
| Dashboard — archetype card | PLANNED | 4 | [features/DASHBOARD.md](features/DASHBOARD.md) |
| Narrative generation | PLANNED | 5 | [features/NARRATIVE.md](features/NARRATIVE.md) |
| Chat with crisis guardrails | PLANNED | 5 | [features/CHAT.md](features/CHAT.md) |
| Development plan | PLANNED | 6 | [features/DEVELOPMENT_PLAN.md](features/DEVELOPMENT_PLAN.md) |
| PDF export | PLANNED | 6 | [features/PDF_EXPORT.md](features/PDF_EXPORT.md) |

## Account + data rights features

| Feature | Status | Phase | Ref |
|---|---|---|---|
| Profile settings | PLANNED | 2 | [features/CONSENT.md](features/CONSENT.md) |
| Data export (ZIP) | PLANNED | 2 | [features/CONSENT.md](features/CONSENT.md) |
| Account deletion (magic link) | PLANNED | 2 | [features/CONSENT.md](features/CONSENT.md) |
| Research mode toggle | PLANNED | 3 | [features/RESEARCH_MODE.md](features/RESEARCH_MODE.md) |

## Academic features

| Feature | Status | Phase | Ref |
|---|---|---|---|
| Research participant mode (opt-in) | PLANNED | 3 | [features/RESEARCH_MODE.md](features/RESEARCH_MODE.md) |
| Módulo analítico propio (`ml/`) | EN CURSO | sprints ML 1-3 | [ml/README.md](../ml/README.md), ADR-026 |
| Crisis classifier eval (precision/recall) | PLANNED | 3 | [tech/EVALS.md](tech/EVALS.md) |
| Validación SUS (Brooke 1996) | PLANNED | TP3/TP4 | [biz/VALIDATION.md](biz/VALIDATION.md) |
| Tesis (TP1-TP4) | EN CURSO | TP1 entregado | [biz/TFG.md](biz/TFG.md) |

## Delight features (from CEO review expansion)

| Feature | Status | Phase | Ref |
|---|---|---|---|
| Evidence highlight animation | PLANNED | 3 | [features/ANALYSIS.md](features/ANALYSIS.md) |
| Archetype SVG custom avatars | PLANNED | 4 | [features/DASHBOARD.md](features/DASHBOARD.md) |
| Carta al futuro | PLANNED | 3 | [features/CARTA_AL_FUTURO.md](features/CARTA_AL_FUTURO.md) |

## Deferred features (in TODOS.md)

| Feature | Status | Notes |
|---|---|---|
| Longitudinal tracking (30/90 day) | DEFERRED | Schema is forward-compatible. Unblocks v1.5. |
| Carta al futuro — diff view at unlock | DEFERRED | Depends on longitudinal tracking. |
| og:image social share | DEFERRED | Growth loop. |
| Cmd+K global search | DEFERRED | Power user feature. |
| QR code on PDF | DEFERRED | Analog↔digital bridge. |
| Modo silencio | DEFERRED | Meditation mode. |
| OAuth social login | DEFERRED | Email+password covers MVP. |
| Bilingual EN (full translation) | DEFERRED | i18n scaffolding ships in Phase 2. |

## NOT in scope (explicit)

- Terapia real con profesional humano
- App mobile nativa (React Native)
- Admin panel / multi-role
- Multi-tenant / team features
- Real-time collaboration
- Integración con wearables / HealthKit
- Export a Notion / Obsidian
- Voice input (Whisper)

## Dependency graph

```
Phase 1 (scaffolding) ✓
  ↓
Phase 1.5 (remediation) ── parallel ──> KB research
  ↓                                        ↓
Phase 2 (auth + consent + layout)          ↓
  ↓                                        ↓
  ┌────────────────────────────────────────┘
  ↓
Phase 3 (onboarding + análisis + carta) ── parallel ──> Sprint ML 1
  ↓
Phase 4 (dashboard + archetype SVGs) ── parallel ──> Sprint ML 2
  ↓
Phase 5 (narrative + chat con guardrails)
  ↓
Phase 6 (plan + export + a11y + print stylesheet) ── parallel ──> Sprint ML 3
  ↓
Phase 7 (polish + deploy + smoke tests)
  ↓
Validación SUS (TP3/TP4)
```

## User flow map

### New user complete funnel
```
/ (landing)
  └── click "Comenzar viaje"
      └── /(auth)/register
          └── email + password submit
              └── auth.users row created → trigger → profiles row created
                  └── /consent
                      └── accept checkbox → consent_records insert
                          └── /onboarding
                              └── mode selector (guided / freetext)
                                  └── fill in answers
                                      └── submit → /api/analyze
                                          └── Pass 1 (8s) + Pass 2 (parallel)
                                              └── psychological_profiles insert
                                                  └── evidence_highlights insert
                                                      └── profiles.onboarding_completed = true
                                                          └── /onboarding/carta (optional)
                                                              └── /dashboard
```

### Returning user chat
```
/ (landing)
  └── click "Ingresar"
      └── /(auth)/login
          └── valid credentials
              └── session cookie set
                  └── /dashboard
                      └── click "Chat"
                          └── /chat
                              └── type message
                                  └── POST /api/chat
                                      └── regex pass → classifier → rate limit → Claude stream
                                          └── response rendered + saved to messages
```

### Crisis flow (CRITICAL safety path)
```
/chat
  └── user types "no quiero seguir viviendo"
      └── POST /api/chat
          └── regex classifyMessage() → severity: 'high'
              └── DO NOT call Claude
                  └── INSERT crisis_events (user_hash + message_hash)
                      └── Return 451 { severity, resources }
                          └── UI renders <CrisisCard/> with 135 / 911 / SOS
                              └── Chat input disabled for rest of session
```

### Account deletion flow
```
/settings/delete
  └── click "Eliminar cuenta"
      └── POST /api/account/delete/request
          └── delete_confirmations insert (5-min TTL)
              └── email sent with magic link
                  └── user clicks magic link (from email)
                      └── /settings/delete/confirm?token=...
                          └── optional checkbox: "also purge research contribution"
                              └── POST /api/account/delete/confirm
                                  └── cascade delete across 13 tables
                                      └── post-delete email sent
                                          └── logout + redirect to /
```

### Carta al futuro flow
```
End of onboarding
  └── textarea: "Escribile un párrafo a tu vos de 6 meses"
      └── submit → future_letters insert (unlock_at = NOW() + 180 days)
          └── /dashboard shows "Tu carta se abre el {fecha}"
              └── (180 days later)
                  └── card transforms to "Leer tu carta"
                      └── click → modal with letter + archetype snapshot
```

## Feature dependencies

- **Consent flow** depends on: Phase 2 auth, Migration 002 `consent_records`
- **Onboarding** depends on: consent flow, Phase 1.5 vitest, KB research
- **Analysis** depends on: onboarding, KB research, `charge_rate_limit` RPC
- **Evidence highlights** depend on: Pass 1 result (async), `evidence_highlights` table
- **Dashboard** depends on: analysis complete, archetype SVGs
- **Chat** depends on: crisis lexicon, classifier, rate limits, Migration 002
- **Narrative** depends on: profile, SSE streaming infra
- **Plan** depends on: profile, completed narrative (optional)
- **PDF export** depends on: full profile, narrative, plan, print stylesheet
- **Research mode** depends on: opt-in del consent flow, pseudonimización HMAC (ADR-013)

## Interaction State Coverage Matrix

Every feature that has UI must handle all 5 states. This table is enforced per
`/plan-design-review` Pass 2. What the USER SEES for each state (not backend
behavior):

| Feature | LOADING | EMPTY | ERROR | SUCCESS | PARTIAL |
|---|---|---|---|---|---|
| **Landing** | font swap on Instrument Serif load (`font-display: swap` prevents FOIT) | n/a | n/a | full hero render | n/a |
| **Register** | button disabled + spinner | n/a | inline field error + red border | redirect to /consent | n/a |
| **Login** | button disabled + spinner | n/a | "email o contraseña incorrectos" banner | redirect per middleware | n/a |
| **Consent form** | n/a | n/a | network error toast + retry | redirect to /onboarding | n/a |
| **Onboarding mode selector** | n/a | "elegí cómo querés empezar" (initial) | n/a | transition to flow | n/a |
| **Guided flow textarea** | n/a | ghost-text placeholder + word counter 0 | word count < 50 → disabled next button | next button enabled | draft auto-saved toast on typing |
| **Freetext flow** | n/a | ghost-text placeholder + word counter 0 | word count < 200 → disabled submit | submit enabled | draft auto-saved toast |
| **Progressive load animation** | **5 skeleton dimensions + orbiting loader** | n/a | "no pudimos generar tu perfil — probá de nuevo" + retry | dimensions revealed sequentially over ~8s | evidence highlights fade in async (Pass 2 may not have arrived yet) |
| **Dashboard archetype card** | skeleton shimmer | "completá tu onboarding" → redirect | "error cargando perfil" + retry | full SVG + narrative | n/a (loads atomically) |
| **Dashboard radar chart** | skeleton chart-shaped shimmer | same as above | same | animated radar reveal | n/a |
| **Dashboard Jung bars** | 8 skeleton bars | same | same | sequential bar width animations | n/a |
| **Dashboard narrative section** | skeleton text lines (6 rows) | "tu narrativa se está generando..." | "error generando narrativa — regenerá" | full text + "regenerar" button | **streaming tokens arriving progressively via SSE** |
| **Dashboard carta card** | skeleton card shimmer | "no escribiste carta" (small, muted, no CTA) | n/a | locked state OR unlocked state | n/a |
| **Chat thread** | initial message skeleton | welcome: "Hola. ¿En qué estás pensando hoy?" (assistant bubble) | "se cortó la conexión — reintentá" + retry button | assistant + user bubbles | **streaming assistant response progressively** |
| **Chat input** | disabled during assistant stream | "Escribí tu reflexión..." placeholder | "tu mensaje es muy largo (max 2000 chars)" inline | send button pulses briefly on click | n/a |
| **Chat crisis trigger** | n/a | n/a | `CrisisCard` hard-blocks + disables input | n/a | n/a |
| **Chat rate limit** | n/a | n/a | 429 toast: "alcanzaste tu cupo diario (~30 mensajes)" | n/a | n/a |
| **Chat session expired** | n/a | n/a | inline card: "tu sesión expiró, empezá una conversación nueva" + CTA | n/a | n/a |
| **Plan page** | skeleton 3 area cards | "generá tu primer plan" + CTA button | "no pudimos generar — reintentá" | 3 areas with actions + micro-goals | 2 areas rendered + 3rd loading skeleton if partial generation |
| **Plan micro-goal checkbox** | briefly disabled during save | n/a | "no se pudo guardar" toast + revert | checkbox animates from 0→1 | n/a |
| **Export page** | "preparando tu PDF..." with cosmic spinner | "completá perfil + narrativa antes de exportar" + CTA to dashboard | "no pudimos generar el PDF" + browser console hint | "descarga iniciada" toast + file downloads | n/a |
| **Settings profile** | button disabled during save | n/a | field-level validation errors | "guardado" toast | n/a |
| **Settings export data** | button disabled + "preparando tu ZIP..." | n/a | "error generando export — contactanos" | download trigger | n/a |
| **Settings delete (step 1)** | button disabled | n/a | "no pudimos enviar el email — reintentá" | "chequeá tu email" banner + 5min countdown | n/a |
| **Settings delete confirm (step 2)** | button disabled during cascade | n/a | 410 "tu link expiró" OR 409 "ya usaste este link" | redirect to `/` + "cuenta eliminada" banner | n/a |

**Empty states are features**. Every "empty" cell must be warm (not "No items found"), have context about why it's empty, and (usually) a primary action.

**Loading states are features**. Every "loading" cell must prevent layout shift (reserve space), indicate the system is working (shimmer/spinner), and have a graceful degradation if loading takes >10s.

**Error states are features**. Every "error" cell must explain what went wrong in user language (not "500 Internal Server Error"), offer a retry when possible, and never leave the user stuck.

## See also

- [PLAN.md](PLAN.md) — master plan + status
- [SYSTEM_SPEC.md](SYSTEM_SPEC.md) — system specification
- [API_MAP.md](API_MAP.md) — API surface
- [PROMPT_ARCHITECTURE.md](PROMPT_ARCHITECTURE.md) — prompt design
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — tokens + typography
- `features/*.md` — per-feature deep-dive specs
