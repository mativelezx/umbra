# External Intelligence Stack

> Portable contract for using external tools, reference libraries, research products, MCPs, eval platforms, analytics, security scanners, and design inspiration without creating tool bloat.

## Purpose

External intelligence improves decisions when the outside world has evidence the repo does not: current docs, real product patterns, user behavior, model quality signals, security findings, platform policy, dependency risk, app-store constraints, or market movement.

The rule:

> External tools provide evidence. They do not become authority by default.

## Operating Principles

- Start with the user problem and decision, not with a tool.
- Prefer official docs, primary sources, standards, and direct product evidence.
- Use the smallest tool set that materially changes the decision.
- Do not add overlapping tools unless each has a distinct job.
- Do not send customer, production, private media, credentials, secrets, or proprietary reference assets to a tool without approval.
- Record source, date, risk, cost, data touched, fallback, and removal path before promoting a tool.
- Tool outputs are hypotheses until verified by code, screens, tests, metrics, or founder-approved decisions.

## Intelligence Categories

| Category                    | Purpose                                                          | Default sources/tools                                                      | Promotion stance                                 |
| --------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| Current technical docs      | Avoid stale APIs and hallucinated implementation patterns        | Official docs, Context7, provider docs                                     | Core when stack depends on fast-moving libraries |
| Product/design patterns     | Learn how strong products solve similar flows                    | Mobbin, Figma files, app-store/web screenshots, competitor products        | Core for UX/UI audits; pattern-only              |
| Browser/QA evidence         | Prove what users actually see and can do                         | Playwright, Browser Use, gstack browse/qa, TesterArmy-style protocol       | Core for user-facing work                        |
| AI quality/evals            | Catch prompt/model regressions, unsafe output, fallback drift    | OpenAI Evals, Langfuse, Braintrust, promptfoo, Helicone, Vercel AI Gateway | Evaluate per project before install              |
| Product analytics           | Understand activation, retention, drop-off, replay, experiments  | PostHog, Amplitude, analytics warehouse, session replay                    | Choose one primary product analytics source      |
| Security/supply chain       | Catch vulnerabilities, secrets, malicious packages, license risk | CodeQL, Semgrep, Socket, Snyk, Gitleaks, TruffleHog, Dependabot            | Use layered checks; avoid noisy duplicates       |
| Workflow/job orchestration  | Move long-running work out of interactive requests               | Vercel Workflow/Queues, Inngest, Trigger.dev, BullMQ/Redis                 | Candidate when heavy jobs are launch-critical    |
| Ops/observability           | Understand errors, latency, cost, incidents, recovery            | Sentry, Vercel Observability, OpenTelemetry, provider dashboards           | Core for production/beta                         |
| Design-token tooling        | Keep design, code, web, and native surfaces in sync              | W3C Design Tokens, Style Dictionary, Tokens Studio, Figma variables        | Candidate when designer handoff/rebrand matures  |
| Mobile/app-store            | Future native/iOS QA and release readiness                       | Apple docs, TestFlight, fastlane, Maestro, Expo/RN docs when used          | Activate when native path is planned             |
| Business/context connectors | Capture operational context from the founder/team                | Linear, Notion, Slack, Gmail, Calendar, Drive                              | Approval required; not core by default           |

## Promotion Ladder

Use this ladder for any MCP, skill, plugin, SaaS, CLI, reference library, scanner, or automation:

| Status           | Meaning                                                       | Allowed use                                  |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `observed`       | Known from research, not installed or trusted                 | Mention as option only                       |
| `candidate`      | Fits a real project need, pending risk review                 | Compare and test locally with synthetic data |
| `approved-read`  | Can read approved local/preview data                          | Use with guardrails and evidence             |
| `approved-write` | Can mutate approved targets                                   | Requires explicit approval gate              |
| `core`           | Safe and valuable enough to be part of default workflow       | Auto-trigger only through narrow rules       |
| `quarantine`     | Installed/known but risky, duplicated, unclear, or misaligned | Do not use until reviewed                    |
| `deprecated`     | Replaced or unsafe                                            | Remove or ignore                             |

## Tool Intake Template

Every external tool candidate needs this record before promotion:

```md
Tool/source:
Category:
Problem it solves:
Decision it can change:
Source/maintainer:
Official docs/repo:
Current version/date:
Environment: local | preview | production
Read/write capability:
Data exposed:
Credentials/token storage:
Cost/pricing risk:
Privacy/legal/subprocessor impact:
Security/supply-chain risk:
Overlap with current tools:
Output trust level:
Guardrails:
Fallback/removal path:
Approval needed:
Evidence required before promotion:
Status:
```

## Mobbin Protocol

Mobbin is product/design intelligence, not a design copier.

