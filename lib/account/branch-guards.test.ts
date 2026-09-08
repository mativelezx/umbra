// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ authenticated: true, consent: true, owned: true, failTable: '',
  writes: [] as string[], filters: [] as [string, string, unknown][], fullName: '', load: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => client() }));
vi.mock('@/lib/supabase/edge', () => ({ createEdgeClient: () => client(), createEdgeServiceClient: () => client() }));
vi.mock('@/lib/onboarding/session-store', () => ({ loadSession: state.load, undoLastAnsweredTurn: vi.fn() }));
function client() {
  return { auth: { getUser: async () => ({ data: { user: state.authenticated ? { id: 'owner' } : null } }) },
    from(table: string) {
      let mutation = false;
      const query = {
        select() { return query; }, limit() { return query; },
        eq(key: string, value: unknown) { state.filters.push([table,key,value]); return query; },
        insert() { state.writes.push(table); mutation = true; return query; },
        update(value: { full_name?: string }) { state.writes.push(table); state.fullName = value.full_name ?? ''; mutation = true; return query; },
        single() { return Promise.resolve(result()); }, maybeSingle() { return Promise.resolve(result()); },
      };
      function result() {
        if (state.failTable === table) return { data: null, error: { message: 'fixture unavailable' } };
        if (mutation) return { data: { id: 'saved', full_name: state.fullName, unlock_at: '2027-03-06T00:00:00Z' }, error: null };
        return { data: (table === 'consent_records' ? state.consent : state.owned) ? { id: 'owned' } : null, error: null };
      }
      return query;
    } };
}
import { POST as letter } from '@/app/api/carta/route';
import { POST as undo } from '@/app/api/onboarding/undo/route';
import { PATCH as profile } from '@/app/api/account/profile/route';
const id = '00000000-0000-4000-8000-000000000001';
const request = (path: string, data: unknown) => new Request(`http://localhost/api/${path}`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(data) });
beforeEach(() => { Object.assign(state,{authenticated:true,consent:true,owned:true,failTable:'',fullName:''}); state.writes=[]; state.filters=[]; state.load.mockReset(); });

describe('letter ownership and consent', () => {
  const run = () => letter(request('carta',{ profileId:id, content:'Carta ficticia de prueba con un texto válido para persistir.' }));
  it.each([['authenticated',401],['consent',403],['owned',404]] as const)('rejects missing %s before saving',async (key,status) => {
    state[key]=false; expect((await run()).status).toBe(status); expect(state.writes).toEqual([]);
  });
  it.each(['consent_records','psychological_profiles'])('does not save during %s outage', async table => {
    state.failTable=table; expect((await run()).status).toBe(503); expect(state.writes).toEqual([]);
  });
  it('checks both profile ID and owner before insert',async () => {
    expect((await run()).status).toBe(200);
    expect(state.filters).toContainEqual(['psychological_profiles','id',id]);
    expect(state.filters).toContainEqual(['psychological_profiles','user_id','owner']);
    expect(state.writes).toEqual(['future_letters']);
  });
});
it('undo never calls the create-on-miss loader for an absent or foreign session',async () => {
  state.owned=false;
  expect((await undo(request('onboarding/undo',{sessionId:id}))).status).toBe(404);
  expect(state.load).not.toHaveBeenCalled(); expect(state.writes).toEqual([]);
});
it('undo distinguishes storage outage and does not create a session',async () => {
  state.failTable='onboarding_sessions';
  expect((await undo(request('onboarding/undo',{sessionId:id}))).status).toBe(503);
  expect(state.load).not.toHaveBeenCalled();
});
it.each(['',' ','\n\t'])('rejects an empty trimmed profile name %j',async name => {
  expect((await profile(request('account/profile',{full_name:name}))).status).toBe(400); expect(state.writes).toEqual([]);
});
it('trims a nonempty profile name without losing accents',async () => {
  expect((await profile(request('account/profile',{full_name:'  Ángela  '}))).status).toBe(200);
  expect(state.fullName).toBe('Ángela');
});
