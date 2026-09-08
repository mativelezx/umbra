// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const fixture = vi.hoisted(() => ({ optedIn: true, purgeError: null as unknown, count: 2 as number | null, purges: 0 }));
vi.mock('@/lib/security/peppers', () => ({ computeHash: async () => 'fixture-user-hash' }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'fixture-user' } } }) },
    from: () => ({ update: (value: { research_opt_in: boolean }) => { fixture.optedIn = value.research_opt_in; return { eq: () => ({ select: () => ({ single: async () => ({ data: { research_opt_in: fixture.optedIn }, error: null }) }) }) }; } }) }),
  createServiceClient: () => ({ from: () => ({ delete: () => ({ eq: async () => { fixture.purges++; return { count: fixture.count, error: fixture.purgeError }; } }) }) }),
}));
import { POST } from '@/app/api/account/research-opt-out/route';
const request = () => new Request('http://localhost/api/account/research-opt-out', { method: 'POST', body: JSON.stringify({ research_opt_in: false, purge_existing: true }) });
beforeEach(() => { fixture.optedIn = true; fixture.purgeError = null; fixture.count = 2; fixture.purges = 0; });
it.each([{ message: 'fixture database failure' }, null])('does not claim deletion when its result is unverified: %j', async error => {
  fixture.purgeError = error;
  fixture.count = null;
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect(await response.json()).toMatchObject({ ok: false, error: 'research_purge_failed', research_opt_in: false });
  expect(fixture.optedIn).toBe(false);
});
it('can retry a failed purge without opting back into research', async () => {
  fixture.purgeError = { message: 'fixture failure' };
  await POST(request());
  fixture.purgeError = null;
  const response = await POST(request());
  expect(await response.json()).toMatchObject({ ok: true, data: { research_opt_in: false, purged_records: 2 } });
  expect(fixture.optedIn).toBe(false);
  expect(fixture.purges).toBe(2);
});
