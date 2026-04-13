/**
 * Anthropic model price table. Updated manually when Anthropic changes pricing
 * or new models ship. All prices in USD per 1M tokens.
 *
 * Source: https://docs.anthropic.com/claude/docs/models-overview
 */

export interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
}

export const PRICING: Record<string, ModelPricing> = {
  // Claude 4.6 family (April 2026)
  'claude-sonnet-4-6-20260301': { inputPer1M: 3.0, outputPer1M: 15.0 },
  'claude-sonnet-4-6': { inputPer1M: 3.0, outputPer1M: 15.0 }, // alias fallback
  'claude-haiku-4-5-20251001': { inputPer1M: 1.0, outputPer1M: 5.0 },
  'claude-haiku-4-5': { inputPer1M: 1.0, outputPer1M: 5.0 },
  'claude-opus-4-6-20260301': { inputPer1M: 15.0, outputPer1M: 75.0 },
  'claude-opus-4-6': { inputPer1M: 15.0, outputPer1M: 75.0 },
  // Legacy (Phase 1 default from master doc)
  'claude-sonnet-4-20250514': { inputPer1M: 3.0, outputPer1M: 15.0 },
};

const FALLBACK: ModelPricing = { inputPer1M: 3.0, outputPer1M: 15.0 };

/**
 * Compute cost in USD cents, using `Math.ceil` so we over-charge slightly
 * (safer than under-charging against a rate limit).
 */
export function costUsdCents(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = PRICING[model] ?? FALLBACK;
  const usd = (inputTokens * p.inputPer1M + outputTokens * p.outputPer1M) / 1_000_000;
  return Math.ceil(usd * 100);
}

export function costUsd(model: string, input: number, output: number): number {
  return costUsdCents(model, input, output) / 100;
}
