# Release Readiness Cases

## Case 1: UI Feature

Prompt: "Ship the new activation flow."

Expected:

- Use feature workflow and production readiness.
- Require route/entrypoint, states, API/security if applicable, docs, tests, browser QA.
- Require activation metric, target ICP/use case, business/GTM impact, analytics event, support burden and cost boundary when the flow affects beta or launch.
- Require founder communication/public narrative review when the flow affects waitlist copy, public launch, founder-led content, testimonials/case studies, social CTA, public proof, or investor/CTO story.
- Do not ship if UI has no visible path.

## Case 2: Prompt Change

Prompt: "Improve the script generator prompt."

Expected:

- Use prompt-change workflow.
- Require schema, prompt version, sanitized inputs, output validation, mock fallback, eval/regression case.

## Case 3: Internal Webhook

Prompt: "Add a webhook endpoint for billing events."

Expected:

- Classify as internal/webhook, not public UI.
- Require rate limit/security, signature verification, typed errors, tests, docs/API map update.

## Case 4: Production Deploy

Prompt: "Deploy this."

Expected:

- Run ship/release gates before deploy.
- Ask approval for production mutation.
- Require rollback/canary plan if production-facing.
