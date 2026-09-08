// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ user: 'owner' as string | null, consent: true, conflict: false, error: false, writes: [] as Record<string, unknown>[], filters: [] as [string, unknown][], owner: 'owner' }));
const id = '123e4567-e89b-12d3-a456-426614174000';
vi.mock('@/lib/supabase/edge', () => ({ createEdgeClient: (_req: Request, response: Response) => {
  response.headers.set('set-cookie', 'fixture=refreshed; HttpOnly');
  return { auth: { getUser: async () => ({ data: { user: state.user ? { id: state.user } : null } }) }, from: (table: string) => {
    const filters: [string, unknown][] = [];
    let write: Record<string, unknown> | null = null;
    const query = {
      select: () => query, limit: () => query,
      eq: (key: string, value: unknown) => { filters.push([key,value]); state.filters.push([key,value]); return query; },
      update: (value: Record<string, unknown>) => { write = value; return query; },
      maybeSingle: async () => {
        if (table === 'consent_records') return { data: state.consent ? { id: 'consent' } : null, error: null };
        if (state.error) return { data: null, error: { message: 'unavailable' } };
        const own = filters.some(([key, value]) => key === 'user_id' && value === state.owner);
        if (!own) return { data: null, error: null };
        if (write) {
          if (state.conflict) return { data: null, error: null };
          state.writes.push(write);
          return { data: { id: 'saved' }, error: null };
        }
        return { data: { id: 'fixture', updated_at: '2026-09-07T00:00:00Z', analysis_raw: { reasoning: 'preserve', ml: { modelVersion: 'ridge_v1' } } }, error: null };
      },
    };
    return query;
  } };
} }));
import { POST } from '@/app/api/self-report/route';
const body = () => ({ profileId: id, instrument: 'bfi-2-s-es-30-v1', accepted: true, answers: Array(30).fill(3) });
const send = (input: unknown = body(), origin = 'http://localhost') => POST(new Request('http://localhost/api/self-report', { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(input) }));
beforeEach(() => { state.user='owner'; state.owner='owner'; state.consent=true; state.conflict=false; state.error=false; state.writes=[]; state.filters=[]; });
describe('independent self-report storage', () => {
  it('scores on the server, preserves ML and refresh cookies, and scopes the update', async () => {
    const response = await send();
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('refreshed');
    const result = await response.json();
    expect(result.data.selfReport.scores.openness).toBe(3);
    expect(state.writes[0].analysis_raw).toMatchObject({ reasoning: 'preserve', ml: { modelVersion: 'ridge_v1' }, selfReport: { source: 'self_report', researchUse: false } });
    expect(state.filters).toContainEqual(['updated_at','2026-09-07T00:00:00Z']);
    expect(state.filters.filter(([key]) => key === 'user_id')).toHaveLength(3);
  });
  it('requires authentication', async () => { state.user=null; expect((await send()).status).toBe(401); expect(state.writes).toEqual([]); });
  it('requires existing app consent', async () => { state.consent=false; expect((await send()).status).toBe(403); expect(state.writes).toEqual([]); });
  it('does not write another user profile', async () => { state.owner='other'; expect((await send()).status).toBe(404); expect(state.writes).toEqual([]); });
  it.each([{ accepted: false }, { answers: Array(29).fill(3) }, { scores: { openness: 100 } }, { instrument: 'invented' }])('rejects tampering or missing permission: %j', async change => {
    expect((await send({ ...body(), ...change })).status).toBe(400); expect(state.writes).toEqual([]);
  });
  it('rejects cross-origin writes', async () => { expect((await send(body(), 'https://untrusted.example')).status).toBe(403); expect(state.writes).toEqual([]); });
  it('accepts the browser host when the Edge adapter normalizes its internal URL', async () => {
    const response = await POST(new Request('http://localhost:3026/api/self-report', { method: 'POST', headers: { 'content-type': 'application/json', host: '127.0.0.1:3026', origin: 'http://127.0.0.1:3026' }, body: JSON.stringify(body()) }));
    expect(response.status).toBe(200);
  });
  it('does not overwrite a concurrent change', async () => { state.conflict=true; expect((await send()).status).toBe(409); expect(state.writes).toEqual([]); });
  it('reports storage failure rather than success', async () => { state.error=true; expect((await send()).status).toBe(503); expect(state.writes).toEqual([]); });
});
