# Umbra — Observability & Operations

> Structured logs, metrics, alerts, dashboards, and runbooks.

## Philosophy

Observability is scope, not afterthought. Every new codepath emits:
- A **log** (entry + exit)
- A **metric** where relevant (rate, latency, cost)
- A **trace ID** to correlate across requests

Observability is ALSO bounded by privacy. Crisis event details are hashed,
not stored plaintext. User IDs are hashed in audit trails.

## Logging

### Format

All logs are structured JSON to stdout (Vercel collects automatically):

```ts
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info' | 'warn' | 'error',
  route: '/api/chat',
  user_hash: computeHash('crisis', userId),   // never raw user_id
  conversation_id: conversationId,            // okay — not identifying
  event: 'chat_message_received',
  duration_ms: null,                          // filled on exit
  cost_usd_cents: null,                       // filled on exit
  model: process.env.ANTHROPIC_MODEL_ID,
  trace_id: crypto.randomUUID(),              // per request
  ...details,
}));
```

### What gets logged

**Entry** (every API route):
- `event: '{route}_entry'`
- timestamp, user_hash, trace_id

**Exit** (every API route):
- `event: '{route}_exit'`
- `duration_ms`
- `cost_usd_cents` (if Claude was called)
- `input_tokens`, `output_tokens`
- `status_code`

**Errors** (caught by withErrorHandler):
- `level: 'error'`
- `error_class: 'RateLimitError' | 'CrisisDetected' | ...`
- `error_message`
- full stack trace (redact secrets)

**Crisis events** (in addition to `crisis_events` table):
- `event: 'crisis_detected'`
- `severity: 'low' | 'med' | 'high' | 'classifier_error' | 'sampling'`
- `user_hash`, `regex_hits`, `classifier_response`
- NEVER the raw message

**Budget events**:
- `event: 'budget_warning'` when global spend > 70% of cap
- `event: 'budget_exceeded'` when cap hit
- `daily_spend_usd`, `cap_usd`

### What NEVER gets logged

- Raw user_id (always hash with CRISIS_PEPPER for logs)
- Raw chat messages (hash only)
- Raw user introspective text
- API keys (verify by grep on log output)
- IP addresses plaintext (hash with CONSENT_IP_PEPPER)
- Email addresses (unless user-facing error requires it)

### Log retention

Vercel default: 1 day on Hobby, 30 days on Pro. For TFG purposes, 1 day is
sufficient. Critical events are ALSO persisted to database tables (`crisis_events`,
`rate_limits`) for longer retention.

## Metrics

### Daily metrics (aggregated from `rate_limits`)

```sql
-- Daily usage by user
SELECT
  user_id,
  day,
  input_tokens,
  output_tokens,
  cost_usd_cents,
  cost_usd_cents / 100.0 AS cost_usd
FROM public.rate_limits
WHERE day = CURRENT_DATE;

-- Global daily burn
SELECT
  day,
  SUM(input_tokens + output_tokens) AS total_tokens,
  SUM(cost_usd_cents) / 100.0 AS total_cost_usd,
  COUNT(DISTINCT user_id) AS active_users
FROM public.rate_limits
GROUP BY day
ORDER BY day DESC;

-- Crisis event trends
SELECT
  DATE_TRUNC('day', created_at) AS day,
  severity,
  COUNT(*) AS events
FROM public.crisis_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY day, severity
ORDER BY day DESC;
```

### Vercel Analytics

- Free tier covers: page views, Core Web Vitals, top pages, top referrers
- Custom events (TODO Phase 7): track analyze completion, chat message count, PDF export downloads
- Privacy-respecting: no cross-site tracking

### Supabase Dashboard

- Database size
- Query performance (slow query log)
- Connection count
- Auth events (signup, login, failed attempts)

## Alerts (Phase 7 TODO)

### Critical
- **Crisis events high severity count > 5/day** → manual review email
  - SQL: `SELECT COUNT(*) FROM crisis_events WHERE severity='high' AND created_at > CURRENT_DATE;`
  - Action: review 30-day trend, check for patterns
- **Classifier error count > 10/day** → investigate classifier or Claude API
  - Indicates fail-closed is firing frequently
- **Global daily budget > 80%** → warn developer
- **Global daily budget > 100%** → circuit breaker trips (automatic), notify developer

### Warning
- **API error rate > 5% over 5 min** → check Vercel logs
- **Anthropic 429 rate at user-level** → check if single user is spiking
- **Supabase query time p99 > 500ms** → investigate index
- **Storage usage > 80% of free tier** → plan for upgrade or cleanup

### Informational
- **New registration** (daily digest)
- **Successful analyses** (weekly digest)
- **Métricas semanales del módulo analítico** — si MSE/R²/r drift por dimensión

### Alert delivery

For TFG scale: email from a dedicated address to developer's inbox.
No PagerDuty, no Slack integration. TFG has no on-call.

Email service: Resend (already integrated for delete magic links) or Supabase
Edge Functions with cron.

## Dashboards

### Developer dashboard (Supabase SQL Editor)

Saved queries:
1. **Daily burn rate** — global cost over last 7 days
2. **Active users** — distinct user_id over last 7 days
3. **Crisis trends** — severity counts by day over last 30 days
4. **Funnel** — consents → onboarding → analysis → chat → plan → export
5. **Error distribution** — from Vercel log analytics

### Tribunal dashboard (for defense, optional)

A `/admin` route (requires specific auth, TODO post-v1) showing:
- Aggregate usage stats (no individual user data)
- Recent eval results
- System health

