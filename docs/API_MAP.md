# Umbra — API Map

> Every API route in Umbra with method, runtime, input schema, output schema,
> error codes, and links to the route implementation.

## Conventions

- **Response envelope**: `{ ok: true, data: T }` on success, `{ ok: false, error: string, ...details }` on failure. Enforced by `lib/api/with-error-handler.ts`.
- **Validation**: every input is parsed by Zod before handler logic runs.
- **Auth**: every route except `/`, `/login`, `/register`, and `/consent` requires a valid Supabase session. Middleware enforces redirect to `/login`.
- **Rate limiting**: every Claude-calling route uses `charge_rate_limit` RPC atomically before the Claude call, and `reconcile_rate_limit` in `finally`.
- **Error classes** (`lib/errors.ts`): `RateLimitError`, `CrisisDetected`, `ClaudeError`, `ClassifierFailure`, `BudgetExceededError`, `ValidationError` (via Zod).

## Analysis routes

### `POST /api/analyze`
**Runtime**: Edge
**Purpose**: Pass 1 — analyze user introspective text and produce psychological profile.
**Auth**: required
**Phase**: 3

**Request body**:
```ts
{
  texts: string[],           // 1-5 entries (5 for guided, 1 for freetext)
  mode: 'guided' | 'freetext',
  areas?: string[],          // required if mode='guided', length matches texts
}
```

**Response `data`** (on success):
```ts
{
  profileId: string,         // UUID
  bigFive: {
    openness: number,        // 0-100
    conscientiousness: number,
    extraversion: number,
    agreeableness: number,
    neuroticism: number,
  },
  jungFunctions: {
    Se: number, Si: number, Ne: number, Ni: number,
    Te: number, Ti: number, Fe: number, Fi: number,
  },
  archetype: 'hero' | 'sage' | 'explorer' | 'creator' | 'caregiver' | 'rebel',
  archetypeSecondary: string,
  confidence: number,        // 0-100, self-reported
  reasoning: string,         // short narrative citing evidence
}
```

**Error responses**:
- `400 validation` — zod parse failed
- `401 unauthenticated` — no session
- `403 consent_required` — user has not accepted consent
- `429 rate_limited` — daily token or cost cap hit
- `503 ai_unavailable` — Claude API failed after retries
- `503 budget_exceeded` — global daily budget exceeded

**Side effects**:
- INSERT `psychological_profiles` (version=1)
- UPDATE `profiles.onboarding_completed = true`
- If `research_opt_in=true`, INSERT `research_dataset` row (HMAC-pseudonymized)
- Triggers Pass 2 (`/api/analyze/evidence`) in parallel

**Spec**: [features/ANALYSIS.md](features/ANALYSIS.md)

---

### `POST /api/analyze/evidence`
**Runtime**: Edge
**Purpose**: Pass 2 — extract phrase-level evidence from user text given Pass 1 profile.
**Auth**: required
**Phase**: 3

**Request body**:
```ts
{
  profileId: string,
  originalText: string,
}
```

**Response `data`**:
```ts
{
  evidenceId: string,
  highlights: Array<{
    trait: string,           // e.g. "openness", "Ni"
    phrases: Array<{
      quote: string,         // verbatim from text
      occurrence: number,    // 1-indexed for disambiguation
    }>,
  }>,
}
```

**Error responses**:
- `400 validation`
- `404 profile_not_found` — profileId does not match session user
- `503 ai_unavailable`

**Side effects**:
- INSERT `evidence_highlights` row

**Notes**:
- Temperature=0.3 (exploratory phrase selection)
- Client-side offset resolution via `text.indexOf(quote, fromIndex)` with `occurrence` disambiguation
- Silent no-op if quote not found in text

**Spec**: [features/ANALYSIS.md](features/ANALYSIS.md)

---

### `POST /api/narrative`
**Runtime**: Edge
**Purpose**: Generate personalized narrative (800-1200 words, Spanish rioplatense) from profile.
**Auth**: required
**Phase**: 5

