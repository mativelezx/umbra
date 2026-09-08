// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ stopReason: 'end_turn', hasStop: true }));
vi.mock('@anthropic-ai/sdk', () => ({ default: class {
  messages = { stream: async function* () {
    yield { type: 'message_start', message: { usage: { input_tokens: 10 } } };
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Texto ficticio' } };
    yield { type: 'message_delta', delta: { stop_reason: fixture.stopReason }, usage: { output_tokens: 12 } };
    if (fixture.hasStop) yield { type: 'message_stop' };
  } };
} }));
import { claudeStream } from './client';
beforeEach(() => { fixture.stopReason = 'end_turn'; fixture.hasStop = true; });
async function collect() {
  const events: unknown[] = [];
  for await (const event of claudeStream({ system: 'fixture', prompt: 'fixture' })) events.push(event);
  return events;
}
it('does not mark a token-limited provider response as a completed narrative', async () => {
  fixture.stopReason = 'max_tokens';
  await expect(collect()).rejects.toThrow(/incomplete/i);
});
it('requires the provider stop event before reporting completion', async () => {
  fixture.hasStop = false;
  await expect(collect()).rejects.toThrow(/incomplete/i);
});
it('returns completion and usage for a normally finished response', async () => {
  expect(await collect()).toContainEqual(expect.objectContaining({ type: 'done', inputTokens: 10, outputTokens: 12 }));
});
