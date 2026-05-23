# Deep Research Prompt Library

Use these prompts during `guided-intake` Phase -1 when a project or strategic refactor needs deep context before build decisions. They are runtime-agnostic: use them in ChatGPT Deep Research, Claude, Codex, or another approved research runtime.

Do not paste secrets, credentials, customer data, private media, production data, or proprietary assets into external tools unless the founder explicitly approves that data exposure.

## Base Block

Paste this before every prompt:

```md
I am researching a product or product refactor for an Agent OS that must work across Claude, ChatGPT/Codex, browser agents, security agents, and future models.

Rules:

- Use current sources and cite links.
- Prefer official docs, primary sources, direct product evidence, standards, and provider docs.
- Separate evidence, inference, hypothesis, and opinion.
- Mark contradictions and unsupported claims.
- Do not treat your output as canonical truth. It will be verified against repo evidence and founder decisions before entering the operating system.
- Do not copy proprietary screens, copy, assets, or private data.
- End with: What changes, What does not change, Founder decisions, Recommended experiments, Risks.
- For customer evidence, separate customer discovery, design partner signals, sales discovery, dogfooding, analytics, founder belief, and external research.
```

## 1. Category And Market

```md
Research the category and market for this product.

Idea:
[describe idea]

Initial user:
[user]

Problem:
[problem]

Initial market/country:
[market]

Analyze:

- Existing or emerging category names.
- Current alternatives and manual workflows.
- User expectations shaped by current products.
- Market or platform trends that change the opportunity.
- Claims that would be exaggerated, risky, or unsupported.
- Credible positioning options.
- What evidence would validate or weaken this category choice.
```

## 2. User, Jobs, Pain, And Activation

```md
Research the target user and job-to-be-done.

Product/idea:
[idea]

Tentative ICP:
[ICP]

Analyze:

- Main jobs-to-be-done.
- Expensive, frequent, urgent, or emotionally intense pains.
- Current workarounds and switching costs.
- First value / activation event.
- Objections, anxieties, and trust barriers.
- Anti-ICP to exclude.
- Interview, beta, or usage evidence we should collect.
- Design partner, sales discovery, or dogfood scenarios that would validate the pain fastest.
```

## 2B. Customer Discovery, Design Partners, And Sales Discovery

```md
Research the customer discovery plan for this product.

Product/idea:
[idea]

Tentative ICP:
[ICP]

Buyer/user split:
[buyer/user]

Market:
[market]

Analyze:

- Which customer segments should be interviewed first.
- Which anti-ICP should be excluded.
- Which recent behaviors and workflows to ask about.
- Which design partner profile would create useful learning without becoming custom consulting.
- Which sales discovery questions reveal urgency, budget, procurement, objections, and paid pilot fit.
- Signals that are weak evidence: compliments, waitlist, social attention, vanity usage, or unqualified interest.
- What would make us narrow, reposition, pause, or kill the idea.
- A first 5-interview plan and first 3 sales/design-partner discovery questions.
```

## 2C. First Wedge Experiment

```md
Design the smallest first wedge experiment for this product.

Product:
[idea]

ICP:
[ICP]

Pain:
[pain]

Possible channel:
[channel]

Constraints:
[time/budget/support/data/security]

Analyze:

- The narrow offer.
- The target segment and anti-segment.
- The activation event that represents real value.
- The minimum product path and manual founder steps.
- Success, quality, stop, and continue metrics.
- Trust, privacy, security, support, and public-claim constraints.
- What evidence would justify building the next slice.
- What evidence would force a narrower ICP, different offer, or no-build decision.
```

## 3. Competitors, Substitutes, And References

```md
Research competitors, substitutes, and reference products.

Idea:
[idea]

Tentative category:
[category]

User:
[user]

Analyze:

- Direct competitors.
- Indirect substitutes and manual workflows.
- Adjacent products with useful UX/GTM/pricing patterns.
- Real differentiators vs cosmetic differentiators.
- Visible pricing/packaging where available.
- Principles worth adapting.
- What not to copy: screens, copy, assets, positioning, or persona.
- Positioning gaps.
```

