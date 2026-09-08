// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({
  mode: 'max_tokens',
  calls: [] as Array<{ name: string; args: Record<string, number> }>,
  assistantWrites: 0,
  history: [] as Array<{ role: string; content: string }>,
  prompt: '',
}));
vi.mock('@anthropic-ai/sdk', () => ({ default: class {
  messages = { stream: async function* (request: { messages: Array<{ content: string }> }) {
    fixture.prompt = request.messages[0].content;
    if (fixture.mode !== 'unknown') yield { type: 'message_start', message: { usage: { input_tokens: 10 } } };
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Lectura sintética incompleta.' } };
    if (fixture.mode === 'unknown' || fixture.mode === 'input-only') throw new Error('fixture disconnected');
    yield { type: 'message_delta', delta: { stop_reason: fixture.mode === 'complete' ? 'end_turn' : 'max_tokens' }, usage: { output_tokens: 12 } };
    if (fixture.mode !== 'missing-stop') yield { type: 'message_stop' };
  } };
} }));
vi.mock('@/lib/chat/pipeline', () => ({ runSafetyPipeline: async () => {} }));
vi.mock('@/lib/claude/pricing', () => ({ costUsdCents: (_model: string, input: number, output: number) => input + output }));
vi.mock('@/lib/supabase/edge', () => {
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'fixture-user' } } }) },
    rpc: async (name: string, args: Record<string, number>) => { fixture.calls.push({ name, args }); return { data: { allowed: true }, error: null }; },
    from: (table: string) => {
      let ascending = true;
      let rowLimit = Infinity;
      const query = {
        select() { return query; }, eq() { return query; }, gte() { return query; },
        order(_column: string, options: { ascending: boolean }) { ascending = options.ascending; return query; },
        limit(value: number) { rowLimit = value; return query; }, single() { return query; }, maybeSingle() { return query; },
        insert(value: { role?: string }) { if (table === 'messages' && value.role === 'assistant') fixture.assistantWrites++; return query; }, update() { return query; },
        then(resolve: (value: unknown) => unknown) {
          const data = table === 'psychological_profiles' ? { id: '123e4567-e89b-12d3-a456-426614174000', user_id: 'fixture-user', updated_at: '2026-09-07', archetype: 'sage' }
            : table === 'messages' ? (ascending ? fixture.history.slice() : fixture.history.slice().reverse()).slice(0, rowLimit) : { id: 'fixture-row', last_activity_at: new Date().toISOString() };
          return Promise.resolve(resolve({ data, error: null }));
        },
      };
      return query;
    },
  };
  return { createEdgeClient: () => client, createEdgeServiceClient: () => client };
});
import { POST as narrative } from '@/app/api/narrative/route';
import { POST as chat } from '@/app/api/chat/route';
beforeEach(() => { fixture.mode = 'max_tokens'; fixture.calls = []; fixture.assistantWrites = 0; fixture.history = []; fixture.prompt = ''; });

it('chat sends the ten most recent messages in chronological order', async () => {
  fixture.mode = 'complete';
  fixture.history = Array.from({ length: 24 }, (_, index) => ({
    role: index % 2 ? 'assistant' : 'user', content: `history-${String(index).padStart(2, '0')}`,
  }));
  const response = await chat(new Request('http://localhost/api/chat', {
    method: 'POST', body: JSON.stringify({ conversationId: '123e4567-e89b-12d3-a456-426614174000', message: 'Este es el mensaje nuevo.' }),
  }));
  expect(await response.text()).toContain('"type":"done"');
  expect(fixture.prompt).not.toContain('history-13');
  expect(fixture.prompt.match(/history-\d+/g)).toEqual(fixture.history.slice(-10).map(message => message.content));
  expect(fixture.prompt).toContain('Este es el mensaje nuevo.');
});

for (const [kind, handler, body] of [
  ['narrative', narrative, { profileId: '123e4567-e89b-12d3-a456-426614174000', regenerate: true }],
  ['chat', chat, { conversationId: '123e4567-e89b-12d3-a456-426614174000', message: 'Me gusta observar las hojas al caminar.' }],
] as const) {
  it.each(['max_tokens', 'missing-stop', 'complete'])(`${kind}: reconciles reported provider usage even after %s`, async mode => {
    fixture.mode = mode;
    const response = await handler(new Request(`http://localhost/api/${kind}`, { method: 'POST', body: JSON.stringify(body) }));
    const content = await response.text();
    expect(content).toContain(mode === 'complete' ? '"type":"done"' : '"type":"error"');
    if (mode !== 'complete') expect(content).not.toContain('"type":"done"');
    if (kind === 'chat') expect(fixture.assistantWrites).toBe(mode === 'complete' ? 1 : 0);
    await vi.waitFor(() => expect(fixture.calls.some(call => call.name === 'reconcile_rate_limit')).toBe(true));
    const reconciliation = fixture.calls.find(call => call.name === 'reconcile_rate_limit')?.args;
    expect(reconciliation).toMatchObject({ p_actual_input: 10, p_actual_output: 12, p_actual_cost_cents: 22 });
  });

  it.each(['unknown', 'input-only'])(`${kind}: retains the reserve for unknown usage after %s interruption`, async mode => {
    fixture.mode = mode;
    const response = await handler(new Request(`http://localhost/api/${kind}`, { method: 'POST', body: JSON.stringify(body) }));
    expect(await response.text()).toContain('"type":"error"');
    if (kind === 'chat') expect(fixture.assistantWrites).toBe(0);
    await vi.waitFor(() => expect(fixture.calls.some(call => call.name === 'reconcile_rate_limit')).toBe(true));
    const charge = fixture.calls.find(call => call.name === 'charge_rate_limit')!.args;
    const reconciliation = fixture.calls.find(call => call.name === 'reconcile_rate_limit')!.args;
    expect(reconciliation.p_actual_input).toBe(mode === 'input-only' ? 10 : charge.p_est_input);
    expect(reconciliation.p_actual_output).toBe(charge.p_est_output);
    expect(reconciliation.p_actual_cost_cents).toBeGreaterThan(0);
  });
}
