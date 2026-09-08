// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;
const fixture = vi.hoisted(() => ({
  rows: {} as Record<string, Row[]>,
  failedTable: '',
  deleted: [] as string[],
  streamMode: 'complete',
}));
const profileId = '123e4567-e89b-12d3-a456-426614174000';
vi.mock('@/lib/supabase/edge', () => {
  function from(table: string) {
    let filters: Array<(row: Row) => boolean> = [];
    let inserted: Row | null = null;
    let deleting = false;
    const query = {
      select() { return query; },
      eq(key: string, value: unknown) { filters.push(row => row[key] === value); return query; },
      gte(key: string, value: string) { filters.push(row => Date.parse(String(row[key])) >= Date.parse(value)); return query; },
      order() { return query; }, limit() { return query; }, single() { return query; }, maybeSingle() { return query; },
      insert(value: Row) { inserted = { id: `new-${table}`, ...value }; return query; },
      delete() { deleting = true; return query; },
      then(resolve: (value: unknown) => unknown) {
        if (fixture.failedTable === table) return Promise.resolve(resolve({ data: null, error: { message: 'fixture DB unavailable' } }));
        if (inserted) { (fixture.rows[table] ??= []).push(inserted); return Promise.resolve(resolve({ data: inserted, error: null })); }
        if (deleting) { fixture.deleted.push(table); fixture.rows[table] = (fixture.rows[table] ?? []).filter(row => !filters.every(fn => fn(row))); }
        const data = (fixture.rows[table] ?? []).filter(row => filters.every(fn => fn(row)))
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] ?? null;
        return Promise.resolve(resolve({ data, error: null }));
      },
    };
    return query;
  }
  const client = { from,
    auth: { getUser: async () => ({ data: { user: { id: 'user-a' } } }) },
    rpc: async () => ({ data: { allowed: true }, error: null }),
  };
  return { createEdgeClient: () => client, createEdgeServiceClient: () => client };
});
vi.mock('@/lib/claude/client', () => ({
  getModelId: () => 'fixture-model',
  claudeText: async () => ({ text: JSON.stringify({ areas: [1, 2, 3].map(n => ({ name: `Actual ${n}`, rationale: 'Reflexión', actions: [{ title: 'Caminar', description: 'Caminar una cuadra', microGoals: [{ text: 'Observar' }] }] })) }), inputTokens: 10, outputTokens: 10 }),
  claudeStream: async function* () {
    yield { type: 'text', text: 'Lectura actual' };
    if (fixture.streamMode === 'throw') throw new Error('fixture interrupted');
    if (fixture.streamMode !== 'incomplete') yield { type: 'done', inputTokens: 10, outputTokens: 10 };
  },
}));
vi.mock('@/lib/claude/pricing', () => ({ costUsdCents: () => 1 }));

import { POST as plan } from '@/app/api/plan/route';
import { POST as narrative } from '@/app/api/narrative/route';

function request(regenerate = false) {
  return new Request('http://localhost/api/fixture', { method: 'POST', body: JSON.stringify({ profileId, regenerate }) });
}

beforeEach(() => {
  fixture.failedTable = '';
  fixture.streamMode = 'complete';
  fixture.deleted = [];
  fixture.rows = {
    consent_records: [{ id: 'prior-consent', user_id: 'user-a', consent_version: 'historical-v1' }],
    psychological_profiles: [{ id: profileId, user_id: 'user-a', updated_at: '2026-09-07T00:00:00Z', created_at: '2026-08-01T00:00:00Z', archetype: 'sage' }],
    narratives: [{ id: 'old-reading', user_id: 'user-a', profile_id: profileId, created_at: '2026-09-01T00:00:00Z', content: 'Lectura anterior' }],
    development_plans: [{ id: 'old-plan', user_id: 'user-a', profile_id: profileId, created_at: '2026-09-01T00:00:00Z', areas: [{ name: 'Anterior' }] }],
  };
});

describe('derived content after reanalysis', () => {
  it('stops cached replay timers when the reader cancels', async () => {
    vi.useFakeTimers();
    try {
      fixture.rows.narratives[0] = { ...fixture.rows.narratives[0], created_at: '2026-09-08T00:00:00Z', content: 'Lectura ficticia. '.repeat(40) };
      const response = await narrative(request());
      const reader = response.body!.getReader();
      await vi.advanceTimersByTimeAsync(40);
      expect((await reader.read()).done).toBe(false);
      await reader.cancel();
      expect(vi.getTimerCount()).toBe(0);
      await vi.advanceTimersByTimeAsync(200);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
  it('replays cached narrative text without losing line breaks or long words', async () => {
    const content = `## Apertura\n\n${'a'.repeat(140)}\n\n> Una reflexión.\n\nFin.`;
    fixture.rows.narratives[0] = { ...fixture.rows.narratives[0], created_at: '2026-09-08T00:00:00Z', content };
    const response = await narrative(request());
    const events = (await response.text()).trim().split('\n\n').map(line => JSON.parse(line.slice(6)));
    expect(events.filter(event => event.type === 'text').map(event => event.chunk).join('')).toBe(content);
  });
  it.each(['throw', 'incomplete'])('does not save or confirm a %s narrative stream', async mode => {
    fixture.streamMode = mode;
    const response = await narrative(request(true));
    const body = await response.text();
    expect(body).toContain('"type":"error"');
    expect(body).not.toContain('"type":"done"');
    expect(fixture.rows.narratives).toHaveLength(1);
  });

  it('reports persistence failure instead of emitting a successful completion', async () => {
    fixture.failedTable = 'narratives';
    const response = await narrative(request(true));
    const body = await response.text();
    expect(body).toContain('"type":"error"');
    expect(body).not.toContain('"type":"done"');
    expect(fixture.rows.narratives).toHaveLength(1);
  });

  it('generates a plan for the current analysis instead of returning its previous plan', async () => {
    const response = await plan(request());
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.data.areas[0].name).toBe('Actual 1');
    expect(fixture.rows.development_plans.some(row => row.id === 'old-plan')).toBe(true);
  });

  it('streams a new reading instead of returning the narrative from before reanalysis', async () => {
    const response = await narrative(request());
    const body = await response.text();
    expect(body).toContain('Lectura actual');
    expect(body).not.toContain('Lectura anterior');
  });

  it.each([['plan', plan], ['narrative', narrative]] as const)('keeps history when regenerating %s', async (_kind, handler) => {
    const response = await handler(request(true));
    await response.text();
    await vi.waitFor(() => expect(fixture.rows[_kind === 'plan' ? 'development_plans' : 'narratives']).toHaveLength(2));
    expect(fixture.deleted).toEqual([]);
  });

  it('reuses a current plan only for the matching profile', async () => {
    fixture.rows.development_plans.push({ id: 'different-profile', user_id: 'user-a', profile_id: 'different', created_at: '2026-09-09T00:00:00Z', areas: [{ name: 'Incorrecto' }] });
    const response = await plan(request());
    expect((await response.json()).data.areas[0].name).toBe('Actual 1');
  });
});
