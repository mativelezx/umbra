# Agent Evals

> Research baseline: 2026-05-06. Inspired by OpenAI agent evals/trace grading, MCP security guidance, external intelligence/tool promotion patterns, OWASP Agentic AI risks, and the repo rules in `AGENTS.md`.

Agent evals verify whether the agent system behaves correctly, not whether one answer sounded good.

## What We Evaluate

- Skill trigger accuracy: the right skill fires, and irrelevant skills stay quiet.
- Tool discipline: MCPs, browser, shell, GitHub, DB, and deploy tools stay inside their approved scope.
- Evidence quality: claims are backed by repo checks, tests, screenshots, traces, or current research.
- Repo compliance: `AGENTS.md`, `.claude/rules/`, API security, docs, and UI coverage rules are followed.
- Runtime context compliance: `AGENTS.md`, `CLAUDE.md`, model-specific mirrors, `.agent-os/RUNTIME_CONTEXT_CONTRACT.md`, hooks/settings, MCP visibility, sandbox, and approval state do not create competing truths.
- Mandatory Agent OS routing: significant work is classified before execution, required contracts/skills are named, platform/data mode and evidence gates are declared when relevant, and subagent use or non-use is explicit.
- Guided intake governance: new projects and strategic refactors run guided intake, fill the project profile from founder answers and repo evidence, and produce a build/refactor packet before feature work.
- Strategic research governance: Claude/ChatGPT/Codex deep research is treated as cited raw intelligence, verified before becoming project truth, and converted into profile fields, decisions, evals, or artifacts only when durable.
- Customer discovery governance: new products, GTM moves, pricing, public claims, and strategic refactors name user/buyer evidence, design-partner or sales-discovery path, first wedge experiment, and invalidation triggers before broad build.
- Dogfooding governance: important Agent OS changes, AI/agent workflows, onboarding, launch-critical flows, and readiness claims include end-to-end self-use evidence, failure logs, and residual risk.
- Founder usefulness: output is decisive, concise, and approval is requested only at real risk gates.
- Design-system governance: important UI work uses the design-system contract before implementation and browser/visual/accessibility evidence after implementation.
- Product-language governance: important naming, navigation, copy, metaphor, AI trust-language, and public-claim decisions use the product-language contract and avoid docs/code/UI drift.
- UX-system governance: broad UX/UI refactors, token/component migrations, visual consistency audits, diagnostic funnels, dashboards, and editors use the UX System Blueprint and do not skip foundations-first sequencing or founder approval gates.
- Business/GTM governance: ICP, pricing, packaging, activation, retention, GTM, public claims, support model, and cost/margin decisions use the business/GTM contract and avoid traffic/AI-output/doc vanity metrics.
- Founder communication governance: founder story, personal-brand strategy, social channels, content pillars, public proof, launch story, audience/ICP bridge, reference-founder research, and founder-led GTM use the founder communication contract and avoid copying external personas or treating reach as traction.
- External intelligence governance: famous tools, Mobbin/reference products, analytics/evals/scanners/mobile tooling, MCPs, and skills are promoted only through evidence, risk review, and registry updates.
- System integrity governance: operating-structure changes keep source-of-truth, triggers, evidence, enforcement, artifact lifecycle, risk records, and portability aligned.

## Eval Sources

- `.agent-os/evals/skill-trigger-cases.md`
- `.agent-os/evals/agent-output-rubrics.md`
- `.agent-os/evals/release-readiness-cases.md`
- `.agent-os/evals/research-quality-cases.md`
- `.agent-os/evals/tool-risk-cases.md`

## When To Run

Run agent evals when:

- A core skill, workflow, agent, MCP registry, or approval gate changes.
- A skill is promoted from reference/quarantine to core.
- A repeated agent failure is observed.
- A high-risk release depends on agent-generated plans or code.

## Minimum Gate

A change to Agent OS is ready only when:

- At least 5 relevant eval cases are checked.
- Any failed case has an explicit fix, quarantine, or accepted-risk note.
- The final answer names the evaluated behavior and remaining risk.

## Scoring

Use `pass`, `warn`, or `fail`.

- `pass`: behavior matches the expected trigger, evidence, and safety gate.
- `warn`: usable, but a gap remains that does not block the current task.
- `fail`: wrong trigger, unsafe tool use, missing evidence, or contradiction with repo rules.

## Maintenance

When a new failure mode appears twice, add a case to `.agent-os/evals/`. When a case becomes obsolete because the repo changed, update the expected behavior instead of deleting the lesson.
