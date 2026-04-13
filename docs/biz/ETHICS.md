# Umbra — Ethics Review & Research Participant Mode

> How Umbra handles ethics for the research dataset, advisor meeting, and
> the Branch A / Branch B decision tree.

## Why this matters

The codex outside voice flagged this as a load-bearing risk: shipping a
research dataset schema before confirming with the TFG advisor + ethics
review path is a sequencing contradiction. The consent text, OSF preregistration,
and delete/export semantics all depend on whether the research feature exists
at all.

See [DECISIONS.md ADR-017](../DECISIONS.md) for the full decision record.

## Phase 0 — Ethics Gate

**Before Migration 002 ships**, the developer runs a 30-min meeting with the
TFG advisor. Output: binary decision (Branch A vs Branch B).

### Questions to close in the meeting

1. **Does Siglo 21's current policy allow a consented + pseudonymized dataset
   from real Umbra users, via informed consent form only?**
   - If YES → Branch A
   - If NO (requires IRB-equivalent review) → ask 2

2. **Can IRB review run in parallel with development?**
   - If YES → Branch A, but research dataset feature stays behind a feature flag until IRB approves
   - If NO (IRB blocks development) → Branch B

3. **Does the tribunal accept "Model = instrument" framing?**
   - This is the broader methodological question (codex finding 6)
   - User chose to assume YES (acknowledged cathedral risk) — see [ceo plan](../../../.gstack/projects/Umbra/ceo-plans/2026-04-12-umbra-full-project.md) "Acknowledged Cathedral Risks"
   - If the advisor rejects the framing, fallback to "Software Engineering thesis with rigorous eval as the primary validation evidence"

### Outcome document

Produce a short written summary of the meeting and save it to:
`~/.gstack/projects/Umbra/phase-0-ethics-outcome-YYYY-MM-DD.md`

Include:
- Date of meeting
- Who attended
- Questions asked
- Advisor's responses verbatim (or paraphrased if meeting wasn't recorded)
- Decision: Branch A or Branch B
- Any follow-ups (e.g. "advisor will check with department head and email confirmation")

## Branch A — Research dataset allowed

### Scope impact
- Migration 002 ships `research_dataset` table
- Migration 002 adds `profiles.research_opt_in BOOLEAN DEFAULT FALSE`
- Consent form includes the full research section (see [features/RESEARCH_MODE.md](../features/RESEARCH_MODE.md))
- `/settings/research-opt-out` endpoint is functional
- `POST /api/account/export` recomputes HMAC and includes research rows when opt-in
- `POST /api/account/delete/confirm` supports `purgeResearch=true` flag
- Paper's validation evidence includes both eval H1/H2 AND user dataset analysis

### Ethical safeguards

- **Informed consent**: explicit section in consent form, honest about pseudonymization (not anonymization)
- **Pseudonymization**: `user_hash = HMAC(user_id, RESEARCH_PEPPER)`. Not reversible without admin access to pepper + raw user_id
- **Data minimization**: only the original text + generated profile are stored. No email, no name, no IP, no timestamps beyond `created_at` (day granularity could be aggregated for further anonymization if needed)
- **Retention**: indefinite by default; user can explicitly purge on delete
- **Access**: service-role-only RLS. No public queries. No client access.
- **Purpose limitation**: data is used ONLY for the preregistered hypotheses H1/H2 and the TFG paper. Not sold. Not shared with third parties. Not used for model training.
- **Audit trail**: every read of `research_dataset` should be logged (TODO: add an access log)

## Branch B — Research dataset deferred

### Scope impact
- Migration 002 does NOT include `research_dataset` table
- Migration 002 does NOT include `profiles.research_opt_in` column
- Consent form does NOT mention research mode
- `/settings/research-opt-out` endpoint is not implemented
- `POST /api/account/export` has no research branch
- `POST /api/account/delete/confirm` has no `purgeResearch` flag
- Paper's validation evidence rests solely on eval H1/H2 (computational)
- Research dataset reframed in paper as "future work, pending IRB approval"

