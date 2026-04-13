# Feature — Research Participant Mode

> Opt-in pseudonymized dataset for the TFG paper. Gated on Phase 0 ethics
> gate. Branch A = enabled, Branch B = deferred to future work.

## Phase
3 (schema + opt-in) + parallel with KB research

## Status

**CONDITIONAL**: gated on Phase 0 ethics gate outcome. See [biz/ETHICS.md](../biz/ETHICS.md).

- **Branch A** (ethics cleared with consent-only): feature ships as specified below.
- **Branch B** (ethics path unclear or blocked): feature is dropped, `research_dataset` table is NOT created, consent form does NOT mention research mode. Paper's validation rests solely on eval H1 + H2 (computational).

## Honest framing

This is **pseudonymization**, not anonymization. The HMAC user_hash is
reversible by an admin with both:
1. The `RESEARCH_PEPPER` (env var)
2. The original user_id list (from `profiles` table)

Consent text discloses this explicitly. See [biz/LEGAL.md](../biz/LEGAL.md).

The trade-off is informed by Ley 25.326 Art. 16 (right to cancellation):
if we promised true anonymization, we'd have to refuse deletion requests
(can't delete what we can't identify). By acknowledging it's pseudonymization,
we preserve the user's right to delete while enabling the research use case.

## Opt-in flow

### Place 1: Consent form (primary)
During `/consent`, after the required Ley 25.326 checkbox, a second optional
checkbox appears (Branch A only):

```
☐ Permito que mis datos anonimizados sean usados para investigación de
  Umbra. (Podés cambiarlo después en /settings/research-opt-out)

  Ver qué significa →  [expandable]
```

Expandable text (inline or modal):

> Cuando participás en la investigación, tus textos introspectivos y el
> perfil generado se guardan en un dataset seudonimizado.
>
> Seudonimización significa que tu identidad está protegida por una clave
> criptográfica secreta, pero NO es anonimización irreversible: el
> administrador con acceso a esa clave y a tu ID original podría
> técnicamente re-vincular tus datos. En la práctica, ese acceso está
> limitado al responsable del tratamiento.
>
> Si cancelás tu cuenta, tus datos del research dataset permanecen, salvo
> que marques explícitamente "purgar también mi contribución de
> investigación" en el flujo de borrado.
>
> Tu contribución ayuda al paper: {OSF link}

On check → `UPDATE profiles SET research_opt_in = true`.

### Place 2: Settings page
`/settings/research-opt-out` shows current state + toggle. User can change
mind at any time.

Note: toggling OFF does NOT delete existing rows. It only stops future writes.
Full purge requires the delete flow with `purgeResearch=true`.

## Data capture

When `POST /api/analyze` successfully generates a profile AND
`profiles.research_opt_in = true`:

```ts
const userHash = computeHash('research', userId);

await serviceRoleSupabase.from('research_dataset').insert({
  user_hash: userHash,
  pepper_version: CURRENT_PEPPER_VERSION,
  input_text: combinedOnboardingText,
  generated_profile: parsedProfile,
});
```

Key points:
- Only `analyze` triggers a research write (not chat, not narrative, not plan — those are more conversational and privacy-sensitive)
- `combinedOnboardingText` is the user's introspective text(s) joined
- `generated_profile` is the full Pass 1 output JSON
- No email, no name, no IP, no real user_id stored
- `created_at` has day granularity but no finer timestamp to avoid correlation attacks

## Research opt-out endpoint

`POST /api/account/research-opt-out { optIn: boolean }`

- Auth required
- UPDATE `profiles.research_opt_in = body.optIn`
- Returns new state
- Does NOT touch existing `research_dataset` rows

## Research data in export (`/api/account/export`)

When the user exports their data and `research_opt_in=true`:
- Server recomputes `HMAC(user_id, RESEARCH_PEPPER_V1)`
- Query `SELECT * FROM research_dataset WHERE user_hash = $1`
- Include matching rows in the ZIP

This resolves the CEO plan iter-2 legal inconsistency (can't claim both
"can't link for export" and "can link for delete"). Both are honest now.

## Research data in delete flow

The delete confirm endpoint has an optional checkbox:

```
☐ También purgar mi contribución de investigación (irreversible)
```

If checked:
- Server recomputes `HMAC(user_id, RESEARCH_PEPPER_V1)`
- `DELETE FROM research_dataset WHERE user_hash = $1`

If unchecked:
- Rows remain in the research dataset
- Consent text explained this would happen

## Dashboard badge

Branch A: users with `research_opt_in=true` see a subtle badge in their dashboard:

```
┌─────────────────────────────────┐
│  🔬 Contribuís a la investigación│
│      de Umbra                    │
│      [Ver el preregistro →]      │
└─────────────────────────────────┘
```

Small glass card with emerald accent. Links to OSF preregistration URL.
Makes the contribution visible — users feel part of something.

## Ethical safeguards summary

- **Informed consent**: explicit opt-in in consent form
- **Data minimization**: only text + profile, no identifiers
- **Purpose limitation**: used only for preregistered H1/H2 + paper
- **Pseudonymization**: HMAC with service-role pepper
- **Access control**: service-role-only RLS, no client or user access
- **Audit trail**: `research_dataset` writes are logged (TODO: access log for reads)
- **Retention**: indefinite by default, purgeable on user request via delete flow
- **Withdrawal**: toggleable any time; past contributions remain (disclosed)
- **No sale / no sharing**: explicitly prohibited

See [biz/ETHICS.md](../biz/ETHICS.md) for full ethics framing.

## Testing

- `app/api/account/research-opt-out/route.test.ts` — toggle logic
- Integration: opt-in → analyze → verify row in `research_dataset`
- Integration: opt-out → analyze → verify NO row written
- Integration: delete with purge → verify row deleted
- Integration: delete without purge → verify row remains
- Integration: export with opt-in → verify research rows in ZIP
- Integration: export with opt-out → verify NO research rows in ZIP

## Not in scope

- **Automated research analytics** (like a dashboard for the researcher) — out of scope for TFG
- **Research data sharing with other researchers** — requires new consent
- **Revocation of individual past contributions without full delete** — deferred (would require stored linking token)
- **Differential privacy or k-anonymity layers** — future work if dataset grows

## See also

- [biz/ETHICS.md](../biz/ETHICS.md) — Phase 0 gate + ethics framing
- [biz/LEGAL.md](../biz/LEGAL.md) — Ley 25.326 compliance
- [biz/TFG.md](../biz/TFG.md) — OSF preregistration + paper
- [DECISIONS.md ADR-013, ADR-017, ADR-021](../DECISIONS.md)
- [tech/SECURITY.md](../tech/SECURITY.md) — HMAC peppers
- [tech/DATABASE.md](../tech/DATABASE.md) — `research_dataset` schema
- [CONSENT.md](CONSENT.md) — where opt-in happens
