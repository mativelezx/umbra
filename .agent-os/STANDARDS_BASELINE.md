# Standards Baseline

> Last research pass: 2026-05-12.

This file records the external standards that informed Agent OS. It is not a legal/compliance certification; it is the practical baseline for how agents should work in this repo.

## Sources

| Area                  | Source                                                                                                                              | Applied in Agent OS                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Agent evaluation      | OpenAI Agent Evals and Trace Grading                                                                                                | `AGENT_EVALS.md`, eval cases, pass/warn/fail rubric                            |
| Agent building        | OpenAI practical guide to building agents and AgentKit docs                                                                         | `guided-intake`, orchestration, guardrails, evals, tool/risk gates             |
| Coding agents         | OpenAI Codex docs, agent internet access guidance, and OpenAI Docs MCP                                                              | runtime-agnostic coding-agent posture, network/tool risk, current docs         |
| Claude Code workflows | Anthropic Claude Code memory, common workflows, subagents, and Building Effective Agents                                            | project memory, plan/read-only exploration, subagent scoping, simple workflows |
| Deep research         | ChatGPT deep research docs and connector guidance                                                                                   | Strategic Context Research Brief, citations, source verification               |
| Human approval        | OpenAI Agents SDK human-in-the-loop patterns                                                                                        | `APPROVAL_GATES.md`, production/tool mutation gates                            |
| MCP safety            | Model Context Protocol Security Best Practices                                                                                      | `MCP_REGISTRY.md`, tool risk review, least privilege                           |
| Agentic AI security   | OWASP Top 10 for Agentic Applications 2026                                                                                          | `AI_RISK_REGISTER.md`, security/reliability gates                              |
| Skill security        | OWASP Agentic Skills Top 10                                                                                                         | `SKILL_REGISTRY.md`, core/reference/quarantine/deprecated statuses             |
| AI risk               | NIST AI RMF 1.0 and GenAI Profile                                                                                                   | `AI_RISK_REGISTER.md`, evidence and governance expectations                    |
| Secure SDLC           | NIST SSDF SP 800-218                                                                                                                | `SUPPLY_CHAIN_SECURITY.md`, release/build provenance                           |
| Supply chain          | SLSA and OpenSSF Scorecard                                                                                                          | dependency/MCP/skill provenance checks                                         |
| Production launch     | Deploy/framework production checklists; current profile uses Vercel/Next.js                                                         | `PRODUCTION_READINESS.md`, release evidence                                    |
| Accessibility         | WCAG 2.2                                                                                                                            | accessibility review, UI evidence                                              |
| Agentic QA            | TesterArmy public docs and YC profile                                                                                               | `QA_ARMY_PROTOCOL.md`, screen-first QA, PR exploration, monitors               |
| External intelligence | Context7, Mobbin, Playwright MCP, MCP security docs, Storybook/Chromatic, product analytics/eval/security/mobile tooling docs       | `EXTERNAL_INTELLIGENCE_STACK.md`, MCP/skill registries, audit/bootstrap gates  |
| System integrity      | NIST CSF 2.0, NIST SSDF, SLSA, OpenSSF Scorecard, OpenAI/Anthropic agent runtime docs, DORA, Google SRE incident guidance           | `SYSTEM_INTEGRITY_CONTRACT.md`, bootstrap/audit governance and enforcement     |
| AI eval/observability | Langfuse, Braintrust, promptfoo, OpenAI Evals, Vercel AI Gateway                                                                    | AI quality, fallback, cost, prompt regression, red-team candidates             |
| Product analytics     | Amplitude and PostHog product analytics/session replay/event taxonomy docs                                                          | `DATA_ANALYTICS_CONTRACT.md`, beta metrics, event taxonomy gates               |
| Visual regression     | Storybook and Chromatic docs                                                                                                        | Design-system QA, component state coverage, visual regression gates            |
| Security scanning     | CodeQL, Semgrep, Socket, Snyk, Gitleaks, TruffleHog                                                                                 | `SUPPLY_CHAIN_SECURITY.md`, tool candidates, release checks                    |
| Workflow/jobs         | Vercel Queues/Workflow, Inngest, Trigger.dev docs                                                                                   | `SCALE_AND_RESILIENCE_CONTRACT.md`, async/job tooling candidates               |
| Design tokens         | W3C Design Tokens Community Group, Style Dictionary, Tokens Studio                                                                  | `DESIGN_SYSTEM_CONTRACT.md`, token handoff/rebrand candidates                  |
| Product language      | NN/g menu/IA guidance, Material Design writing, Apple HIG labels, Google PAIR feedback/control, creator-economy terminology sources | `PRODUCT_LANGUAGE_CONTRACT.md`, UX/copy/naming/bootstrap gates                 |
| Mobile/app-store      | Apple App Store Review Guidelines, TestFlight, Maestro, fastlane                                                                    | `PLATFORM_STRATEGY_CONTRACT.md`, future iOS QA/release gates                   |
| AI governance         | NIST AI RMF, ISO/IEC 42001, EU AI Act GPAI obligations                                                                              | AI risk, documentation, transparency, lifecycle governance                     |
| Privacy/compliance    | GDPR/European Commission and Argentina AAIP/Ley 25.326                                                                              | `FEATURE_EXECUTION_CONTRACT.md`, legal/compliance triage                       |
| App security          | OWASP ASVS 5.0                                                                                                                      | API/security/release gates                                                     |
| Cyber governance      | NIST Cybersecurity Framework 2.0                                                                                                    | `SOLO_FOUNDER_CONTROL_PLANE.md`, recovery, vendor, incident gates              |
| Privacy governance    | NIST Privacy Framework                                                                                                              | data purpose, consent, processing, communication, protection gates             |
| Secure maturity       | OWASP SAMM                                                                                                                          | governance, design, implementation, verification, operations lens              |
| Delivery health       | DORA software delivery performance metrics                                                                                          | founder-friendly lead time, deploy, failure, recovery metrics                  |
| Incident response     | Google SRE Incident Management Guide                                                                                                | runbooks, alerts, incident roles, communication, learning loop                 |
| Founder cadence       | YC Essential Startup Advice and Startup School                                                                                      | build/talk-to-users loop, 90/10 solutions, focus guardrails                    |
| IP/content rights     | U.S. Copyright Office AI guidance                                                                                                   | AI-generated/user media ownership and disclosure risk checks                   |
| OSS licenses          | Google Open Source and GitHub license references                                                                                    | third-party code/asset/license watchlist                                       |

