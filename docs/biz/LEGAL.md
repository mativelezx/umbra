# Umbra — Legal & Compliance

> Ley 25.326 (Argentina) compliance, data rights, consent flow, terms of service, privacy policy.

## Applicable law

- **Ley 25.326 — Protección de Datos Personales** (Argentina). Enacted 2000, amended multiple times. Argentine equivalent of GDPR.
- **Dirección Nacional de Protección de Datos Personales (AAIP)** — the enforcement agency.
- Umbra processes "datos personales" (personal data) and in some cases "datos sensibles" (sensitive data — introspective texts may touch on mental health, beliefs, relationships).

## Rights under Ley 25.326 (Chapter III, Arts. 13-17)

| Right | Article | Umbra endpoint / mechanism |
|---|---|---|
| **Access** (art. 14) | right to know what data is stored and how it's used | `GET /api/account/export` — downloads full data ZIP |
| **Rectification** (art. 16) | right to correct inaccurate data | `/settings/profile` — edit name, email |
| **Cancellation** (art. 16) | right to delete personal data | `POST /api/account/delete/request` + `/confirm` — cascading delete |
| **Opposition** (art. 16) | right to object to specific processing | `POST /api/account/research-opt-out` — toggle research mode |

## Data classification

| Data type | Classification | Examples in Umbra |
|---|---|---|
| **Personal** | Ley 25.326 art. 2 | Name, email, IP address |
| **Sensitive** | art. 2 inc. 3 (salud, ideología, religión, vida sexual) | Introspective texts may contain mental health disclosures; psychological profile; chat conversations |
| **Derived / inferred** | — | Big Five scores, Jung function scores, archetype, narrative, development plan |

Sensitive data requires **informed written consent** per art. 7. Umbra's `/consent` flow implements this with checkbox + stored `consent_records` row.

## Consent flow (`/consent`)

Blocking route that must be completed before `/onboarding`. Displays full consent text in Spanish, requires explicit checkbox, stores acceptance.

### Required sections in consent text

1. **¿Qué datos recolectamos?**
   - Email (necesario para login y recuperación)
   - Textos introspectivos (contenido de onboarding y chat)
   - Perfil psicológico generado (resultado del análisis)
   - Dirección IP (anonimizada via HMAC, solo para auditoría de seguridad)
   - User agent (para debugging)

2. **¿Dónde se almacenan?**
   - Supabase PostgreSQL, servidor en US-East (Virginia)
   - Cifrado en tránsito (TLS) y en reposo (Supabase default)
   - Claude API: los textos se envían a Anthropic para procesamiento y **no son usados para entrenar modelos** (política de Anthropic)

3. **¿Quién accede?**
   - Vos, vía tu sesión autenticada
   - El sistema automatizado de Umbra (Edge functions)
   - El responsable del tratamiento (developer / tesista), con fines de mantenimiento
   - Anthropic, transitoriamente, durante el procesamiento de requests
   - NO se comparten con terceros para publicidad, marketing, o monetización

4. **¿Cuánto tiempo se retienen?**
   - Indefinido hasta que solicites borrado
   - Excepción: `analysis_raw` JSONB (payload de debug) se purga automáticamente a los 30 días
   - Excepción: `crisis_events` (auditoría de seguridad) se purgan a los 30 días
   - `research_dataset` (si hiciste opt-in): permanecen incluso si cancelás cuenta, salvo que explícitamente marques "purgar también mi contribución de investigación" en el flujo de borrado

5. **Tus derechos (art. 13-17 Ley 25.326)**
   - Texto de cada derecho + link a endpoint correspondiente
   - Tiempo de respuesta: 10 días hábiles (art. 14)

6. **Research mode (opt-in explícito)**
   - Texto completo: ver [features/RESEARCH_MODE.md](../features/RESEARCH_MODE.md)
   - Honest disclosure: **seudonimización, no anonimización**

7. **Responsable del tratamiento**
   - Nombre del developer / tesista
   - Dirección académica (Universidad Siglo 21)
   - Email de contacto

8. **Derecho a denunciar**
   - Ante la AAIP: https://www.argentina.gob.ar/aaip

9. **Link a política de privacidad completa** (`/privacy`)

10. **Checkbox**: "He leído y acepto los términos de uso y el tratamiento de mis datos según Ley 25.326"

### Consent storage (`consent_records`)

```sql
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_version TEXT NOT NULL,       -- e.g. "2026-04-14-v1"
  consent_text_hash TEXT NOT NULL DEFAULT '', -- SHA-256 del texto verbatim (migration 004, ADR-024)
  locale TEXT NOT NULL DEFAULT 'es-AR', -- BCP-47 (migration 004, ADR-024)
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT NOT NULL,               -- HMAC-SHA256(ip, CONSENT_IP_PEPPER_V1)
  pepper_version SMALLINT NOT NULL DEFAULT 1,
  user_agent TEXT
);
```

IP hashing prevents unnecessary PII storage while allowing future-you to verify which IP accepted terms in a dispute. Pepper is in env, never in DB. See [tech/SECURITY.md](../tech/SECURITY.md).

### Consent versioning + verbatim integrity (ADR-024)

- `consent_version` is a string like `2026-04-14-v1`.
- When the text materially changes, bump the version.
- On next login, user with stale version sees re-prompt.
- Previous `consent_records` rows are NOT deleted — they're the audit trail.
- **`consent_text_hash`** is SHA-256 of the exact consent text as rendered
  to the user (hex-encoded). This is new in migration 004 and satisfies
  Ley 25.326 art. 7 verifiability requirement for sensitive data consent.
  Pre-migration rows have empty string; they're auditable only by version.
