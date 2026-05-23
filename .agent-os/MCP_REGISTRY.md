# MCP Registry

`.mcp.example.json` is the portable template for approved/default MCPs. `.mcp.json` is local, ignored, and may contain real credentials or quarantined experiments. Quarantined MCPs should not be copied to new projects until promoted.

When copying Agent OS, treat this file as a project-specific registry. Keep only tools that exist in the new project and match its actual permissions.

Use `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` before promoting a new MCP/tool/source. MCPs are one category of external intelligence, not the whole stack.

## Statuses

- `official`: provider-owned or provider-documented.
- `trusted-community`: community MCP with clear source and limited permissions.
- `quarantine`: installed locally but not approved for default use.
- `disabled`: do not use until reviewed.

## MCPs

| MCP             | Status                   | Use                                                        | Risk                                                                                                                  | Guardrail                                                                                                                                    |
| --------------- | ------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `browser-tools` | trusted-community        | Local DOM, console, network inspection                     | Can expose local app/session details                                                                                  | Use only on local/dev targets                                                                                                                |
| `context7`      | official/community-known | Current library docs                                       | May return irrelevant docs if library id is wrong                                                                     | Prefer official docs and verify version                                                                                                      |
| `mobbin`        | candidate                | Real product UI/reference patterns                         | Design over-copying, unofficial MCP, reverse-engineered API, proprietary screenshots, account cookie/session exposure | Not configured by default in Umbra; evaluate through tool-risk review before use                                                            |
| `playwright`    | official                 | Browser automation and E2E verification                    | Can interact with authenticated sessions                                                                              | Use local/preview targets and avoid destructive actions                                                                                      |
| `supabase`      | official                 | Full Supabase project inspection and controlled operations | Data exposure and write risk                                                                                          | Project-scoped full MCP; read by default in audits; DB/storage/functions/branching mutations require explicit founder approval               |
| `github`        | official                 | PR/issues/CI context                                       | Repo mutation if write-enabled                                                                                        | Read first; write only after approval                                                                                                        |
| `vercel`        | official                 | Deployments, project config, build logs                    | Deploy/project mutation, protected logs                                                                               | Read first; deploy/mutate only after approval                                                                                                |
| `sentry`        | official                 | Production errors and traces                               | May expose PII or secrets in logs                                                                                     | Summarize, do not paste sensitive payloads                                                                                                   |
| `figma`         | community/vendor         | Design inspection when a file is present                   | API token exposure, design asset leakage                                                                              | Optional; use env var token and only project-relevant files                                                                                  |
| `lemonsqueezy`  | no-default-mcp           | Billing truth source                                       | Billing/customer data exposure                                                                                        | Use app/API/docs/manual export; no default MCP currently configured                                                                          |
| `stripe`        | disabled                 | Legacy billing/dev checkout inspection                     | Wrong billing provider for the current project, money/customer data                                                   | Do not configure unless the project explicitly returns to Stripe                                                                             |

## External Intelligence Candidates

These are not approved MCP defaults. They are known tool families to evaluate through `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` and `tool-risk-review` when the project has a real need.

| Family                       | Examples                                     | Why it matters                                   | Default stance                          |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| AI observability/evals       | Langfuse, Braintrust, Helicone, OpenAI Evals | Prompt/model quality, cost, latency, regressions | Candidate; choose by job                |
| AI red-team                  | promptfoo                                    | Prompt injection, jailbreak, PII leak testing    | Candidate for high-risk AI flows        |
| AI gateway/provider routing  | Vercel AI Gateway                            | Budget, routing, fallback, provider resilience   | Candidate if provider-agnostic AI grows |
| Product analytics/replay     | PostHog, Amplitude                           | Activation, drop-off, replay, experiments        | Choose one primary system               |
| Visual regression/UI library | Storybook, Chromatic, Argos                  | Component states, visual drift, UI regressions   | Candidate after component audit         |
| Supply-chain/security        | CodeQL, Semgrep, Socket, Snyk, Gitleaks      | SAST, dependency risk, secrets, license exposure | Layered checks; avoid noisy duplicates  |
| Design-token tooling         | W3C tokens, Style Dictionary, Tokens Studio  | Designer handoff, rebrand, web/native token sync | Candidate after design-system audit     |
| Browser agents/cloud QA      | Browserbase/Stagehand                        | Hard browser automation beyond local Playwright  | Candidate only if local QA is blocked   |
| Mobile/app-store QA          | Maestro, fastlane, Apple/TestFlight tools    | Future native/iOS testing and release gates      | Activate when native path is active     |

## Approval Required

Ask before:

- Adding a new MCP.
- Enabling write access.
- Passing user/customer data to an MCP.
- Connecting production accounts.
- Using billing, auth, DB, or deploy MCPs for mutation.
- Passing Mobbin screenshots, proprietary reference assets, or raw account cookies into chat or repo files.

## Review Checklist

For every MCP:

- Source and maintainer.
- Auth mechanism and token storage.
- Read/write capabilities.
- Data exposed to the tool.
- Whether output can be treated as trusted.
- Local vs production usage.
- Removal/rollback path.
