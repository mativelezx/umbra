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
**Purpose**: Inferir Big Five (Pass 1 — módulo ML propio) + lectura interpretativa Jung/arquetipo (Pass 1.5 — capa narrativa Claude). Pass 2 (evidence highlights) corre fire-and-forget.
**Auth**: required

**Request body**:
```ts
{
  texts: string[],            // 1-16 entries
  mode: 'dynamic',
  areas?: string[],           // si presente, mismo length que texts
  sessionId?: string,         // UUID; recupera seedText desde onboarding_sessions
}
```

**Response `data`** (on success):
```ts
{
  profileId: string,          // UUID
  bigFive: {                  // ← inferido por módulo ML (DistilBERT + Ridge)
    openness: number,         // 0-100
    conscientiousness: number,
    extraversion: number,
    agreeableness: number,
    neuroticism: number,
  },
  perDimensionStatus: {       // ← bandera por dimensión (ADR-027)
    openness: 'ok' | 'low_confidence',
    conscientiousness: 'ok' | 'low_confidence',
    extraversion: 'ok' | 'low_confidence',
    agreeableness: 'ok' | 'low_confidence',
    neuroticism: 'ok' | 'low_confidence',
  },
  jungFunctions: {            // ← lectura interpretativa Pass 1.5 (Claude)
    Se: number, Si: number, Ne: number, Ni: number,
    Te: number, Ti: number, Fe: number, Fi: number,
  },
  archetype: 'hero' | 'sage' | 'explorer' | 'creator' | 'caregiver' | 'rebel',
  archetypeSecondary: string,
  confidence: number,         // 0-100, lectura interpretativa Pass 1.5
  reasoning: string,          // narrativa citando evidencia
}
```

**Error responses**:
- `400 validation` — zod parse falló
- `401 unauthenticated` — sin sesión
- `403 consent_required` — usuario no aceptó consent
- `429 rate_limited` — cap diario de tokens o costo
- `503 ai_unavailable` — Claude (Pass 1.5) falló
- `503 budget_exceeded` — presupuesto diario global excedido
- `503 ml_unavailable` — módulo ML caído o devolvió error (NO degrada a Claude para Big Five — ADR-026)

**Side effects**:
- POST a `lib/ml-client.inferBigFive` (módulo ML propio)
- POST a Claude para Pass 1.5 (Jung + arquetipo + reasoning)
- INSERT/UPSERT `psychological_profiles` (version=1) con `analysis_raw.ml.{modelVersion, elapsedMs, perDimensionStatus}`
- UPDATE `profiles.onboarding_completed = true`
- Si `research_opt_in=true`, INSERT `research_dataset` (HMAC-pseudonymized)
- Pass 2 fire-and-forget: extrae evidence highlights y guarda en `evidence_highlights`

**Spec**: [features/ANALYSIS.md](features/ANALYSIS.md), ADR-026, ADR-027

---

### `POST /api/narrative`
**Runtime**: Edge
**Purpose**: Generate personalized narrative (800-1200 words, Spanish latinoamericano) from profile.
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

### `PATCH /api/account/profile`
**Runtime**: Node
**Purpose**: Rectificación de datos personales (Ley 25.326 art. 16).
**Auth**: required

**Request body**:
```ts
{ full_name?: string }
```

**Response `data`**: `{ full_name: string | null, updated: boolean }`

**Side effects**:
- UPDATE `profiles.full_name` + `profiles.updated_at`
- Validación Zod server-side (1–120 chars trim).

**Spec**: [features/CONSENT.md](features/CONSENT.md)

---

### `POST /api/account/research-opt-out`
**Runtime**: Node
**Purpose**: Toggle de oposición al tratamiento con fines de investigación (Ley 25.326 art. 17).
**Auth**: required

**Request body**:
```ts
{
  research_opt_in: boolean;
  // Cuando research_opt_in=false, opcional purgar contribución existente
  purge_existing?: boolean;
}
```

**Response `data`**: `{ research_opt_in: boolean, purged_records: number }`

**Side effects**:
- UPDATE `profiles.research_opt_in`
- Si `purge_existing=true` y `research_opt_in=false`, DELETE en `research_dataset` matcheando `user_hash = HMAC(user_id, RESEARCH_PEPPER)`
- Futuras escrituras a `research_dataset` respetan el nuevo valor

**Spec**: [features/RESEARCH_MODE.md](features/RESEARCH_MODE.md)

---

## Route-to-file mapping

| Route | File | Runtime |
|---|---|---|
| `POST /api/analyze` | `app/api/analyze/route.ts` | Edge |
| `POST /api/narrative` | `app/api/narrative/route.ts` | Edge |
| `POST /api/chat` | `app/api/chat/route.ts` | Edge |
| `GET /api/chat/conversations` | `app/api/chat/conversations/route.ts` | Edge |
| `GET /api/chat/conversations/[id]` | `app/api/chat/conversations/[id]/route.ts` | Edge |
| `POST /api/plan` | `app/api/plan/route.ts` | Edge |
| `POST /api/carta` | `app/api/carta/route.ts` | Edge |
| `POST /api/consent` | `app/api/consent/route.ts` | Edge |
| `POST /api/onboarding/next` | `app/api/onboarding/next/route.ts` | Edge |
| `POST /api/onboarding/seed` | `app/api/onboarding/seed/route.ts` | Edge |
| `POST /api/onboarding/undo` | `app/api/onboarding/undo/route.ts` | Edge |
| `POST /api/research/usability` | `app/api/research/usability/route.ts` | Edge |
| `GET /api/account/export` | `app/api/account/export/route.ts` | Node |
| `PATCH /api/account/profile` | `app/api/account/profile/route.ts` | Node |
| `POST /api/account/delete/request` | `app/api/account/delete/request/route.ts` | Node |
| `POST /api/account/delete/confirm` | `app/api/account/delete/confirm/route.ts` | Node |
| `POST /api/account/research-opt-out` | `app/api/account/research-opt-out/route.ts` | Node |

## See also

- [SYSTEM_SPEC.md](SYSTEM_SPEC.md) — stack, components, data flow
- [PROMPT_ARCHITECTURE.md](PROMPT_ARCHITECTURE.md) — how prompts work
- [tech/CHAT_SAFETY.md](tech/CHAT_SAFETY.md) — crisis pipeline details
- [tech/RATE_LIMITING.md](tech/RATE_LIMITING.md) — charge_rate_limit RPC