- The repo keeps versioned verbatim text at
  [content/consent/v1-es-AR.md](../../content/consent/v1-es-AR.md) (and
  future `v2-es-AR.md`, `v1-en.md`, etc.). A CI test hashes each file
  and asserts the computed hash matches what clients send — preventing
  drift between displayed text and archived file.
- **`locale`** is BCP-47 (`es-AR`, `en`, etc.). Ready for multi-idioma
  futuro via next-intl (ADR-010).

## Data rights endpoints

### Access: `GET /api/account/export`

Returns a ZIP with:
- `profile.json` — `profiles` row
- `psychological_profiles.json` — all versions
- `narratives.json` — all narratives
- `conversations.json` — conversations + messages inline
- `development_plans.json` — all plans
- `future_letters.json` — all letters (including not-yet-unlocked)
- `consent_records.json` — consent history (immutable)
- `research_dataset.json` — IF `research_opt_in=true`, recomputes HMAC and queries matching rows. Honest inclusion (fixes CEO plan iter-2 inconsistency).

Streaming gzip for large users. Response must complete within 10s (Edge timeout) or migrate to Node runtime with background processing. TFG scale won't hit this.

### Rectification: `/settings/profile`

Simple form, updates `profiles.full_name` and `profiles.email`. Email changes trigger re-verification.

### Cancellation: magic-link delete flow

Two-step to prevent accidental deletion:
1. `POST /api/account/delete/request` — generates token, sends email
2. `POST /api/account/delete/confirm` (via email link) — cascade delete

Cascade order specified in [API_MAP.md](../API_MAP.md). Atomic transaction. Post-delete confirmation email.

### Opposition: `POST /api/account/research-opt-out`

Toggles `profiles.research_opt_in`. Future writes to `research_dataset` respect the new value. Existing rows are handled per the consent text (retained by default, purgeable via delete flow with explicit opt-in).

## Privacy policy (`/privacy`)

Distinct from the consent text shown at onboarding. Publicly accessible route.

Contents:
- Identity of the responsible party
- Types of data collected
- Purposes of processing
- Legal basis (informed consent)
- Retention periods
- Recipients (Anthropic, Supabase, Resend — names and roles)
- International data transfers (US servers)
- User rights (summary + links to endpoints)
- Contact info for complaints
- Last updated date

Drafted in Spanish rioplatense, not legal jargon.

## Terms of service (`/terms`)

- Service description
- User obligations (no illegal content, no abuse, no scraping, age 18+)
- Not therapy disclaimer (explicit, prominent)
- Limitation of liability
- Account termination policies
- Jurisdiction: Argentina
- Last updated date

## Safety / not-therapy disclaimers

Multiple layers — the more places it appears, the stronger the legal and ethical posture:

1. **Landing page footer**: "Umbra no es terapia. Si estás en crisis: 135"
2. **Onboarding intro**: disclaimer card before the mode selector
3. **Consent form**: explicit section
4. **Chat page**: permanent banner at top (non-dismissible)
5. **Crisis card (when triggered)**: full resource list
6. **Terms of service**: legally binding disclaimer
7. **Privacy policy**: repeat

## AI / ML disclosure (Anthropic relationship)

Per Anthropic's terms, user content sent to the API is not used for training. Umbra's privacy policy references this. If Anthropic changes their policy, Umbra's policy must be updated and users notified (material change → consent_version bump → re-prompt).

## Retention exceptions

| Data type | Retention |
|---|---|
| `auth.users`, `profiles` | until deletion request |
| `psychological_profiles` | until deletion request |
| `narratives`, `conversations`, `messages`, `development_plans`, `future_letters` | until deletion request |
| `consent_records` | until deletion request (audit trail) |
| `analysis_raw` JSONB | 30 days (auto-purged — see ADR-019) |
| `crisis_events` | 30 days (nightly cron) |
| `delete_confirmations` | cleaned on use or expiry |
| `rate_limits` | 90 days rolling window (optional cleanup) |
| `research_dataset` | retained unless explicit purge on delete |

## Compliance checklist

- [ ] `/consent` route implemented with full text + checkbox + DB write
- [ ] `consent_records` table with RLS (user reads own history)
- [ ] `consent_version` string format: `YYYY-MM-DD-vN`
- [ ] IP hashed with pepper, not stored plaintext
- [ ] `/api/account/export` endpoint returns full ZIP
- [ ] Magic-link delete flow with 5-min TTL
- [ ] Cascade delete across all 13 tables in correct FK order
- [ ] Research opt-out endpoint
- [ ] `/privacy` and `/terms` public pages
- [ ] Footer link to privacy + terms on every page
- [ ] Non-dismissible crisis banner on `/chat`
- [ ] Crisis classifier fail-closed semantics (see [tech/CHAT_SAFETY.md](../tech/CHAT_SAFETY.md))
- [ ] AAIP complaint link in privacy policy

## References

- [Ley 25.326 full text (InfoLEG)](http://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/norma.htm)
- [AAIP (Agencia de Acceso a la Información Pública)](https://www.argentina.gob.ar/aaip)
- [Anthropic data policy](https://www.anthropic.com/legal)
- [biz/ETHICS.md](ETHICS.md) — ethics review path for research participant mode
- [features/CONSENT.md](../features/CONSENT.md) — consent flow spec
- [tech/SECURITY.md](../tech/SECURITY.md) — peppers, HMACs, PII handling
