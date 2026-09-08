// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ consent: 'missing', writes: 0, providerCalls: 0, safetyCalls: 0, reservations: 0 }));
vi.mock('@/lib/supabase/edge', () => {
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'fixture-user' } }, error: null }) },
    rpc: async () => { fixture.reservations++; return { data: { allowed: true }, error: null }; },
    from: (table: string) => {
      const filters: Record<string, unknown> = {};
      const query = {
        select() { return query; }, eq(key: string, value: unknown) { filters[key] = value; return query; },
        gte() { return query; }, order() { return query; }, limit() { return query; },
        single() { return query; }, maybeSingle() { return query; },
        insert() { fixture.writes++; return query; }, update() { fixture.writes++; return query; },
        then(resolve: (value: unknown) => unknown) {
          if (table === 'consent_records') {
            const row = { id: 'old-acceptance', user_id: fixture.consent === 'other-user' ? 'different-user' : 'fixture-user', consent_version: 'historical-v1' };
            const data = fixture.consent === 'missing' || !Object.entries(filters).every(([key, value]) => row[key as keyof typeof row] === value) ? null : row;
            return Promise.resolve(resolve({ data, error: fixture.consent === 'error' ? { message: 'database unavailable' } : null }));
          }
          const data = table === 'psychological_profiles'
            ? { id: '123e4567-e89b-12d3-a456-426614174000', user_id: 'fixture-user', updated_at: '2026-09-07', archetype: 'sage' }
            : table === 'messages' ? [] : { id: 'fixture-row', last_activity_at: new Date().toISOString() };
          return Promise.resolve(resolve({ data, error: null }));
        },
      };
      return query;
    },
  };
  return { createEdgeClient: () => client, createEdgeServiceClient: () => client };
});
vi.mock('@/lib/chat/pipeline', () => ({ runSafetyPipeline: async () => { fixture.safetyCalls++; } }));
vi.mock('@/lib/claude/client', () => ({
  getModelId: () => 'fixture-model',
  claudeStream: async function* () {
    fixture.providerCalls++;
    yield { type: 'text', text: 'Texto sintético.' };
    yield { type: 'done', inputTokens: 10, outputTokens: 10 };
  },
  claudeText: async () => {
    fixture.providerCalls++;
    return { text: JSON.stringify({ areas: [1, 2, 3].map(n => ({ name: `Área ${n}`, rationale: 'Reflexión', actions: [{ title: 'Caminar', description: 'Caminar una cuadra', microGoals: [{ text: 'Observar' }] }] })) }), inputTokens: 10, outputTokens: 10 };
  },
}));
vi.mock('@/lib/claude/pricing', () => ({ costUsdCents: () => 1 }));
import { POST as chat } from '@/app/api/chat/route';
import { POST as narrative } from '@/app/api/narrative/route';
import { POST as plan } from '@/app/api/plan/route';
beforeEach(() => { fixture.consent = 'missing'; fixture.writes = 0; fixture.providerCalls = 0; fixture.safetyCalls = 0; fixture.reservations = 0; });

for (const [kind, handler, body] of [
  ['chat', chat, { message: 'Me gusta observar las hojas al caminar.' }],
  ['narrative', narrative, { profileId: '123e4567-e89b-12d3-a456-426614174000', regenerate: true }],
  ['plan', plan, { profileId: '123e4567-e89b-12d3-a456-426614174000', regenerate: true }],
] as const) {
  const submit = () => handler(new Request(`http://localhost/api/${kind}`, { method: 'POST', body: JSON.stringify(body) }));
  it.each(['missing', 'error', 'other-user'])(`${kind}: no writes or provider work when consent is %s`, async consent => {
    fixture.consent = consent;
    const response = await submit();
    await response.text();
    expect(fixture.writes).toBe(0);
    expect(fixture.providerCalls).toBe(0);
    expect(fixture.safetyCalls).toBe(0);
    expect(fixture.reservations).toBe(0);
    expect(response.status).toBe(consent === 'error' ? 503 : 403);
  });
  it(`${kind}: accepts a prior version belonging to the authenticated user`, async () => {
    fixture.consent = 'historical';
    const response = await submit();
    await response.text();
    expect(response.status).toBe(200);
    expect(fixture.providerCalls).toBe(1);
    expect(fixture.writes).toBeGreaterThan(0);
  });
}
