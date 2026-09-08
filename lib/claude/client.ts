import Anthropic from '@anthropic-ai/sdk';

export const DEFAULT_MODEL = 'claude-sonnet-4-6';
export const DEFAULT_HAIKU = 'claude-haiku-4-5-20251001';

export function getModelId(): string {
  return process.env.ANTHROPIC_MODEL_ID ?? DEFAULT_MODEL;
}

export function getHaikuModelId(): string {
  return process.env.ANTHROPIC_HAIKU_MODEL_ID ?? DEFAULT_HAIKU;
}

let cached: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Configurá .env.local.');
  }
  cached = new Anthropic({
    apiKey,
    // Fetch computes the request length. The SDK's manual header is rejected
    // by the Next.js Edge transport in the local Node 24 runtime.
    defaultHeaders: { 'Content-Length': null },
  });
  return cached;
}

export interface ClaudeTextOptions {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface ClaudeTextResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export async function claudeText(opts: ClaudeTextOptions): Promise<ClaudeTextResult> {
  const client = getClaude();
  const model = opts.model ?? getModelId();

  const response = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages: [{ role: 'user', content: opts.prompt }],
  });

  const first = response.content[0];
  if (!first || first.type !== 'text') {
    throw new Error('Claude returned no text block');
  }

  return {
    text: first.text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model,
  };
}

/**
 * Usage is independent of successful completion: a truncated response still
 * consumes tokens. Missing counters remain unknown, never fabricated as zero.
 */
export async function* claudeStream(opts: ClaudeTextOptions): AsyncGenerator<
  { type: 'text'; text: string }
  | { type: 'usage'; inputTokens?: number; outputTokens?: number }
  | { type: 'done'; inputTokens?: number; outputTokens?: number; model: string }
> {
  const client = getClaude();
  const model = opts.model ?? getModelId();

  const stream = client.messages.stream({
    model,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages: [{ role: 'user', content: opts.prompt }],
  });

  let inputTokens: number | undefined;
  let outputTokens: number | undefined;
  let stopReason: string | null = null;
  let receivedStop = false;

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield { type: 'text', text: event.delta.text };
    } else if (event.type === 'message_delta' && 'usage' in event) {
      const reported = event.usage?.output_tokens;
      if (Number.isSafeInteger(reported) && reported >= 0) {
        outputTokens = reported;
        yield { type: 'usage', outputTokens };
      }
      stopReason = event.delta.stop_reason ?? stopReason;
    } else if (event.type === 'message_start' && 'message' in event) {
      const reported = event.message.usage?.input_tokens;
      if (Number.isSafeInteger(reported) && reported >= 0) {
        inputTokens = reported;
        yield { type: 'usage', inputTokens };
      }
    } else if (event.type === 'message_stop') {
      receivedStop = true;
    }
  }

  if (!receivedStop || (stopReason !== 'end_turn' && stopReason !== 'stop_sequence')) {
    throw new Error('Claude response incomplete');
  }

  yield { type: 'done', inputTokens, outputTokens, model };
}
