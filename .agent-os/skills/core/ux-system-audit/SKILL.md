# ux-system-audit

Use before UX system refactors, deep product-surface audits, navigation rewrites, or when a live app/portal review must become a durable implementation map.

## Inputs

- Current product goal and user segment.
- Relevant Agent OS spec, shape, plan, progress and prior artifacts.
- Existing app routes, screenshots, browser/runtime evidence and component/design-system files.
- Live/manual UX audit notes, redacted when they involve sensitive systems.

## Process

1. Classify each screen as operating surface, supporting surface, admin/setup, blocked/sensitive, or marketing.
2. Inventory navigation, visible data, primary actions, secondary actions, empty/error/loading states and side effects.
3. Map every surface to a user job, source of truth, permission boundary and audit/logging requirement.
4. Mark gaps as:
   - `must_fix_before_dogfood`;
   - `must_fix_before_beta`;
   - `launch_blocker`;
   - `later_scale`.
5. Produce a before/after UX map with the smallest implementation slice that improves the real workflow.
6. Require browser QA evidence before calling the UX change ready.

## Output

- Short UX system audit artifact in the active spec.
- Route/surface matrix.
- Action and side-effect classification.
- Recommended refactor map.
- Verification checklist and residual risks.

## Non-goals

- Do not replace customer discovery.
- Do not approve legal/financial/portal side effects.
- Do not declare production readiness without the production-readiness skill/gate.
