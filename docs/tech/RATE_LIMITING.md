# Umbra — Rate Limiting & Cost Accounting

> `charge_rate_limit` + `reconcile_rate_limit` RPCs, token → USD conversion,
> global budget ceiling, reconciliation in finally blocks.

## Why rate limiting is non-negotiable

- **TFG cost control**: Anthropic Claude Sonnet costs ~$3 per million input tokens and ~$15 per million output tokens. A runaway chat session could burn $10 in a few minutes.
- **Abuse prevention**: without caps, a malicious user (or a viral spike) can drain the budget and DoS the product.
- **Legal posture**: Ley 25.326 minimum-necessary principle — rate limits demonstrate intentional restraint in data processing.
- **UX signal**: hitting a cap tells us users want more; not hitting it means we're well-sized.

## Architecture

```
┌─────────────────────────────────────────┐
│ Every Claude-calling Edge route         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ estimate input +     │
       │ max output tokens    │
       │ compute est cost     │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ charge_rate_limit    │ ← atomic UPSERT + SELECT FOR UPDATE
       │ RPC (Supabase)       │   SECURITY DEFINER with search_path
       └──────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
   allowed=true       allowed=false
        │                   │
        │                   ▼
        │            throw RateLimitError
        │                   │
        │                   ▼
        │            return 429
        ▼
┌──────────────────┐
│ Claude API call  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
  success   error (timeout, 5xx, refusal)
    │         │
    ▼         ▼
┌──────────────────────────┐
│ finally block:           │
│ reconcile_rate_limit RPC │
│ adjusts actual vs est    │
└──────────────────────────┘
```

## `charge_rate_limit` function (Migration 002)

```sql
CREATE OR REPLACE FUNCTION public.charge_rate_limit(
  p_user_id UUID,
  p_day DATE,
  p_est_input INTEGER,
  p_est_output INTEGER,
  p_est_cost_cents INTEGER,
  p_daily_token_cap INTEGER,
  p_daily_cost_cap_cents INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining_tokens INTEGER, remaining_cost_cents INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_input INTEGER;
  v_current_output INTEGER;
  v_current_cost INTEGER;
BEGIN
  -- Ensure row exists
  INSERT INTO public.rate_limits (user_id, day, input_tokens, output_tokens, cost_usd_cents)
  VALUES (p_user_id, p_day, 0, 0, 0)
  ON CONFLICT (user_id, day) DO NOTHING;

  -- Lock row for atomicity
  SELECT input_tokens, output_tokens, cost_usd_cents
    INTO v_current_input, v_current_output, v_current_cost
  FROM public.rate_limits
  WHERE user_id = p_user_id AND day = p_day
  FOR UPDATE;

  -- Check caps
  IF (v_current_input + v_current_output + p_est_input + p_est_output) > p_daily_token_cap
     OR (v_current_cost + p_est_cost_cents) > p_daily_cost_cap_cents THEN
    RETURN QUERY SELECT
      FALSE,
      p_daily_token_cap - v_current_input - v_current_output,
      p_daily_cost_cap_cents - v_current_cost;
    RETURN;
  END IF;

  -- Charge
  UPDATE public.rate_limits
    SET input_tokens = input_tokens + p_est_input,
        output_tokens = output_tokens + p_est_output,
        cost_usd_cents = cost_usd_cents + p_est_cost_cents
  WHERE user_id = p_user_id AND day = p_day;

  RETURN QUERY SELECT
    TRUE,
    p_daily_token_cap - v_current_input - v_current_output - p_est_input - p_est_output,
    p_daily_cost_cap_cents - v_current_cost - p_est_cost_cents;
END;
$$;

REVOKE ALL ON FUNCTION public.charge_rate_limit FROM public;
GRANT EXECUTE ON FUNCTION public.charge_rate_limit TO service_role;
```

Key properties:
- `SECURITY DEFINER` runs as table owner, not caller
- `SET search_path = public, pg_temp` prevents search_path injection (eng review finding 1.2)
- `FOR UPDATE` lock inside transaction guarantees atomicity under concurrent requests
- `service_role`-only execute — not callable by end users

## `reconcile_rate_limit` function

