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

## Post-implementación (2026-04-14)

Cambios de Fase 5 (migration 004) del
[IMPLEMENTATION_PLAN.md](../biz/IMPLEMENTATION_PLAN.md) + Fase 1
(hash client-side).

### Migration 004 — consent_text_hash + locale

El schema de `consent_records` tenía un gap identificado durante
el audit de Fase 0: solo guardaba `consent_version TEXT`, lo cual
no permite probar **qué texto específico vio el usuario** si la
versión se edita post-facto (incluso por una typo fix). Para datos
sensibles bajo Ley 25.326 art. 7 (consentimiento expreso
verificable), esto es insuficiente.

Fix en `supabase/migrations/004_consent_text_hash.sql`:

```sql
ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS consent_text_hash TEXT NOT NULL DEFAULT '';

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'es-AR';

CREATE INDEX IF NOT EXISTS idx_consent_records_version_locale
  ON public.consent_records(consent_version, locale);
```

- **`consent_text_hash`** es SHA-256 del texto verbatim renderizado
  al usuario, hex-encoded.
- **`locale`** es BCP-47 (`es-AR`, `en`, etc.), preparado para
  multi-idioma futuro vía `next-intl` (ADR-010).
- Registros pre-migration 004 quedan con `consent_text_hash = ''`
  y `locale = 'es-AR'` (defaults); son auditables solo por
  `consent_version` y están documentados como tales en
  [LEGAL.md](../biz/LEGAL.md).

La migration está aplicada en Supabase prod (verificado con
`supabase migration list --linked`, estado 004 present on both
local and remote).

### API route acepta los nuevos campos

`app/api/consent/route.ts` — el `ConsentSchema` Zod acepta
`consentTextHash` y `locale` como campos **opcionales**
(backward compat para clientes viejos):

```ts
const ConsentSchema = z.object({
  consentVersion: z.string().min(1).max(50),
  researchOptIn: z.boolean(),
  consentTextHash: z.string().regex(/^[a-f0-9]{0,64}$/i).optional(),
  locale: z.string().min(2).max(10).optional(),
});
```

El insert a `consent_records` usa los valores enviados o los
defaults del schema (`''` y `'es-AR'`).

### Cliente envía el hash (Fase 1 close)

`lib/consent/text-v1-es-AR.ts` (nuevo) exporta:

- `CONSENT_VERSION_V1` — `"2026-04-13-v1"`
- `CONSENT_LOCALE_V1` — `"es-AR"`
- `CONSENT_TEXT_V1_ES_AR` — el texto verbatim como constante
  inmutable. Contiene el texto completo del consentimiento en
  voseo rioplatense que se muestra en la página `/consent`. Este
  archivo **nunca se edita in-place**; cambios materiales crean
  `text-v2-es-AR.ts`.
- `computeConsentTextHash(text)` — async helper que usa
  `crypto.subtle.digest('SHA-256', ...)` para computar el hash
  hex. Funciona en navegador + Edge runtime.

En `app/consent/page.tsx`, al submit, el cliente calcula el hash
y lo envía:

```ts
const consentTextHash = await computeConsentTextHash(CONSENT_TEXT_V1_ES_AR);

await fetch('/api/consent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consentVersion: CONSENT_VERSION_V1,
    researchOptIn,
    consentTextHash,
    locale: CONSENT_LOCALE_V1,
  }),
});
```

### Cumplimiento Ley 25.326 art. 7 cerrado

Con estos cambios, Umbra puede demostrar ante la AAIP (Agencia de
Acceso a la Información Pública) o ante el usuario mismo:

1. **Qué versión de texto** aceptó (`consent_version`).
2. **Qué idioma** vio (`locale`).
3. **El hash verificable** del texto exacto (`consent_text_hash`).

Para verificar un registro de consentimiento posteriormente, basta
con:
1. Leer `consent_version` del registro (ej: `"2026-04-13-v1"`).
2. Localizar el archivo `lib/consent/text-v1-es-AR.ts` del commit
   que estaba vivo en la fecha `accepted_at`.
3. Ejecutar `computeConsentTextHash(CONSENT_TEXT_V1_ES_AR)`.
4. Comparar el hash resultante con `consent_text_hash` del registro.

Si matchean, el texto visto por el usuario está probado. Si no
matchean, hay evidencia de drift entre la versión declarada y el
texto real — situación que el test de integridad debería detectar
antes de deploy.

ADR-024 documenta esta decisión completa.

### Dataset de consent research M3 (Fase 4.5)

Paralelo a lo anterior, el estudio M3 tiene su propio formulario
de consentimiento en `content/consent/research-m3-v1-es-AR.md`.
Es texto separado del consentimiento del producto, específico
para la investigación think-aloud con participantes reales. Está
versionado en el repo y también puede hashearse si es necesario
bajo el mismo patrón.

