# Workflow: Feature

Use `.agent-os/FEATURE_EXECUTION_CONTRACT.md`.

## Sequence

1. Orchestrator classifies the input with `SOLO_FOUNDER_CONTROL_PLANE.md`, then scope, blast radius, and gates.
2. Build the Required Current Context Packet from repo evidence:
   - input classification and solo-founder context,
   - running screens/routes,
   - related components,
   - APIs/server actions,
   - stores/types/schemas/prompts,
   - DB/migrations/RLS/storage,
   - tests/E2E/QA artifacts,
   - docs/biz/tech claims as hypotheses,
   - active decisions/audit findings.
3. Research runs if external context can change the decision: legal/compliance, providers, APIs, pricing, GTM, founder communication, social channels, security, accessibility, dependencies, AI/model behavior, or market claims.
4. Product Strategy defines user, problem, metric, scope, non-goals, and business reason.
5. Founder Ops checks user value, feedback/support signal, revenue/cost/support/GTM/capital implications, founder workload, continuity/recovery risk, vendor/IP risk, delivery health impact, and whether a decision record is needed.
6. Design Reviewer defines UX, copy, states, accessibility, responsive behavior, and design-system fit.
7. Architecture Security defines contracts, data flow, API/security, DB/RLS/storage, prompt/tool risk, privacy/compliance triage, and tests.
8. Approval gate if scope, data, DB, billing, legal/compliance, security, external tools/vendors, AI behavior, GTM, founder communication, pricing, public claims, or production-facing risk changes.
9. Builder implements the smallest coherent fullstack slice.
10. QA Verifier proves behavior with tests, browser QA, accessibility, interaction inventory, and manual gates where needed.
11. Docs and decision records update only after code/screen behavior is verified.
12. Release Captain prepares ship evidence and production-readiness gate when applicable.

## Required Evidence

- Current Context Packet.
- Input classification from `SOLO_FOUNDER_CONTROL_PLANE.md`.
- Feature Blueprint.
- Decision ID or explicit "no durable decision".
- Visible entrypoint or internal/webhook/job/dev-only classification.
- UX states: loading, empty, error, degraded, disabled, success.
- Fullstack map: route/component -> API/action -> store/type/schema -> DB/storage/prompt.
- Security/privacy/legal/compliance triage.
- Tests/QA/E2E/accessibility evidence proportional to risk.
- Success metric/failure signal and analytics contract if instrumented.
- Docs to update or reason none apply.
- Rollout/rollback or feature-flag/manual-gate when production-facing.
- Continuity/recovery, vendor/subprocessor/tool, and IP/content-rights notes when relevant.