```sql
CREATE OR REPLACE FUNCTION public.reconcile_rate_limit(
  p_user_id UUID,
  p_day DATE,
  p_actual_input INTEGER,
  p_actual_output INTEGER,
  p_estimated_input INTEGER,
  p_estimated_output INTEGER,
  p_actual_cost_cents INTEGER,
  p_estimated_cost_cents INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.rate_limits
    SET input_tokens = input_tokens + (p_actual_input - p_estimated_input),
        output_tokens = output_tokens + (p_actual_output - p_estimated_output),
        cost_usd_cents = cost_usd_cents + (p_actual_cost_cents - p_estimated_cost_cents)
  WHERE user_id = p_user_id AND day = p_day;
END;
$$;
```

Called in `finally` block of every Edge route. If Claude succeeded, adjusts
the pre-charged estimate to actual usage. If Claude errored before generating
output, subtracts the estimated output back to zero. Prevents users from being
charged for failed calls (eng review finding 4.3).

## Token → USD pricing table (`lib/claude/pricing.ts`)

```ts
export const PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  'claude-sonnet-4-6-20260301':        { inputPer1M: 3.00,  outputPer1M: 15.00 },
  'claude-haiku-4-5-20251001':         { inputPer1M: 1.00,  outputPer1M:  5.00 },
  'claude-opus-4-6-20260301':          { inputPer1M: 15.00, outputPer1M: 75.00 },
};

export function costUsdCents(model: string, input: number, output: number): number {
  const p = PRICING[model] ?? PRICING['claude-sonnet-4-6-20260301'];
  return Math.ceil((input * p.inputPer1M + output * p.outputPer1M) / 1_000_000 * 100);
}
```

Update this table when Anthropic pricing changes or new models ship. Use
`Math.ceil` so we over-charge slightly (safer than under-charging).

## Budget tiers

| Env var | Default | Scope |
|---|---|---|
| `DAILY_TOKEN_CAP` | 15000 | Per user, per day. ~30 chat turns. |
| `DAILY_COST_CAP_CENTS` | 200 | Per user, per day. USD 2.00. |
| `GLOBAL_DAILY_BUDGET_USD` | 50 | Total across all users. Circuit breaker. |
| `ANTHROPIC_MAX_BUDGET_USD_PER_CI_RUN` | 5 | CI eval cost ceiling. |

## Global budget circuit breaker

> **Estado (2026-08): NO implementado en el prototipo entregado.** `GLOBAL_DAILY_BUDGET_USD` existe como parámetro de configuración declarado; el corte automático descripto a continuación es el diseño previsto (ADR-016) y queda como trabajo pendiente. El control operativo vigente es el presupuesto por persona (`DAILY_COST_CAP_CENTS`, default 200 = USD 2/día) aplicado con reserva previa y conciliación en cada punto de invocación.

Cannot be checked "at app startup" in Edge runtime (no singleton lifecycle).
Instead uses `unstable_cache` from Next.js with 5-min TTL (ADR-016):

```ts
import { unstable_cache } from 'next/cache';

const getTodayGlobalSpend = unstable_cache(
  async (supabase) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('rate_limits')
      .select('cost_usd_cents.sum()')
      .eq('day', today);
    return (data?.[0] as any)?.sum ?? 0;
  },
  ['global-spend'],
  { revalidate: 300 },  // 5-min TTL
);

// In Edge route:
const globalSpendCents = await getTodayGlobalSpend(supabase);
const budgetCents = Number(process.env.GLOBAL_DAILY_BUDGET_USD!) * 100;
if (globalSpendCents > budgetCents) {
  throw new BudgetExceededError();  // → 503 "en mantenimiento por limite diario"
}
```

**Worst-case overshoot**: 5 min × per-second burn rate × concurrent users.
For TFG with 1-10 concurrent users, this is cents. Documented as acceptable
trade-off in ADR-016.

If the product scales beyond TFG, this should migrate to Redis with atomic
`DECR` — see TODOS.md.

## Route-specific estimates

Each route computes its own estimated input + max output tokens based on the
request:

### `/api/analyze` (Pass 1)
- Input estimate: `~1500 tokens` for the 4 knowledge blocks + instructions, plus user text length in tokens (`~= chars / 4`)
- Max output: `~1500 tokens` (JSON profile)
- Cost est: `costUsdCents('claude-sonnet-4-6-20260301', estInput, 1500)`

### `/api/analyze/evidence` (Pass 2)
- Input estimate: `~500 tokens` for profile JSON + original text
- Max output: `~500 tokens` (highlights JSON)
- Cost est: `costUsdCents(model, estInput, 500)`

