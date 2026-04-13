# Feature — Consent Flow & Account Management

> `/consent` blocking route, data rights endpoints, account deletion magic
> link, profile settings.

## Phase
2

## Routes

### User-facing
- `/consent` — blocking route before `/onboarding`
- `/privacy` — public privacy policy
- `/terms` — public terms of service
- `/settings/profile` — edit name + email
- `/settings/export` — trigger data export download
- `/settings/delete` — request account deletion
- `/settings/delete/confirm?token=...` — confirm via magic link
- `/settings/research-opt-out` — toggle research mode (Branch A only)

### API
- `POST /api/account/research-opt-out` (Node runtime)
- `GET /api/account/export` (Node runtime)
- `POST /api/account/delete/request` (Node runtime)
- `POST /api/account/delete/confirm` (Node runtime)

## Consent flow (`/consent`)

See [biz/LEGAL.md](../biz/LEGAL.md) for the full consent text structure (Ley 25.326 compliant).

UI:
- Cosmic background + glass card centered
- Full consent text in scrollable area
- Required checkbox: "Entendí y acepto los términos de uso y el tratamiento de mis datos según Ley 25.326"
- If Branch A: second optional checkbox: "Permito que mis datos anonimizados sean usados para investigación (podés cambiarlo después en settings)"
- Continue button disabled until required checkbox is checked

Submit → `POST` to internal action that:
1. Inserts `consent_records` row with HMAC-hashed IP, version, timestamp, user_agent
2. If research checkbox: UPDATE `profiles.research_opt_in = true`
3. Redirect to `/onboarding`

## Consent versioning

- `consent_version` format: `YYYY-MM-DD-vN` (e.g., `2026-04-12-v1`)
- Stored in a constant in `lib/consent/current-version.ts`
- Middleware queries most recent `consent_records` for the user; if stale version, redirects to `/consent` with a "los términos cambiaron" banner

## Data export

### UI
`/settings/export` shows a button "Descargar todos mis datos". Clicking triggers:
- `GET /api/account/export`
- Response is `application/zip` stream
- Browser downloads as `umbra-datos-{user_id}-{date}.zip`

### ZIP structure
See [API_MAP.md](../API_MAP.md) `GET /api/account/export` for details.

### Large user handling
For users with many messages (edge case from CEO review section 4):
- If total size > 5MB, stream the gzip incrementally
- If > 50MB, consider an async job + email link (not in scope for TFG)

## Account deletion

### Two-step magic link flow

**Step 1**: `/settings/delete` page with button "Eliminar mi cuenta"
- Confirmation modal: "¿Estás seguro? Esta acción es irreversible."
- Second confirmation: "Te vamos a enviar un email con un link de confirmación"
- On confirm → `POST /api/account/delete/request`

**Step 2**: User receives email within seconds
- Subject: "Confirmá la eliminación de tu cuenta Umbra"
- Body: "Si realmente querés eliminar tu cuenta, clickeá este link (válido por 5 minutos):"
- Link: `https://umbra.yourdomain.com/settings/delete/confirm?token=<raw token>`

**Step 3**: User clicks link → `/settings/delete/confirm?token=...`
- Page shows a final confirmation + (optional) "¿También querés purgar tus datos de investigación?" checkbox
- On confirm → `POST /api/account/delete/confirm { token, purgeResearch }`
- Server validates token, executes cascade delete, sends confirmation email to pre-delete address
- Redirects to `/` with "tu cuenta fue eliminada" banner (non-authenticated)

### Cascade order
See [API_MAP.md](../API_MAP.md) and [tech/DATABASE.md](../tech/DATABASE.md). Transaction-wrapped.

## Research opt-out

- Toggle in `/settings/research-opt-out`
- Current state: "Research mode: ON / OFF"
- Description: "Cuando está activo, tus textos anonimizados contribuyen a la investigación de Umbra. Más info: {OSF link}"
- Toggle calls `POST /api/account/research-opt-out { optIn: boolean }`
- UPDATE `profiles.research_opt_in`

Note: toggling OFF does NOT delete existing `research_dataset` rows. Purging
existing rows requires the full account delete flow with `purgeResearch=true`.
Consent text is honest about this.

## Profile settings (`/settings/profile`)

Simple form:
- Full name (editable)
- Email (editable, triggers re-verification)
- Submit → updates `profiles` row

No password change UI for v1 — use Supabase password reset flow.

## Testing

- `app/consent/page.test.tsx` — consent text renders, checkbox required
- `app/api/account/export/route.test.ts` — ZIP contains correct data
- `app/api/account/delete/request/route.test.ts` — token generated, email sent
- `app/api/account/delete/confirm/route.test.ts` — CRITICAL cascade test
- `e2e/consent-flow.spec.ts` — full flow
- `e2e/account-delete-flow.spec.ts` — CRITICAL E2E
- `e2e/data-export.spec.ts` — download and inspect ZIP

## Dependencies

- Migration 002 with `consent_records`, `delete_confirmations`, `profiles.research_opt_in`
- Email service (Resend) for delete magic links
- `lib/security/peppers.ts` for HMAC
- `lib/errors.ts` for typed errors

## See also

- [biz/LEGAL.md](../biz/LEGAL.md) — Ley 25.326 compliance
- [biz/ETHICS.md](../biz/ETHICS.md) — Phase 0 gate
- [tech/SECURITY.md](../tech/SECURITY.md) — peppers + HMAC
- [tech/DATABASE.md](../tech/DATABASE.md) — schema
- [API_MAP.md](../API_MAP.md) — endpoint specs
