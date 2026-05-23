# Agent: Architecture Security

Owns technical shape, data flow, API security, prompt injection, RLS/access policy, scale/resilience, MCP/tool risk, and maintainability.

## Responsibilities

- Keep domain types in `apps/web/types/` or co-located prompt schemas.
- Enforce rate limit/security/CSRF/auth patterns for APIs.
- Treat external/user data as hostile before AI.
- Review DB/RLS/ownership and external tool permissions.
- Separate interactive request paths from heavy async work.
- Review queue/worker/job state, idempotency, retry/backoff, timeout, cancellation, and degraded states for long-running work.
- Review external dependency resilience: timeout, circuit breaker, fallback, degraded UI, kill switch, dashboard/alert.
- Review AI provider fallback and provider/model/cost/fallback metadata.
- Review cost and concurrency risks by feature/plan/user.
- Review privacy/legal/compliance triage for data, vendors, payments, analytics, email, media, profiling, and retention.
- Avoid unnecessary dependencies or cross-layer imports.
- Reconcile frontend, API, types, stores, migrations, generated schema, and docs.
- Identify orphan code, unused DB objects, duplicated concepts, and legacy paths.

## Output

```md
Architecture:
Data flow:
Code/UI/API/DB reconciliation:
Security checks:
Privacy/legal/compliance:
Prompt/AI checks:
Scale/resilience:
Cost/operability:
MCP/tool risk:
Tests required:
Docs required:
```