### Why this is still a defensible TFG

- The eval suite (H1 determinism + H2 cross-model paraphrase) is the primary validation evidence
- These are falsifiable preregistered hypotheses that don't need human subjects
- A tribunal reviewing the thesis clones the repo, runs `npm run eval -- --from-cache`, and sees the results
- The code quality, methodology, and product surface are all intact
- The "open research" claim is weakened but the "verifiable rigor" claim is not

## Ethical principles (applicable regardless of branch)

### Declaración de Helsinki (research ethics)

- **Beneficence**: Umbra aims to benefit users through self-knowledge; does not exploit
- **Non-maleficence**: crisis guardrails, "not therapy" disclaimers, fail-closed classifier
- **Autonomy**: informed consent, opt-in for research, right to withdraw
- **Justice**: free to use (no pay-to-participate), Spanish-language accessibility

### Calvo & Peters (2014) Positive Computing principles

Umbra is built ON these principles, not just about them:

- **Autonomy**: user controls their data, can delete anytime, opt-in for research
- **Competence**: the profile helps users understand their patterns, not pathologize them
- **Relatedness**: the chat feels like a mirror, not an authority
- **Mindfulness**: no dark patterns, no streak-based retention, no gamification
- **Positive emotion**: narrative is reflective and warm, not clinical
- **Engagement**: depth over breadth, quality over quantity
- **Resilience**: development plan focuses on growth, not fixing deficits
- **Self-compassion**: no shaming language, no "your weakness is..."

The Positive Computing knowledge block (`lib/knowledge/positive-computing.ts`)
encodes these as do/don't rules that the chat system prompt references.

## Specific ethical red lines (Umbra will NEVER)

1. Use the product to identify individuals beyond their consent
2. Sell, rent, or share user data with third parties for profit
3. Expose individual data in the paper (only aggregates, only with opt-in)
4. Use the chat to extract more data than necessary for the experience
5. Add advertising, tracking pixels, or behavioral analytics beyond Vercel defaults
6. Store crisis event content (only salted hashes — see ADR-008)
7. Make clinical claims ("you have depression")
8. Diagnose, prescribe, or recommend medical interventions
9. Replace professional therapy; always route to human resources in crisis
10. Use dark patterns to prevent account deletion

## Conflict of interest disclosure (for paper)

The developer is a TFG student at Siglo 21. The product is both the research
instrument AND the object of study. This is a conflict of interest that the
paper must disclose:

> "The primary author developed Umbra both as software artifact and research
> instrument for this study. Eval methodology (H1 + H2) was preregistered on
> OSF before first data collection to mitigate researcher degrees of freedom.
> Committed cache snapshots allow external replication without requiring API
> access or further data collection."

## Research dataset ethical mitigations (Branch A only)

- Opt-in is explicit and visible (not buried in settings)
- Purge-on-delete option is visible in the delete flow
- Consent text is honest about pseudonymization being reversible with admin access
- Access is service-role-only — not even the developer can query it casually from the app
- Retention is documented in consent with 3 clear scenarios (default keep, purge on delete, future policy changes)

## References

- [Declaración de Helsinki (WMA)](https://www.wma.net/policies-post/wma-declaration-of-helsinki-ethical-principles-for-medical-research-involving-human-subjects/)
- [AAIP ethics guidance for research with personal data](https://www.argentina.gob.ar/aaip)
- [OSF preregistration guidelines](https://www.cos.io/initiatives/prereg)
- Calvo & Peters (2014) *Positive Computing: Technology for Wellbeing and Human Potential*
- [features/RESEARCH_MODE.md](../features/RESEARCH_MODE.md)
- [biz/LEGAL.md](LEGAL.md)
- [biz/TFG.md](TFG.md)