## 4. UX, Flow, And Product Surface

```md
Research UX and product patterns for this kind of tool.

Product:
[idea]

Primary user:
[user]

First use case:
[use case]

Analyze:

- Onboarding and first-run experience.
- Activation flow.
- Dashboard/home or command surface.
- Empty, loading, error, degraded, and recovery states.
- Trust UX for AI, data, source freshness, uncertainty, and user review.
- Moments that need control, undo, approval, or recovery.
- Accessibility and mobile/responsive concerns.
- UX metrics and event taxonomy to track.
```

## 5. Technical Architecture

```md
Research technical architecture options.

Product:
[idea]

Initial platform:
[web/mobile/API/etc.]

Data involved:
[data]

AI involved:
[yes/no/type]

Expected initial scale:
[scale]

Analyze:

- Recommended stack options and tradeoffs.
- Database/storage options.
- Auth/session model.
- Payments if relevant.
- Background jobs, queues, workflows, or scheduled work.
- Analytics, observability, and error monitoring.
- Testing/E2E/browser QA.
- Vendor lock-in and portability risks.
- Minimal architecture that avoids immediate rework.
```

## 6. AI, Evals, And Agent Workflows

```md
Research the AI and agent workflow design.

Product:
[idea]

AI tasks:
[tasks]

Possible tools/APIs:
[tools/APIs]

Analyze:

- Which workflows should be single-agent, multi-agent, deterministic code, or human-in-the-loop.
- Tool calls that need approval.
- Guardrails for relevance, safety, privacy, prompt injection, data leakage, and tool misuse.
- Eval cases, datasets, trace grading, and regression checks.
- Evidence/traces to preserve for handoff.
- Hallucination and source/freshness risks.
- Fallback and degraded modes when AI fails.
- Lightweight UX, security/privacy, and founder trust gates before beta/design-partner use.
- Dogfood scenarios that should run before external users see the workflow.
```

## 6B. Dogfooding AI Or Agentic Workflows

```md
Design a dogfooding plan for an AI or agentic product workflow.

Product:
[idea]

Workflow:
[workflow]

User/persona:
[persona]

Data mode:
[mock/fixture/local/staging/beta/production]

AI/agent actions:
[actions]

Analyze:

- The most realistic internal scenario the founder/team can run.
- Input data needed and what must not be exposed.
- Expected useful output and quality bar.
- Human approval points.
- Recovery path when AI/tooling fails.
- UX frictions likely to appear.
- Security/privacy/prompt-injection/tool-misuse risks.
- Founder trust and support burden risks.
- Evidence to capture before deciding ship, fix-first, narrow, research, or block.
```

## 7. Security, Privacy, And Data

```md
Research security, privacy, and compliance risks.

Product:
[idea]

Users:
[users]

Data:
[data]

Jurisdictions:
[countries/regions]

Probable vendors/tools:
[vendors]

Analyze:

- PII and sensitive data categories.
- Access control and permission model.
- Retention, deletion, export, and recovery needs.
- Provider/subprocessor risks.
- Production vs staging vs mock/demo boundaries.
- Prompt injection, tool-use, MCP, and external content risks.
- Approval gates before touching real data.
- Initial threat model.
```

## 8. Business Model, Pricing, And GTM

```md
Research business model and go-to-market.

Product:
[idea]

ICP:
[ICP]

Initial market:
[market]

Founder-led sales/content:
[yes/no/context]

Analyze:

- Initial wedge.
- Pricing and packaging comparables.
- Free trial, waitlist, beta, or paid pilot stance.
- Activation and retention loops.
- Credible initial channels.
- Support and onboarding burden.
- Cost/margin assumptions.
- Signals that are not real traction.
- Founder approvals needed before public claims or pricing.
```

## 9. Founder Narrative And Distribution

