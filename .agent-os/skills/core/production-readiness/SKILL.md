---
name: production-readiness
description: 'Run production readiness for releases. Trigger before launch, public beta, deploy, release, production mutation, payment/auth/data change, high-traffic feature, or when the user says ship, production, release, canary, rollback, go live, or launch.'
---

# Production Readiness

Use this skill before production-facing work ships.

## Workflow

1. Read `.agent-os/PROJECT_PROFILE.md`.
2. Read `.agent-os/PRODUCTION_READINESS.md`.
3. Confirm scope, owner, rollout target, and success metric.
4. Check operational, security, reliability, performance, AI, data, accessibility, continuity, scale/resilience, vendor, cost, observability, and support gates.
5. Run or request the relevant commands from `.agent-os/EVIDENCE_REQUIREMENTS.md`.
6. Decide: ship, flag/limit, fix first, or do not ship.

## Output

- Ship decision.
- Blocking gaps.
- Checks run.
- Accepted risks.
- Rollback/canary/restore note.
- Scale/cost/provider risk note.
- Support/monitoring note.

Do not deploy or mutate production without approval.