**Request body**:
```ts
{
  profileId: string,
  regenerate?: boolean,      // default false; if true, overwrites existing
}
```

**Response**: `text/event-stream` (SSE)
- Each SSE event is a chunk of the narrative text
- Final event: `{ type: 'done', narrativeId: string }`

**Error responses**:
- `400 validation`
- `404 profile_not_found`
- `409 narrative_exists` — if `regenerate=false` and narrative already exists
- `503 ai_unavailable`

**Side effects**:
- INSERT `narratives` row (after stream completes)

**Spec**: [features/NARRATIVE.md](features/NARRATIVE.md)

---

### `POST /api/chat`
**Runtime**: Edge
**Purpose**: Contextualized chat with crisis detection + safety guardrails.
**Auth**: required
**Phase**: 5 (CRITICAL SAFETY PATH)

**Request body**:
```ts
{
  conversationId?: string,   // if omitted, creates new conversation
  message: string,           // max 2000 chars
}
```

**Response**: `text/event-stream` (SSE) OR JSON error
- Stream events: chunks of assistant response
- Final event: `{ type: 'done', messageId: string }`

**Pre-flight pipeline** (every message):
1. Regex pass (`lib/chat/crisis-lexicon.ts` → `classifyMessage()`)
   - Idiom pre-filter short-circuit
   - Max severity from `CRISIS_PATTERNS`
2. Claude classifier (always runs if regex hit OR 1% random sampling)
   - Returns `{ is_crisis: boolean, severity: 'low'|'med'|'high' }`
   - Fail-closed: classifier error → treat as crisis
   - Sampled calls count against daily budget, logged with `severity='sampling'`
3. If crisis → block, return `451 crisis` with resources, log `crisis_events`
4. If not crisis → `charge_rate_limit` RPC
5. If budget ok → Claude chat call, stream response
6. `reconcile_rate_limit` in `finally` block

**Error responses**:
- `400 validation` — message too long, empty, etc.
- `401 session_expired` — 45-min idle or token expired
- `429 rate_limited`
- `451 crisis` — with `severity` + `resources` payload
- `503 ai_unavailable`
- `503 budget_exceeded`

**Side effects**:
- INSERT `conversations` (if new) + `messages` (user + assistant)
- UPDATE `conversations.last_activity_at`
- INSERT `crisis_events` if any pipeline step flags
- UPDATE `rate_limits`

**Spec**: [features/CHAT.md](features/CHAT.md), [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md)

---

### `POST /api/plan`
**Runtime**: Edge
**Purpose**: Generate 3-area development plan with actions and micro-goals.
**Auth**: required
**Phase**: 6

**Request body**:
```ts
{
  profileId: string,
  regenerate?: boolean,
}
```

**Response `data`**:
```ts
{
  planId: string,
  areas: Array<{
    id: string,
    name: string,
    rationale: string,
    actions: Array<{
      id: string,
      title: string,
      description: string,
      microGoals: Array<{
        id: string,
        text: string,
        completed: boolean,  // always false on generate
      }>,
    }>,
  }>,
}
```

**Error responses**:
- `400`, `404`, `429`, `503`

**Side effects**:
- INSERT `development_plans` row

**Spec**: [features/DEVELOPMENT_PLAN.md](features/DEVELOPMENT_PLAN.md)

---

## Account management routes (Node runtime)

### `GET /api/account/export`
**Runtime**: Node
**Purpose**: Export user's full data (Ley 25.326 access right).
**Auth**: required
**Phase**: 2

**Response**: `application/zip` binary stream

**ZIP contents**:
- `profile.json` — `profiles` row
- `psychological_profiles.json` — all versions
- `narratives.json` — all narratives
- `conversations.json` — all conversations with messages inline
- `future_letters.json` — all letters
- `consent_records.json` — consent history
- `research_dataset.json` — IF `research_opt_in=true`, recomputes HMAC and queries matching rows

**Error responses**:
- `401`, `500`

**Notes**:
- Payload can be large for users with many chat messages — streamed gzip
- Honest behavior: research rows ARE included when opted in (fixes CEO plan iter-2 inconsistency)

