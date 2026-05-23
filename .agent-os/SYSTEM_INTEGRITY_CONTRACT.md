# System Integrity Contract

> Portable contract for auditing and maintaining the whole agent/product operating system, not only the product UI or code.

## Purpose

Agent OS can fail even when every individual contract looks reasonable. The common failure mode is drift: a rule exists in one file, a workflow references another, CI checks a third thing, and the founder believes a fourth.

This contract keeps the operating structure coherent, enforceable, reusable, and small enough to operate.

The rule:

> A structure is only real if it has a trigger, owner, evidence, enforcement path, and review loop.

## Integrity Dimensions

Audit every important contract, workflow, skill, agent, rule, script, and artifact against these dimensions:

| Dimension       | Question                                                       |
| --------------- | -------------------------------------------------------------- |
| Purpose         | What decision or failure does this prevent?                    |
| Source of truth | Where does the canonical rule live?                            |
| Trigger         | When does it run automatically or get invoked?                 |
| Owner           | Which agent/human role owns it?                                |
| Evidence        | What proves it was followed?                                   |
| Enforcement     | Is it manual, scripted, CI-gated, monitored, or only advisory? |
| Drift detection | How do we know it became stale?                                |
| Portability     | What changes when copied to another project?                   |
| Cost            | What cognitive/tool/runtime burden does it add?                |
| Removal path    | When can it be merged, deprecated, or deleted?                 |

## Operating-System Coverage Map

The structure is complete only when every layer below has a contract, evidence, and failure path:

| Layer                       | Existing primary contracts                                                                            | Common blind spot                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Intake and founder focus    | `SOLO_FOUNDER_CONTROL_PLANE.md`                                                                       | Raw ideas bypass classification                                   |
| Product/user value          | `UX_RESEARCH_AND_FLOW_CONTRACT.md`, `CUSTOMER_DISCOVERY_CONTRACT.md`, `FEATURE_EXECUTION_CONTRACT.md` | Features ship without user/buyer evidence or use-case/metric      |
| Product language/naming     | `PRODUCT_LANGUAGE_CONTRACT.md`, `DECISION_SYNC_CONTRACT.md`                                           | Project mythology leaks into reusable core or UI                  |
| Decisions and approvals     | `DECISION_SYNC_CONTRACT.md`, `APPROVAL_GATES.md`                                                      | Decisions remain in chat or docs as fact                          |
| Architecture and contracts  | `FEATURE_EXECUTION_CONTRACT.md`, `PLATFORM_STRATEGY_CONTRACT.md`                                      | API/DB/UI contracts drift, future platforms break                 |
| Data and analytics          | `REAL_DATA_ENVIRONMENT_CONTRACT.md`, `DATA_ANALYTICS_CONTRACT.md`                                     | Demo data or bad events drive decisions                           |
| Security/privacy/legal      | `SUPPLY_CHAIN_SECURITY.md`, `PRODUCTION_READINESS.md`                                                 | Threat model and data retention are implicit                      |
| AI/model quality            | `AI_RISK_REGISTER.md`, prompt contracts, evals                                                        | Evals do not cover real output failure modes                      |
| Scale/resilience/cost       | `SCALE_AND_RESILIENCE_CONTRACT.md`                                                                    | Heavy work stays in request path                                  |
| UX/design/platform          | `DESIGN_SYSTEM_CONTRACT.md`, `PLATFORM_STRATEGY_CONTRACT.md`                                          | Local UI decisions bypass shared system                           |
| External intelligence/tools | `EXTERNAL_INTELLIGENCE_STACK.md`, `MCP_REGISTRY.md`                                                   | Tool popularity replaces tool fit                                 |
| QA/evidence                 | `EVIDENCE_REQUIREMENTS.md`, `DOGFOODING_CONTRACT.md`, `QA_ARMY_PROTOCOL.md`                           | Evidence exists but is stale, not linked, or not tried end to end |
| Release/ops/incident        | `PRODUCTION_READINESS.md`, `workflows/incident.md`                                                    | Runbooks are not drilled                                          |
| Runtime/model operation     | `RUNTIME_CONTEXT_CONTRACT.md`, `MODEL_AND_REVIEW_ORCHESTRATION.md`                                    | Claude/Codex/future agents load different truth                   |
| Portability                 | `PROJECT_BOOTSTRAP_PLAN.md`, `PORTABILITY_GUIDE.md`                                                   | Project overlay leaks into portable core                          |

