// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({
  token: true, profile: true, authFails: true, purgeFails: false, authCalls: 0,
  expires: '2099-01-01', used: null as string | null, owner: 'user-a',
}));
vi.mock('@/lib/security/peppers', () => ({ computeHash: async (kind: string) => `${kind}-hash` }));
vi.mock('@/lib/supabase/server', () => {
  function from(table: string) {
    let deleting = false;
    const query = {
      select() { return query; }, eq() { return query; }, in() { return query; },
      maybeSingle() { return query; }, update() { return query; }, delete() { deleting = true; return query; },
      then(resolve: (value: unknown) => unknown) {
        if (deleting && table === 'profiles') { state.profile = false; state.token = false; }
        if (deleting && table === 'delete_confirmations') state.token = false;
        if (deleting && table === 'research_dataset' && state.purgeFails) return Promise.resolve(resolve({ data: null, error: { message: 'fixture failure' } }));
        const data = table === 'delete_confirmations' && !deleting ? state.token ? { id: 'token-a', user_id: state.owner, used_at: state.used, expires_at: state.expires } : null : [];
        return Promise.resolve(resolve({ data, error: null }));
      },
    };
    return query;
  }
  const client = { from, auth: {
    getUser: async () => ({ data: { user: { id: 'user-a' } } }),
    admin: { deleteUser: async () => {
      state.authCalls++;
      if (state.authFails) return { error: { message: 'Auth unavailable' } };
      state.profile = false; state.token = false;
      return { error: null };
    } },
  } };
  return { createClient: async () => client, createServiceClient: () => client };
});
import { POST } from '@/app/api/account/delete/confirm/route';
function request(purgeResearch = false) { return new Request('http://localhost/api/account/delete/confirm', { method: 'POST', body: JSON.stringify({ token: 'fixture-token-123456', purgeResearch }) }); }
beforeEach(() => { Object.assign(state, { token: true, profile: true, authFails: true, purgeFails: false, authCalls: 0, expires: '2099-01-01', used: null, owner: 'user-a' }); });

it('preserves the confirmation and profile when Auth fails so the same link can retry', async () => {
  expect((await POST(request())).status).toBe(500);
  expect(state.profile).toBe(true);
  expect(state.token).toBe(true);
  state.authFails = false;
  expect((await POST(request())).status).toBe(200);
  expect(state.token).toBe(false);
  expect(state.profile).toBe(false);
});
it('does not delete Auth if requested research purge fails', async () => {
  state.purgeFails = true;
  const response = await POST(request(true));
  expect(response.status).toBe(500);
  expect(state.authCalls).toBe(0);
  expect(state.token).toBe(true);
});
it.each([['expired', 410], ['used', 409], ['other-owner', 403]] as const)('rejects a %s confirmation without deleting anything', async (kind, code) => {
  if (kind === 'expired') state.expires = '2020-01-01';
  if (kind === 'used') state.used = '2026-09-01';
  if (kind === 'other-owner') state.owner = 'user-b';
  expect((await POST(request())).status).toBe(code);
  expect(state.profile).toBe(true);
  expect(state.authCalls).toBe(0);
});