### `/api/chat`
- Input estimate: full conversation history token count (cap at 4000) + system prompt (~800 tokens)
- Max output: `~1000 tokens` per response
- Cost est: `costUsdCents(model, estInput, 1000)`

### `/api/narrative`
- Input estimate: profile JSON + system prompt (~1500 tokens)
- Max output: `~2000 tokens` (800-1200 word narrative)
- Cost est: `costUsdCents(model, 1500, 2000)`

### `/api/plan`
- Input estimate: profile JSON + system prompt (~1200 tokens)
- Max output: `~1500 tokens` (JSON plan structure)
- Cost est: `costUsdCents(model, 1200, 1500)`

## Handling the response (reconciliation)

```ts
const [usedInputTokens, usedOutputTokens] = [0, 0];
try {
  // charge_rate_limit with estimates
  const charge = await supabase.rpc('charge_rate_limit', { ... });
  if (!charge.data[0].allowed) throw new RateLimitError(86400);

  // Claude call
  const response = await anthropic.messages.create({ ... });
  usedInputTokens = response.usage.input_tokens;
  usedOutputTokens = response.usage.output_tokens;

  // ... process response
} finally {
  // reconcile actuals (even on error)
  const actualCostCents = costUsdCents(
    process.env.ANTHROPIC_MODEL_ID!,
    usedInputTokens,
    usedOutputTokens,
  );
  await supabase.rpc('reconcile_rate_limit', {
    p_user_id: userId,
    p_day: today,
    p_actual_input: usedInputTokens,
    p_actual_output: usedOutputTokens,
    p_estimated_input: estInput,
    p_estimated_output: estMaxOutput,
    p_actual_cost_cents: actualCostCents,
    p_estimated_cost_cents: estCostCents,
  });
}
```

If Claude errored before generating output, `usedOutputTokens` stays at 0.
Reconcile subtracts the estimated output from the charge. User is charged
only for input tokens actually sent to Anthropic (which they were).

## Streaming edge case

For streaming routes (`/chat`, `/narrative`), the usage totals come in the
final stream event (or are estimated from chunk lengths if Anthropic's SSE
doesn't include them cleanly). The reconcile happens after the stream fully
completes or aborts.

## UI surface for rate limiting

- When `429 rate_limited`: toast message "alcanzaste tu cupo diario de ~30 mensajes. Volvé mañana o explorá otras secciones de Umbra."
- User's rate limit status is NOT shown proactively in the UI (don't turn it into a game)
- Rationale: Umbra is for reflection, not engagement farming

## Concurrent request edge case

Two requests from the same user, same second, same cap available:
- Both enter `charge_rate_limit` simultaneously
- Request A acquires `FOR UPDATE` lock first, updates row, releases lock
- Request B waits for lock, then sees updated row, computes new availability
- Exactly one passes (or both pass if there's enough budget), deterministically
- Test: `lib/db/charge_rate_limit.test.ts` fires 10 parallel calls against local Supabase, asserts exactly N pass

## Monitoring

Daily burn rate query (run in Supabase SQL Editor or a cron):

```sql
SELECT
  day,
  SUM(input_tokens + output_tokens) AS total_tokens,
  SUM(cost_usd_cents) / 100.0 AS total_cost_usd,
  COUNT(DISTINCT user_id) AS active_users
FROM public.rate_limits
WHERE day >= NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day DESC;
```

Alert if `total_cost_usd > 0.7 * GLOBAL_DAILY_BUDGET_USD` before end of day.

## Testing

- `lib/db/charge_rate_limit.test.ts` — integration test with concurrent calls
- `lib/claude/pricing.test.ts` — cost calculation correctness
- `e2e/rate-limit-flow.spec.ts` — Playwright: hit cap, verify 429, retry tomorrow

## References

- [DECISIONS.md ADR-016, ADR-022](../DECISIONS.md)
- [DATABASE.md](DATABASE.md) — `rate_limits` table schema
- [ARCHITECTURE.md](ARCHITECTURE.md) — data flow with rate limit stages
- [CHAT_SAFETY.md](CHAT_SAFETY.md) — integrates with chat pipeline
- [CLOUD_HANDOFF.md](../CLOUD_HANDOFF.md) — env vars + cost model