## Control Automation Ladder

Every recurring rule should sit on the highest practical rung:

1. `advisory`: documented guidance only.
2. `checklist`: required in feature/audit/release output.
3. `scripted`: local script checks it.
4. `ci-gated`: CI blocks drift.
5. `runtime-gated`: agent hook/tooling blocks unsafe action.
6. `monitored`: production/beta monitor detects runtime drift.

Do not pretend an advisory rule is enforced. If it matters for launch, move it up the ladder or record accepted risk.

## Unified Risk Register

Use this for product, business, security, data, AI, legal, vendor, ops, delivery, and agent-system risks. `AI_RISK_REGISTER.md` remains the AI-specific view.

```md
Risk ID:
Date:
Class: product | ux | architecture | data | security | privacy | legal | ai | cost | scale | vendor | ops | delivery | docs | agent-system | portability
Status: open | mitigated | accepted | blocked | retired
Owner:
Risk:
Cause:
Impact:
Likelihood: low | medium | high
Severity: P0 | P1 | P2 | P3
Early warning signal:
Control:
Evidence:
Decision ID:
Review date:
Reversal/removal trigger:
```

Risk records can live in audit artifacts, release notes, or decision records. High-cost open risks need founder approval before launch.

## Artifact Lifecycle

Artifacts prevent chat-memory drift only if their status is clear.

Every important artifact should include:

```md
Artifact:
Date:
Scope:
Status: draft | provisional | current | superseded | historical
Source evidence:
Trusted until:
Supersedes:
Superseded by:
Founder approval:
Docs/code impacted:
Next action:
```

Rules:

- Audit artifacts are provisional until verified against screens/code/runtime evidence.
- Research artifacts expire when the external source can change the decision.
- Decision artifacts are not canonical until approved and verified.
- Generated artifacts should be marked generated and regenerated from source when possible.
- Historical artifacts should not be copied into new projects unless the lesson is converted into portable structure.

## Cross-Contract Coherence Check

Run this when `.agent-os`, `AGENTS.md`, `CLAUDE.md`, `.claude/rules`, MCPs, skills, workflows, or bootstrap structure changes:

1. List changed operating files.
2. Identify which contract is source of truth.
3. Check `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, and runtime-specific mirrors for drift.
4. Check registries: `SKILL_REGISTRY.md`, `MCP_REGISTRY.md`, `EXTERNAL_INTELLIGENCE_STACK.md`.
5. Check workflows that should call the new/changed contract.
6. Check product-language and design-system contracts if the change affects naming, copy, UI, docs, product category, public claims, or brand/metaphor boundaries.
7. Check `PROJECT_BOOTSTRAP_PLAN.md` and `PORTABILITY_GUIDE.md` if the change should be reusable.
8. Check eval cases for the behavior.
9. Check scripts/CI if the rule should be enforced.
10. Record what remains advisory vs enforced.

## Structural Premortem Prompts

Use these to find blind spots:

- "This Agent OS failed after being copied to another project. Why?"
- "A founder thought the agents were handling a risk, but they were not. Where was the false sense of safety?"
- "A Claude session and a Codex session made opposite decisions. Which source of truth diverged?"
- "The audit produced 200 findings and no product got better. Which phase failed to convert evidence into decisions?"
- "A launch incident happened despite green checks. Which check was advisory, stale, or scoped wrong?"

## Anti-Patterns

- More contracts without triggers.
- More tools without a removal path.
- Skills that sound smart but cannot fail an eval.
- Docs marked canonical before code/screen/DB/test reconciliation.
- Multiple artifacts answering the same question with no supersession link.
- A workflow that outputs findings but no decision queue.
- A launch gate with no owner, date, evidence, or accepted-risk note.
- A portable template that still contains project-specific metaphors, vendors, or routes.

## Output For A System Integrity Review

```md
Scope:
Files/contracts reviewed:
External standards checked:
Coverage matrix:
Coherence findings:
Blind spots:
Duplicate/overlapping controls:
Advisory-only controls that should be automated:
Automation/CI changes:
Portable-core changes:
Project-overlay changes:
Risks opened:
Decisions needed:
Confidence:
```
