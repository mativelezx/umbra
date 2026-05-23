# QA Army Protocol

> TesterArmy-inspired quality layer for Agent OS. This is a reusable protocol, not a commitment to a specific vendor.

## Principle

Docs are hypotheses. The running product and code are evidence.

For audits and launch gates, agents must discover flows from:

1. Real browser screens and interaction inventory.
2. App routes, components, stores, API routes, prompts, migrations, and tests.
3. Runtime evidence: console, network, screenshots, traces, accessibility tree, and persisted state.
4. Docs only after the above, as material to verify, correct, archive, or rewrite.

## What We Borrow From TesterArmy

- Real-browser agents that click through the product like users.
- Plain-language test prompts that become step-by-step test plans.
- PR/deploy exploration focused on changed files and affected routes.
- Recurring production monitoring for critical journeys.
- Authentication-aware testing, including OTP/email-inbox style flows when approved.
- Evidence memory: screenshots, recordings/traces, logs, pass/fail context, and bug reports that can be compared across runs.
- Separate fixed regression groups from exploratory agents so known flows stay stable while new bugs can still be discovered.

## Project Implementation

Use local Playwright and browser QA as the default execution engine. External services like TesterArmy can be added later only after approval and tool-risk review.

Quality layers:

1. `screen-crawl`: non-mutating browser crawl of every reachable user-facing route.
2. `element-inventory`: every visible text node, heading, label, helper, tooltip, badge, card, list/table row, chart label, empty/loading/error/degraded state, overlay, and responsive variant.
3. `interaction-inventory`: every button, link, input, tab, menu, modal, upload, drag/drop affordance, AI action, external handoff, destructive action, and disabled state.
4. `code-ownership-crosswalk`: each browser-visible element is mapped back to route/component/primitive/API/store/prompt/DB ownership where relevant.
5. `plain-language-scenarios`: founder-readable test prompts that describe the user job, not implementation details.
6. `fixed-regression-groups`: deterministic Playwright suites for P0/P1 journeys.
7. `exploration-agent-runs`: affected-route exploratory QA after PRs/refactors, based on changed files and product context.
8. `production-monitors`: focused recurring tests for public/beta-critical flows.
9. `evidence-memory`: artifacts saved under `artifacts/audits/`, with screenshots/traces/reports linked from findings.

## Test Group Taxonomy

| Group                     | Purpose                                                   | Frequency                            |
| ------------------------- | --------------------------------------------------------- | ------------------------------------ |
| Public smoke              | Landing, waitlist, mirror, legal, health.                 | Every PR, every deploy, daily.       |
| Auth and onboarding       | Login, callback, onboarding completion, Home arrival.     | Every release candidate.             |
| First useful output       | Project-defined activation path -> output -> save/resume. | Every release candidate.             |
| Core product surfaces     | Project-defined beta-critical modules from the profile.   | Every PR touching those areas.       |
| Design-system consistency | Repeated modules, tokens, typography, states, responsive. | Every UI refactor.                   |
| Accessibility/keyboard    | Forms, modals, command palette, tabs, menus, touch.       | Every UI refactor/release.           |
| Billing/account/security  | Checkout, portal, export, delete, auth guards.            | Sandbox/manual-gated.                |
| Studio/render/media       | Upload, editor, render, batch, media root.                | Manual-gated unless beta-scoped.     |
| Admin/internal            | Founder ops, costs, CRM, dev utilities.                   | Internal-gated before launch.        |
| Production monitors       | Focused live checks with alerts.                          | Hourly/daily/weekly per criticality. |

## Plain-Language Scenario Format

```md
Scenario:
User:
Starting state:
Goal:
Steps:
Expected visible result:
Forbidden side effects:
Evidence required:
Risk level:
Verification level: automated | crawler | manual-gated | scoped-out
```

## PR / Refactor Exploration

For every significant PR/refactor:

1. Identify changed routes, components, stores, APIs, prompts, migrations, and docs.
2. Build an affected-route list from code, not docs.
3. Run fixed tests for known affected journeys.
4. Run an exploration pass that asks: "what could a real user now fail to do?"
5. Save screenshots/traces and a short bug report for every failure.
6. Update docs only after code and screen behavior are verified.

## Production Monitoring

Production monitors must be small and actionable. Do not combine login, billing, settings, and content generation into one monitor.

Recommended initial monitors:

- Public availability: `/`, `/waitlist`, `/mirror`, `/api/health`.
- Waitlist conversion.
- Login readiness.
- Authenticated Home render with test account.
- First useful output demo/sandbox path.
- Billing price page and checkout preflight in sandbox.

## Auth, OTP, Email, And Credentials

- Use dedicated test users, never founder or real customer accounts.
- Use dedicated inboxes for magic links/OTP/invites when approved.
- Store credentials outside the repo.
- Mask credentials in reports.
- Rotate or delete test accounts before handoff if they touch production.
- OAuth/provider testing is manual-gated unless the provider sandbox is configured.

## Evidence Memory

Every QA run should produce:

- Run date, target URL, branch/commit when available.
- Scenario list.
- Pass/fail status.
- Route/viewport inventory status and any route/state that could not be reached.
- Element inventory status for visible text, controls, states, overlays, and responsive variants.
- Code ownership crosswalk for user-facing elements, or an explicit `unknown-owner` finding.
- Screenshots and traces/recordings for failures.
- Console/network errors.
- Accessibility and interaction issues.
- Regression comparison when a previous run exists.
- Decision: fix now, hide/scope out, accept risk, or convert to backlog.

## Anti-Patterns

- Treating documentation as source of truth before checking screens/code.
- Writing E2E tests against CSS structure instead of user-visible roles/names.
- Huge chained tests where one early failure hides five unrelated flows.
- Clicking destructive, paid, OAuth, email, or production-mutating actions without a gate.
- Testing every implementation detail in Playwright instead of combining unit/integration/E2E/exploration.
- Updating docs before code behavior is verified.