```md
Research founder-led narrative and distribution.

Product:
[idea]

Founder context:
[brief real context]

ICP:
[ICP]

Possible channels:
[LinkedIn/X/Instagram/YouTube/newsletter/community/etc.]

Analyze:

- Role of founder brand vs product brand.
- Content pillars.
- Safe claims vs risky claims.
- Public proof needed.
- Launch CTA.
- Feedback loop from content to product, UX, support, and roadmap.
- Mechanisms to study from reference founders or creators.
- Do-not-copy boundaries: persona, controversy, cadence, phrasing, screenshots, vulnerability style, or aesthetics.
```

## 10. Synthesis For Agent OS

Use this after running multiple research prompts:

```md
I will paste several research reports about a product. Synthesize them for a runtime-agnostic Agent OS.

Do not add new claims without evidence.

Separate:

- Verified.
- Useful hypothesis.
- Contradiction.
- Unsupported claim.
- Founder decision.
- Recommended experiment.
- Risk.

Output:

Project thesis:
Category:
Primary user:
Primary problem:
Mission tests:
Appetite/time budget:
Activation hypothesis:
ICP:
Anti-ICP:
Product surface:
Platform/channel:
Data mode:
Architecture direction:
AI/agent workflow:
Security/privacy gates:
Business/GTM direction:
Founder communication direction:
Design/product language direction:
Customer discovery plan:
Design partner plan:
Sales discovery plan:
Dogfood gate:
First wedge experiment:
Research synthesis scorecard:
Assumptions map:
Decision lifecycle:
Project Alignment Packet lifecycle:
First build slice:
Evidence gates:
Approval gates:
Ready for build: yes | yes-with-accepted-risks | no
```

## 11. Research Synthesis Scorecard

Use this after multiple reports, interviews, dogfood notes, sales calls, or research sources:

```md
I will paste mixed evidence for a product: research reports, founder notes, interview notes, sales discovery, design-partner signals, dogfood notes, analytics, and/or repo evidence.

Synthesize without inventing new facts.

Score each 0-3:

- ICP clarity.
- Pain urgency.
- Workflow frequency.
- Current alternative pain.
- Switching willingness.
- Activation clarity.
- Trust/security readiness.
- Buyer/user alignment.
- Willingness to pay.
- Founder support load.
- Evidence quality.

Then output:

- Total score.
- Strongest evidence.
- Weakest evidence.
- Contradictions.
- Unsupported claims.
- Decision: research more | run wedge | build smallest slice | promote assumption | narrow/reposition/kill.
- Recommended first wedge or next experiment.
- Founder approvals needed.
- Trusted-until date or expiry condition.
- Project Alignment Packet status: draft | provisional | current | superseded | historical.
```

## Recommended Sequence

For a new product, run:

1. Category And Market
2. User, Jobs, Pain, And Activation
3. Customer Discovery, Design Partners, And Sales Discovery
4. First Wedge Experiment
5. Competitors, Substitutes, And References
6. Technical Architecture
7. AI, Evals, And Agent Workflows
8. Business Model, Pricing, And GTM
9. Synthesis For Agent OS
10. Research Synthesis Scorecard

For AI, agentic, automation, trust-sensitive, or data-sensitive products, also run UX, Security/Privacy, Founder Narrative, and Dogfooding as lightweight gates before beta/design-partner/public use. For lower-risk products, run them only when those areas are launch-critical or underdefined.

For a refactor, run:

1. User, Jobs, Pain, And Activation
2. UX, Flow, And Product Surface
3. Technical Architecture
4. AI, Evals, And Agent Workflows if AI/agents are involved
5. Security, Privacy, And Data if data/tooling/production changes
6. Customer Discovery, Design Partners, And Sales Discovery if user/problem/ICP evidence is stale or disputed
7. Dogfooding AI Or Agentic Workflows if the workflow can be simulated internally
8. Synthesis For Agent OS
9. Research Synthesis Scorecard when evidence from multiple sources conflicts