Agents may visually inspect Mobbin screens, flows, and screenshot details during the active research/audit session. The restriction is on what becomes persistent project material: save transformed analysis, patterns, principles, and decisions; do not save raw screenshots, proprietary assets, exact layouts, animation timing, or copy into the repo unless rights are explicitly approved.

Use Mobbin for these surface families when relevant:

- acquisition, landing, waitlist, pricing, and trust;
- login, onboarding, account setup, permissions, and empty-first-run;
- dashboard/home, command/action surfaces, notifications, and next-best-action;
- creation/editor, upload/import, asset library, review, export, and publish;
- brand/profile/identity, reports, analytics, benchmarks, and insights;
- client/business workspaces, billing, settings, admin, support, and recovery;
- mobile navigation, bottom sheets, safe areas, input flows, and native-style states.

For every Mobbin use, record a transformed evidence note:

```md
Surface family:
Reference apps/screens searched:
What the agent inspected:
Principle learned:
Why it applies:
Project adaptation:
Do-not-copy boundary:
Evidence date:
Decision impacted:
```

Do not copy proprietary screenshots, layouts, assets, animation timing, or copy into the repo. If visual evidence is needed for human review, prefer Mobbin links, app/screen names, and transformed notes. Store raw screenshots only when license/privacy status and founder approval are explicit.

Auth note: `mobbin-mcp@latest` is not configured by default in Umbra. If a future UI research pass needs it, evaluate it through `tool-risk-review`, define local auth/check scripts first, and never paste raw cookies into chat, docs, commits, or artifacts.

## Deep Research And CEO Review Intake Protocol

Founder-provided deep research, CEO reviews, strategy chats, investor memos, market reports, external audits, and model-generated investigations are raw intelligence, not operating truth.

When a project receives a large research package:

1. Create an intake artifact before changing product/docs/code.
2. Name the input sources, date, author/runtime if known, and confidence level.
3. Split findings into: verified, useful hypothesis, contradiction, stale/unverified, rejected, and founder/CTO/legal decision needed.
4. Verify fast-moving or high-risk claims against official docs, primary sources, current repo evidence, or direct account/dashboard evidence.
5. Record what changes in the plan and what does not change.
6. Do not turn private founder data, confidential client context, legal conclusions, competitor screenshots, pricing claims, or investor-sensitive proof into public copy without approval.
7. Promote only durable conclusions into project profile, workflows, decision records, evals, docs, or implementation tasks.
8. Leave rejected/conflicting findings documented so future agents do not rediscover and adopt them accidentally.

Intake template:

```md
Research/intelligence package:
Date received:
Source/runtime:
Decision being challenged:
Verified claims:
Unverified/stale claims:
Contradictions with current project decisions:
Adopt now:
Defer:
Reject:
Founder/CTO/legal decisions:
Artifacts/docs/workflows to update:
What does not change:
Confidence:
```

## Recommended Tool Posture

### Keep Core Or Approved By Default

- Context7 or official docs for current library/API decisions.
- Playwright/browser tooling for screen-first QA and E2E.
- Mobbin is not configured by default in Umbra; evaluate it through `tool-risk-review` before use.
- GitHub, Sentry, Supabase, Vercel, Stripe, Figma only when the project actually uses them and permissions match the registry.

### Evaluate Next, Not Auto-Install

- AI observability/evals: Langfuse, Braintrust, promptfoo, OpenAI Evals, Helicone, Vercel AI Gateway.
- Product analytics/replay/experiments: PostHog or Amplitude; choose one primary system.
- Visual regression/design-system QA: Storybook plus Chromatic, or Playwright plus Argos/Chromatic.
- Security/supply chain: Semgrep, Socket, Snyk, Gitleaks, TruffleHog, CodeQL, Dependabot.
- Workflow/job orchestration: Vercel Workflow/Queues, Inngest, Trigger.dev, or BullMQ/Redis when heavy AI/scraping/render/media jobs must leave request paths.
- Design-token tooling: W3C Design Tokens, Style Dictionary, Tokens Studio, or Figma variables when designer handoff, rebrand, or multi-platform token sync becomes operational.
- Browser automation beyond Playwright: Browserbase/Stagehand or similar only if local Playwright/gstack evidence is insufficient.
- Mobile/native readiness: Maestro and fastlane when iOS/Android work becomes active.

### Quarantine Until A Specific Need Exists

- Broad UI/code generators that can override product taste or design-system rules.
- Unknown MCPs with broad filesystem/network access.
- Tools that require production credentials before they can prove value.
- Multiple vendors solving the same analytics/eval/security job without a clear owner.

## Research Output Pack

When this contract is used, the artifact should include:

- research date and question;
- internal evidence checked;
- external sources with links and credibility;
- consensus and contradictions;
- recommended tools/skills/agents to keep, add, evaluate, quarantine, or remove;
- data/security/cost/privacy impact;
- what changes in Agent OS, audit workflow, MCP registry, skill registry, or project bootstrap;
- what does not change;
- next approval gate.
