import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

let cached: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (cached) return cached;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY no está definido. Configurá .env.local con tu key.'
    );
  }

  cached = new Anthropic({ apiKey });
  return cached;
}

export interface ClaudeTextOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function claudeText({
  system,
  prompt,
  maxTokens = 4096,
  temperature = 0.7,
}: ClaudeTextOptions): Promise<string> {
  const client = getClaude();

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  const first = response.content[0];
  if (!first || first.type !== 'text') {
    throw new Error('Respuesta de Claude sin bloque de texto.');
  }
  return first.text;
}
