# Workflow: Production Readiness

Use before production launch, deploy, public beta, payment/auth/data changes, or important customer-facing releases.

1. Classify the launch/release with `SOLO_FOUNDER_CONTROL_PLANE.md`.
2. Confirm product scope, owner, success metric, rollout target, support path, founder approval state, and beta/business impact.
3. Run `.agent-os/PRODUCTION_READINESS.md`.
4. Run release evidence from `.agent-os/EVIDENCE_REQUIREMENTS.md`.
5. Check security, reliability, performance, AI, data, accessibility, continuity/recovery, vendor/subprocessor/tool, IP/content-rights, analytics/cost, and support gates.
6. Decide: ship, flag/limit, fix first, or do not ship.
7. Record rollback/canary/restore/vendor-fallback plan when production-facing.

## Output

- Ship decision.
- Blocking gaps.
- Accepted risks.
- Verification commands.
- Rollback/canary note.
- Continuity/recovery note.
- Support/monitoring note.