## Runbooks

### Claude API down

**Symptoms**: `/api/analyze`, `/api/chat`, `/api/narrative`, `/api/plan` all return 503
**Investigation**:
1. Check Anthropic status page
2. Check Vercel logs for error details
3. Verify `ANTHROPIC_API_KEY` is valid
**Mitigation**:
- If Anthropic is actually down → show maintenance banner, disable affected routes
- If rate limit hit on API key → check usage in Anthropic console, wait or increase
- If malformed responses → check if model SKU is still available

### Supabase down

**Symptoms**: all routes return 500 or middleware fails
**Investigation**: Supabase status page
**Mitigation**: show maintenance page via Vercel (Edge Config or static error page)

### Cost spike

**Symptoms**: daily cost trending toward `GLOBAL_DAILY_BUDGET_USD`
**Investigation**:
1. Query `rate_limits` by user for today: `SELECT user_id, cost_usd_cents FROM rate_limits WHERE day = CURRENT_DATE ORDER BY cost_usd_cents DESC LIMIT 10;`
2. Identify high-cost users (abuse or legitimate heavy usage?)
3. Check `crisis_events` for patterns suggesting abuse
**Mitigation**:
- If abuse: lower per-user `DAILY_TOKEN_CAP` temporarily
- If legitimate: raise `GLOBAL_DAILY_BUDGET_USD` or accept the spike
- If very abnormal: ban the user (ADR, add `banned` flag to profiles — TODO)

### Crisis false negative

**Symptoms**: user reports crisis message wasn't blocked
**Investigation**:
1. Ask user for approximate time + conversation context (not the message text)
2. Query `crisis_events` by conversation_id and time window
3. If no event → lexicon + classifier both missed
**Mitigation**:
1. Add regex pattern for the phrasing the user described
2. Bump `LEXICON_VERSION` in `lib/chat/crisis-lexicon.ts`
3. Add test case to `lib/chat/crisis-lexicon.test.ts`
4. Deploy hotfix (Vercel ~2 min)
5. Respond to user with acknowledgment + next steps
6. Post-mortem to `docs/tech/INCIDENTS.md` (create if not exists)

### Crisis false positive

**Symptoms**: user reports harmless idiom was flagged
**Investigation**:
1. Identify the phrase from user report
2. Query `crisis_events` to confirm it fired
**Mitigation**:
1. Add to `IDIOM_PRE_FILTER` in `lib/chat/crisis-lexicon.ts`
2. Bump `LEXICON_VERSION`
3. Add test case
4. Deploy hotfix
5. Respond to user

### User reports data access issue (Ley 25.326)

**Symptoms**: user emails asking to export or delete their data
**Investigation**: verify they're authenticated and use `/settings/export` or `/settings/delete`
**Mitigation**:
- If endpoint works but user is confused: walk them through the UI
- If endpoint is broken: prioritize hotfix (legal obligation)
- Always respond within 10 business days per Ley 25.326

### Database storage full

**Symptoms**: Supabase dashboard shows > 80% of free tier quota
**Investigation**: which table is largest? Usually `psychological_profiles.analysis_raw`
**Mitigation**:
- Run the `purge-analysis-raw` cron manually if it hasn't run
- Delete old test data from dev/staging
- Consider upgrading Supabase tier if legitimately at scale
- For TFG scale this shouldn't happen

## Incident post-mortem template

Save to `docs/tech/INCIDENTS.md` (create file when first incident happens):

```markdown
## YYYY-MM-DD — {Incident title}

**Duration**: N hours
**Impact**: {who was affected, how}
**Severity**: P0 / P1 / P2
**Detection**: {how did we find out}
**Root cause**: {the actual cause, not just the symptom}
**Fix**: {what changed}
**Lessons learned**: {1-3 bullet points}
**Action items**: {follow-ups with owners}
```

## Performance tracking

Key latency SLOs (informal, not contractual for TFG):

| Route | Target p95 | Hard timeout |
|---|---|---|
| `/` landing | < 1s | 3s |
| `/dashboard` | < 1.5s | 5s |
| `/api/analyze` | < 10s | 60s Edge |
| `/api/chat` first byte | < 2s | 10s classifier + 60s Claude |
| `/api/narrative` full | < 20s | 60s Edge |
| `/api/plan` | < 8s | 60s Edge |

Measured via Vercel Analytics for user-facing pages, `duration_ms` in logs for
API routes.

## Monitoring checklist (daily, for TFG-scale ops)

During active dev:
- [ ] Check Vercel logs for 5xx spikes
- [ ] Check Supabase storage usage
- [ ] Check `SELECT SUM(cost_usd_cents) FROM rate_limits WHERE day = CURRENT_DATE;`

Weekly:
- [ ] Review crisis event trend
- [ ] Run eval suite (if not already in CI)
- [ ] Check error distribution

Monthly:
- [ ] Review all users' rate_limit patterns for abuse
- [ ] Review `research_dataset` growth
- [ ] Update `docs/tech/INCIDENTS.md` with any issues

## References

- [CHAT_SAFETY.md](CHAT_SAFETY.md) — crisis event logging
- [RATE_LIMITING.md](RATE_LIMITING.md) — cost accounting queries
- [SECURITY.md](SECURITY.md) — what NEVER to log
- [DATABASE.md](DATABASE.md) — schema for metrics queries
- [CLOUD_HANDOFF.md](../CLOUD_HANDOFF.md) — Vercel deployment
- [biz/LEGAL.md](../biz/LEGAL.md) — response time for Ley 25.326 requests