## Review Cadence

- Re-check when changing AI models, MCPs, deploy platform, auth, payments, analytics, or agent runtime.
- Re-check quarterly if this repo becomes a template for multiple projects.
- Update this file with the date and the decision impact, not just a new list of links.

## Reference Links

- OpenAI Agent Evals: https://platform.openai.com/docs/guides/agent-evals
- OpenAI Practical Guide to Building Agents: https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- OpenAI Agents / AgentKit: https://platform.openai.com/docs/guides/agents
- OpenAI Codex cloud: https://platform.openai.com/docs/codex
- OpenAI Codex agent internet access: https://platform.openai.com/docs/codex/agent-network
- OpenAI Docs MCP: https://platform.openai.com/docs/docs-mcp
- OpenAI Deep Research in ChatGPT: https://help.openai.com/articles/10500283
- OpenAI Introducing Deep Research: https://openai.com/index/introducing-deep-research/
- OpenAI Trace Grading: https://platform.openai.com/docs/guides/trace-grading
- OpenAI Agents SDK human-in-the-loop: https://openai.github.io/openai-agents-js/guides/human-in-the-loop/
- Anthropic Building Effective Agents: https://www.anthropic.com/research/building-effective-agents
- Anthropic Claude Code common workflows: https://docs.anthropic.com/en/docs/claude-code/tutorials
- Anthropic Claude Code memory: https://docs.anthropic.com/en/docs/claude-code/memory
- Claude Code subagents: https://docs.anthropic.com/en/docs/claude-code/sub-agents
- Claude Code hooks: https://docs.anthropic.com/en/docs/claude-code/hooks
- MCP Security Best Practices: https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices
- OWASP Top 10 for Agentic Applications 2026: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- OWASP Agentic Skills Top 10: https://owasp.org/www-project-agentic-skills-top-10/
- NIST AI RMF: https://www.nist.gov/itl/ai-risk-management-framework
- NIST AI RMF GenAI Profile: https://www.nist.gov/itl/ai-risk-management-framework/generative-artificial-intelligence
- ISO/IEC 42001: https://www.iso.org/standard/42001
- EU AI Act GPAI obligations: https://digital-strategy.ec.europa.eu/en/factpages/general-purpose-ai-obligations-under-ai-act
- NIST SSDF SP 800-218: https://csrc.nist.gov/publications/detail/sp/800-218/final
- SLSA: https://slsa.dev/
- OpenSSF Scorecard: https://openssf.org/scorecard/
- Vercel Production Checklist: https://vercel.com/docs/production-checklist
- Next.js Production Checklist: https://nextjs.org/docs/app/guides/production-checklist
- WCAG 2.2: https://www.w3.org/TR/wcag/
- TesterArmy: https://tester.army/
- TesterArmy docs: https://docs.tester.army/
- TesterArmy PR testing: https://docs.tester.army/run/pull-request-testing
- TesterArmy production monitoring: https://docs.tester.army/run/production-monitoring
- TesterArmy YC profile: https://www.ycombinator.com/companies/testerarmy
- Context7 docs: https://context7.com/docs
- Mobbin: https://mobbin.com/
- Mobbin MCP package: https://www.npmjs.com/package/mobbin-mcp
- Playwright MCP: https://playwright.dev/mcp/introduction
- MCP security best practices: https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices
- Langfuse docs: https://langfuse.com/docs
- Braintrust evals: https://www.braintrust.dev/docs/evaluate
- promptfoo red teaming: https://www.promptfoo.dev/docs/guides/llm-redteaming/
- OpenAI Evals: https://platform.openai.com/docs/guides/evals
- Vercel AI Gateway: https://vercel.com/docs/ai-gateway
- Amplitude docs: https://amplitude.com/docs
- PostHog docs: https://posthog.com/docs
- Storybook testing docs: https://storybook.js.org/docs/writing-tests
- Chromatic visual testing: https://www.chromatic.com/docs/visual/
- Argos Playwright visual testing: https://argos-ci.com/playwright
- Playwright accessibility testing with axe: https://playwright.dev/docs/accessibility-testing
- CodeQL code scanning: https://docs.github.com/en/code-security/concepts/code-scanning/codeql/about-code-scanning-with-codeql
- Semgrep docs: https://semgrep.dev/docs/
- Socket docs: https://docs.socket.dev/
- Snyk Open Source CLI: https://docs.snyk.io/snyk-cli/scan-and-maintain-projects-using-the-cli/snyk-cli-for-open-source
- Gitleaks: https://github.com/gitleaks/gitleaks
- TruffleHog docs: https://docs.trufflesecurity.com/
- Vercel Queues: https://vercel.com/docs/queues
- Vercel Workflow: https://vercel.com/workflow
- Inngest docs: https://www.inngest.com/docs/
- Trigger.dev docs: https://trigger.dev/docs
- W3C Design Tokens Community Group: https://www.w3.org/community/design-tokens/
- Style Dictionary design tokens: https://styledictionary.com/info/tokens/
- Tokens Studio: https://tokens.studio/
- NN/g Menu Design Checklist: https://media.nngroup.com/media/articles/attachments/PDF_Menu-Design-Checklist.pdf
- Material Design Writing: https://m1.material.io/style/writing.html
- Apple Human Interface Guidelines Labels: https://developer.apple.com/design/human-interface-guidelines/labels
- Google PAIR Feedback + Control: https://pair.withgoogle.com/guidebook-v2/chapters/feedback-controls/
- Maestro supported platforms: https://docs.maestro.dev/get-started/supported-platform
- fastlane pilot/TestFlight: https://docs.fastlane.tools/actions/pilot/
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- European Commission GDPR principles: https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr_en
- European Commission GDPR information duties: https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr/what-information-must-be-given-individuals-whose-data-collected_en
- European Commission personal data explanation: https://commission.europa.eu/law/law-topic/data-protection/reform/what-does-general-data-protection-regulation-gdpr-govern_en
- Argentina AAIP normativa/Ley 25.326: https://www.argentina.gob.ar/aaip/buscador-normativa
- Argentina datos personales: https://www.argentina.gob.ar/node/159936
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- NIST Cybersecurity Framework 2.0: https://www.nist.gov/cyberframework
- NIST Privacy Framework: https://www.nist.gov/privacy-framework/privacy-framework
- NIST Privacy Framework getting started: https://www.nist.gov/privacy-framework/getting-started-0
- OWASP SAMM model: https://owaspsamm.org/model/
- DORA software delivery performance metrics: https://dora.dev/guides/dora-metrics/
- Google SRE Incident Management Guide: https://sre.google/resources/practices-and-processes/incident-management-guide/
- YC Essential Startup Advice: https://www.ycombinator.com/blog/ycs-essential-startup-advice/
- YC Startup School videos: https://www.ycombinator.com/blog/startup-school-videos
- U.S. Copyright Office AI guidance: https://www.copyright.gov/ai/ai_policy_guidance.pdf
- Google Open Source license reference: https://opensource.google/documentation/reference/thirdparty/licenses
- GitHub license API reference: https://docs.github.com/en/rest/licenses/licenses

## Practical Rule

External standards inform the gate, but the repo remains the source of truth. If a standard suggests a control that conflicts with project constraints, document the tradeoff and ask for founder approval before weakening safety.
