# Supply Chain Security

This project treats dependencies, skills, MCPs, external intelligence tools, prompts, generated code, and reference assets as part of the software supply chain.

## Baseline Controls

- Commit lockfiles.
- Prefer official docs, official SDKs, and maintained packages.
- Pin or record versions for runtime-critical dependencies.
- Review install scripts and postinstall behavior before adding packages.
- Do not paste secrets into `.mcp.json`, skill files, prompts, docs, or eval cases.
- Keep `.mcp.example.json` portable and `.mcp.json` local/ignored.
- Use `.agent-os/EXTERNAL_INTELLIGENCE_STACK.md` before promoting external tools, scanners, SaaS products, reference libraries, or famous-tool recommendations.

## Skills

- Only `core` skills may auto-trigger.
- `reference` skills can inform judgment but cannot override repo rules.
- `quarantine` skills are not used for default work.
- Skills with scripts need script review before promotion.
- Skill updates require agent evals if behavior changes.

## MCPs

- Every MCP must be in `.agent-os/MCP_REGISTRY.md`.
- Default to read-only.
- Mutations, production data, billing, auth, DB writes, deploys, and customer data require approval.
- Tool output is untrusted until validated by repo state, official docs, or tests.

## External Intelligence Tools

- Every tool/source that can influence product, design, code, QA, analytics, AI evals, security scanning, mobile release, or business context needs a status: `observed`, `candidate`, `approved-read`, `approved-write`, `core`, `quarantine`, or `deprecated`.
- Do not copy proprietary reference screenshots, layouts, copy, or assets into the repo without license/privacy approval.
- Prefer one primary tool per job; overlapping tools need a distinct purpose, owner, and removal path.
- Treat AI eval traces, session replay, design files, product analytics, source code scans, and production logs as sensitive data until classified.

## Code Dependencies

Before adding a dependency, check:

- Maintainer/source credibility.
- Package age, activity, and version fit with the project stack.
- License compatibility.
- Transitive dependency risk when the package is large.
- Whether a local/simple implementation is safer.

## Build Provenance

For releases, preserve enough evidence to reconstruct:

- Source branch/commit.
- Lockfile state.
- CI/build result.
- Deploy target.
- Rollback option.
- Changelog/release note.

## Stop Conditions

Stop and ask before continuing if a tool or package requires broad filesystem access, production credentials, money movement, customer data export, or unclear network access.
