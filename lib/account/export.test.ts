// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;
const state = vi.hoisted(() => ({
  tables: {} as Record<string, Row[]>,
  failedTable: '',
  authenticated: true,
}));

vi.mock('@/lib/supabase/server', () => {
  function from(table: string) {
    let rows = state.tables[table] ?? [];
    let columns = '*';
    let start = 0;
    let end = 999;
    let single = false;
    const query = {
      select(value: string) { columns = value; return query; },
      eq(key: string, value: unknown) {
        rows = rows.filter(row => key.split('.').reduce<unknown>((part, k) =>
          part && typeof part === 'object' ? (part as Row)[k] : undefined, row) === value);
        return query;
      },
      order() { return query; },
      range(first: number, last: number) { start = first; end = last; return query; },
      single() { single = true; return query; },
      then(resolve: (result: { data: Row[] | Row | null; error: object | null; count: number | null }) => unknown) {
        if (state.failedTable === table) return Promise.resolve(resolve({ data: null, error: { message: 'fixture failure' }, count: null }));
        const selected = rows.slice(start, end + 1).map(row => columns.startsWith('*')
          ? row : Object.fromEntries(columns.split(',').map(k => [k.trim(), row[k.trim()]])));
        return Promise.resolve(resolve({ data: single ? selected[0] ?? null : selected, error: null, count: rows.length }));
      },
    };
    return query;
  }
  const client = { from, auth: { getUser: async () => ({ data: { user: state.authenticated
    ? { id: 'user-a', email: 'fixture@example.test', created_at: '2026-01-01' } : null } }) } };
  return { createClient: async () => client, createServiceClient: () => client };
});
vi.mock('@/lib/security/peppers', () => ({ computeHash: async (kind: string) => `${kind}-user-a` }));

import { GET } from '@/app/api/account/export/route';

beforeEach(() => {
  state.authenticated = true;
  state.failedTable = '';
  state.tables = {
    profiles: [{ id: 'user-a', research_opt_in: false }],
    onboarding_sessions: [{ id: 'onboarding-a', user_id: 'user-a', flags: { seedText: 'Retrato ficticio' } }, { id: 'other', user_id: 'user-b' }],
    evidence_highlights: [{ id: 'evidence-a', profile: { user_id: 'user-a' }, payload: {} }, { id: 'other', profile: { user_id: 'user-b' } }],
    usability_responses: [{ id: 'survey-a', user_id: 'user-a' }],
    rate_limits: [{ user_id: 'user-a', day: '2026-09-01', input_tokens: 100 }],
    research_dataset: [{ id: 'research-a', user_hash: 'research-user-a', input_text: 'Texto ficticio' }, { id: 'other', user_hash: 'research-user-b' }],
    crisis_events: [{ id: 'event-a', user_hash: 'crisis-user-a', severity: 'sampling' }],
    delete_confirmations: [{ id: 'request-a', user_id: 'user-a', created_at: '2026-09-01', expires_at: '2026-09-01', used_at: null, token_hash: 'not-exportable' }],
  };
});

describe('account data export', () => {
  it('includes owned onboarding, evidence, surveys, budgets and research after opting out', async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.onboarding_sessions).toHaveLength(1);
    expect(body.onboarding_sessions[0].flags.seedText).toBe('Retrato ficticio');
    expect(body.evidence_highlights).toHaveLength(1);
    expect(body.usability_responses).toHaveLength(1);
    expect(body.rate_limits).toHaveLength(1);
    expect(body.research_dataset).toHaveLength(1);
    expect(body.crisis_events).toHaveLength(1);
    expect(body.delete_confirmations).toHaveLength(1);
    expect(body.delete_confirmations[0]).not.toHaveProperty('token_hash');
    expect(JSON.stringify(body)).not.toContain('user-b');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('does not silently truncate a message collection at the database page limit', async () => {
    state.tables.messages = Array.from({ length: 1002 }, (_, index) => ({
      id: `message-${index}`, conversation: { user_id: 'user-a' }, content: 'Mensaje ficticio',
    }));
    const response = await GET();
    expect((await response.json()).messages).toHaveLength(1002);
  });

  it.each(['messages', 'onboarding_sessions', 'research_dataset'])('fails visibly when %s cannot be read', async (table) => {
    state.failedTable = table;
    const response = await GET();
    expect(response.status).toBe(500);
    expect(response.headers.get('content-disposition')).toBeNull();
    expect(await response.json()).toMatchObject({ ok: false, error: 'export_failed' });
  });

  it('requires an authenticated session', async () => {
    state.authenticated = false;
    expect((await GET()).status).toBe(401);
  });
});
