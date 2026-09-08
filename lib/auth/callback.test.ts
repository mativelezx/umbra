// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  exchange: vi.fn(),
  getUser: vi.fn(),
  send: vi.fn(),
  tasks: [] as Array<() => Promise<void>>,
}));

vi.mock('next/server', async (original) => ({
  ...await original<typeof import('next/server')>(),
  after: (task: () => Promise<void>) => { mocks.tasks.push(task); },
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: {
    exchangeCodeForSession: mocks.exchange,
    getUser: mocks.getUser,
  } }),
}));
vi.mock('@/lib/email/resend', () => ({ sendWelcomeEmail: mocks.send }));

import { GET } from '@/app/auth/callback/route';

const user = () => ({
  id: 'synthetic-confirmed-user',
  email: 'synthetic@example.com',
  created_at: new Date().toISOString(),
});
const request = (next = '/consent') => new Request(
  `https://umbra.example/auth/callback?code=synthetic&next=${encodeURIComponent(next)}`,
);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.tasks.length = 0;
  mocks.exchange.mockResolvedValue({ data: { user: user() }, error: null });
  mocks.getUser.mockResolvedValue({ data: { user: null } });
  mocks.send.mockResolvedValue(undefined);
});

it('welcomes a newly confirmed account after returning the authenticated redirect', async () => {
  const response = await GET(request());
  expect(response.headers.get('location')).toBe('https://umbra.example/consent');
  expect(mocks.send).not.toHaveBeenCalled();
  expect(mocks.tasks).toHaveLength(1);
  await mocks.tasks[0]();
  expect(mocks.send).toHaveBeenCalledWith({
    to: 'synthetic@example.com',
    siteUrl: 'https://umbra.example',
    idempotencyKey: 'umbra-welcome-synthetic-confirmed-user',
  });
});

it('does not turn a provider failure into a failed account confirmation', async () => {
  mocks.send.mockRejectedValue(new Error('synthetic provider failure'));
  expect((await GET(request())).headers.get('location')).toBe('https://umbra.example/consent');
  expect(mocks.tasks).toHaveLength(1);
  await expect(mocks.tasks[0]()).resolves.toBeUndefined();
});

it('does not send a welcome from the recovery callback', async () => {
  expect((await GET(request('/reset-password'))).headers.get('location')).toBe('https://umbra.example/reset-password');
  expect(mocks.tasks).toHaveLength(0);
  expect(mocks.send).not.toHaveBeenCalled();
});

it('does not resend when a used code is opened with an existing session', async () => {
  mocks.exchange.mockResolvedValue({ data: { user: null }, error: { message: 'code already used' } });
  mocks.getUser.mockResolvedValue({ data: { user: user() } });
  expect((await GET(request())).headers.get('location')).toBe('https://umbra.example/consent');
  expect(mocks.tasks).toHaveLength(0);
});

it('does not send after an invalid exchange without a session', async () => {
  mocks.exchange.mockResolvedValue({ data: { user: null }, error: { message: 'code expired' } });
  expect((await GET(request())).headers.get('location')).toBe('https://umbra.example/auth/auth-code-error?reason=expired');
  expect(mocks.tasks).toHaveLength(0);
});

it('does not welcome an older account after a new code exchange', async () => {
  mocks.exchange.mockResolvedValue({ data: { user: { ...user(), created_at: '2020-01-01' } }, error: null });
  await GET(request());
  for (const task of mocks.tasks) await task();
  expect(mocks.send).not.toHaveBeenCalled();
});

it.each(['//foreign.example', '/\\foreign.example', 'https://foreign.example'])('rejects an unsafe next path: %s', async (next) => {
  expect((await GET(request(next))).headers.get('location')).toBe('https://umbra.example/consent');
});

it('does not exchange or send without a code', async () => {
  expect((await GET(new Request('https://umbra.example/auth/callback'))).headers.get('location'))
    .toBe('https://umbra.example/auth/auth-code-error?reason=pkce');
  expect(mocks.exchange).not.toHaveBeenCalled();
  expect(mocks.tasks).toHaveLength(0);
});
