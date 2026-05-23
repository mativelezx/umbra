# Model And Review Orchestration

> Keep Agent OS model-agnostic across Claude, ChatGPT/Codex, future coding agents, browser agents, and research agents.

## Principle

Models are interchangeable executors. The repo contracts are the operating system.

No model-specific chat, reasoning style, or proprietary mode is allowed to become the only source of truth. If a model produces useful strategy, research, critique, or investigation, convert it into a project artifact, decision record, eval, or contract update.

Use `.agent-os/RUNTIME_CONTEXT_CONTRACT.md` for instruction loading, context freshness, runtime handoff, hooks/settings, skills/subagents, and MCP/tool governance across Claude, Codex/ChatGPT, and future models.

## Runtime Registry

Each project should record the agent/model surfaces it uses:

```md
Runtime:
Provider/model:
Primary use: planning | coding | research | browser QA | security | docs | design | ops
Tool access:
Filesystem access:
Browser access:
MCP access:
Can mutate code? yes/no
Can mutate production? yes/no
Instruction files read:
Known strengths:
Known failure modes:
Required evidence before accepting output:
Fallback runtime:
```

Examples of runtimes:

- Claude Code;
- Codex / ChatGPT coding agent;
- ChatGPT deep research or investigation mode;
- Claude deep research / long-form investigation mode;
- browser QA agent;
- security scanner;
- docs generator;
- CI/release bot;
- future model/provider.

## Cross-Model Contract

Every runtime must follow the same hierarchy:

1. System/security/tool policy.
2. Real repo/runtime evidence.
3. `.agent-os/PROJECT_PROFILE.md` and Agent OS contracts/workflows.
4. Project instruction files such as `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, or future equivalents.
5. Runtime-specific settings, hooks, memories, skills, and MCP outputs.
6. Skills as advisory inputs.
7. Human approval gates.

If a runtime cannot read or enforce this hierarchy, its output is advisory only.

Before large work, create a runtime context handshake artifact using the template in `RUNTIME_CONTEXT_CONTRACT.md`.

## Model-Agnostic Output Requirements

Any significant model output should include:

```md
Input/context used:
Assumptions:
Evidence:
Decision impact:
Files/routes/docs affected:
Risks:
Approval needed:
Verification required:
Artifacts to update:
```

This lets another model continue the work without relying on hidden chat context.

## Strategic Review Pack

Use this for large planning passes such as CEO review, board-level critique, deep investigation, market scan, architecture review, or founder strategy sessions.

```md
Review name:
Runtime/model used:
Date:
Question/plan reviewed:
Mode: CEO review | deep investigation | research | design review | engineering review | security review | growth review | legal/compliance triage
Context packet:
Key claims:
Strongest recommendations:
Risks/blind spots:
Contradictions:
Decisions proposed:
Evidence/sources:
What changes in project plan:
What does not change:
Follow-up artifacts:
Founder approval needed:
```

## Strategic Context Research Gate

Run this before building or refactoring when a rough idea needs product, business, technical, market, design, AI, security, or founder/GTM direction.

Good inputs:

- ChatGPT deep research reports with citations;
- Claude long-form investigations or planning sessions;
- Codex repo investigations;
- market/category/competitor scans;
- UX/reference-product research;
- architecture/security/vendor comparisons;
- founder-provided docs, memos, transcripts, notes, or investor/CTO discussions.

Use `.agent-os/skills/core/guided-intake/references/deep-research-prompts.md` for reusable research prompts before running external Claude/ChatGPT/Codex investigations. Select prompts based on the decision, not by habit.

Runtime-agnostic rules:

1. Ask the runtime to cite sources, separate evidence from inference, and list uncertainty.
2. Keep private data, credentials, customer data, production data, and proprietary assets out unless approved.
3. Treat model research as raw intelligence until reconciled with current repo evidence and trusted sources.
4. Convert only durable conclusions into `.agent-os/PROJECT_PROFILE.md`, decision records, evals, active workflow artifacts, or implementation tasks.
5. Require founder approval before changing ICP, pricing, GTM, launch scope, public claims, production data, vendor/tool posture, or capital/CTO narrative.

Minimum output:

```md
Runtime/model:
Date:
Research question:
Context provided:
Sources/citations:
Verified findings:
Useful hypotheses:
Contradictions:
Unsupported claims:
Decisions proposed:
Experiments proposed:
Risks:
What changes:
What does not change:
Approval needed:
Agent OS updates:
```

## CEO Review Gate

Run a CEO/founder review when:

- the plan changes product scope, ICP, pricing, GTM, category, capital story, launch scope, or roadmap;
- the product may be too small, too complex, too abstract, or too disconnected;
- a feature is strategically expensive but not clearly tied to activation, retention, revenue, learning, or risk reduction;
- the founder asks "is this ambitious enough?", "what am I missing?", "should this be bigger/simpler?", or similar.

CEO review output must map to `DECISION_SYNC_CONTRACT.md` if durable.

## Deep Investigation Gate

Run a deep investigation when:

- root cause is unknown;
- multiple systems may be involved;
- docs/code/screen/runtime evidence contradict;
- a provider, queue, DB, AI model, render pipeline, auth, billing, or cost issue is suspected;
- a previous quick fix failed;
- the answer could change architecture, launch readiness, or CTO handoff.

Investigation output must include:

- hypothesis list;
- evidence for/against each hypothesis;
- root cause or "not proven yet";
- blast radius;
- fix options;
- verification plan;
- prevention/runbook/doc updates.

## Council / Multi-Perspective Reviews

For high-impact decisions, use a small review board:

- founder/CEO lens;
- product/user lens;
- design/UX lens;
- architecture/security lens;
- scale/cost/ops lens;
- legal/compliance/IP lens when relevant;
- growth/GTM lens when relevant.

Do not let the council become theater. Each lens must produce a decision, blocker, or explicit "no issue found" with evidence.

## Artifact Rule

Large external conversations are not durable until saved or summarized into:

- a decision record;
- a research artifact;
- an audit artifact;
- a premortem;
- a bootstrap artifact;
- an eval case;
- docs after verification.

## Evals

Run agent evals when adding a new runtime/model or changing its role.

Eval cases:

- Does the runtime read `PROJECT_PROFILE.md`?
- Does it respect approval gates?
- Does it treat docs as hypotheses?
- Does it produce evidence instead of unsupported claims?
- Does it avoid production/data/tool mutation without approval?
- Can another model continue from its artifact?