**Spec**: [features/CONSENT.md](features/CONSENT.md), [biz/LEGAL.md](biz/LEGAL.md)

---

### `POST /api/account/delete/request`
**Runtime**: Node
**Purpose**: Generate magic-link token for account deletion.
**Auth**: required
**Phase**: 2

**Request body**: `{}` (empty)

**Response `data`**: `{ emailSent: true }`

**Error responses**:
- `401`, `429 rate_limited` (1 request per 10 min), `500`

**Side effects**:
- Generate 32-byte random token
- INSERT `delete_confirmations` with `token_hash = HMAC(token, DELETE_TOKEN_PEPPER)`, `expires_at = NOW() + 5 min`
- Send email with raw token in magic link URL

**Spec**: [features/CONSENT.md](features/CONSENT.md)

---

### `POST /api/account/delete/confirm`
**Runtime**: Node
**Purpose**: Confirm account deletion via magic link + execute cascade.
**Auth**: required
**Phase**: 2 (CRITICAL)

**Request body**:
```ts
{
  token: string,             // from email magic link
  purgeResearch?: boolean,   // opt-in checkbox, default false
}
```

**Response `data`**: `{ deletedAt: string }`

**Error responses**:
- `400 validation`
- `401 unauthenticated`
- `409 token_already_used`
- `410 token_expired`
- `500 cascade_failed` — transaction rolled back

**Cascade order** (in transaction):
1. `messages` (via conversations FK)
2. `conversations`
3. `crisis_events` (recompute user_hash via `CRISIS_PEPPER`)
4. `narratives`
5. `future_letters`
6. `evidence_highlights` (via psychological_profiles FK)
7. `rate_limits`
8. `delete_confirmations` (all rows for this user)
9. `psychological_profiles`
10. `consent_records`
11. IF `purgeResearch=true`: `research_dataset` (recompute user_hash via `RESEARCH_PEPPER`)
12. `profiles` (parent)
13. `auth.users`

**Notes**:
- Atomic: if any step fails, full rollback
- Post-delete confirmation email sent to pre-delete address
- Single-use: `used_at` set atomically with delete execution

**Spec**: [features/CONSENT.md](features/CONSENT.md)

---

### `POST /api/account/research-opt-out`
**Runtime**: Node
**Purpose**: Toggle research participant mode.
**Auth**: required
**Phase**: 3 (gated on Phase 0 Ethics Gate Branch A)

**Request body**:
```ts
{ optIn: boolean }
```

**Response `data`**: `{ researchOptIn: boolean }`

**Side effects**:
- UPDATE `profiles.research_opt_in`
- Future writes to `research_dataset` respect new value
- Existing rows are NOT affected (retention documented in consent text)

**Spec**: [features/RESEARCH_MODE.md](features/RESEARCH_MODE.md)

---

## Route-to-file mapping

| Route | File | Runtime |
|---|---|---|
| `POST /api/analyze` | `app/api/analyze/route.ts` | Edge |
| `POST /api/analyze/evidence` | `app/api/analyze/evidence/route.ts` | Edge |
| `POST /api/narrative` | `app/api/narrative/route.ts` | Edge |
| `POST /api/chat` | `app/api/chat/route.ts` | Edge |
| `POST /api/plan` | `app/api/plan/route.ts` | Edge |
| `GET /api/account/export` | `app/api/account/export/route.ts` | Node |
| `POST /api/account/delete/request` | `app/api/account/delete/request/route.ts` | Node |
| `POST /api/account/delete/confirm` | `app/api/account/delete/confirm/route.ts` | Node |
| `POST /api/account/research-opt-out` | `app/api/account/research-opt-out/route.ts` | Node |

## See also

- [SYSTEM_SPEC.md](SYSTEM_SPEC.md) — stack, components, data flow
- [PROMPT_ARCHITECTURE.md](PROMPT_ARCHITECTURE.md) — how prompts work
- [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md) — crisis pipeline details
- [tech/RATE_LIMITING.md](tech/RATE_LIMITING.md) — charge_rate_limit RPC
