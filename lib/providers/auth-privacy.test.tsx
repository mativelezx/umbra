import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';
import { beforeEach, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({
  callback: (_event: string, _session: Session | null) => {},
  initial: null as Session | null,
  getSession: vi.fn(), signOut: vi.fn(),
}));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {
  getSession: auth.getSession, signOut: auth.signOut,
  onAuthStateChange: (callback: typeof auth.callback) => { auth.callback = callback; return { data: { subscription: { unsubscribe() {} } } }; },
} }) }));
import { AuthProvider, useAuth } from './auth-context';
import { useOnboardingStore } from '@/lib/store/onboarding-store';

const session = (id: string) => ({ user: { id }, access_token: 'fixture-only' }) as Session;
function View() {
  const { user, loading, signOut } = useAuth();
  return <><span>{loading ? 'loading' : user?.id ?? 'signed-out'}</span><button onClick={() => void signOut()}>sign out</button></>;
}
beforeEach(() => {
  localStorage.clear();
  useOnboardingStore.getState().reset();
  useOnboardingStore.setState({ ownerId: null });
  auth.initial = session('user-a');
  auth.getSession.mockReset().mockImplementation(async () => ({ data: { session: auth.initial } }));
  auth.signOut.mockReset().mockResolvedValue({ error: null });
});
async function openWithPrivateDraft() {
  render(<AuthProvider><View /></AuthProvider>);
  await screen.findByText('user-a');
  act(() => useOnboardingStore.getState().startSession('private-draft-a'));
  expect(localStorage.getItem('umbra-onboarding')).toContain('private-draft-a');
}
it.each([session('user-b'), null])('clears persisted onboarding when identity changes: %j', nextSession => {
  return (async () => {
    await openWithPrivateDraft();
    act(() => auth.callback(nextSession ? 'SIGNED_IN' : 'SIGNED_OUT', nextSession));
    expect(useOnboardingStore.getState().sessionId).toBeNull();
    expect(localStorage.getItem('umbra-onboarding') ?? '').not.toContain('private-draft-a');
  })();
});
it('keeps the current user draft during token refresh', async () => {
  await openWithPrivateDraft();
  act(() => auth.callback('TOKEN_REFRESHED', session('user-a')));
  expect(useOnboardingStore.getState().sessionId).toBe('private-draft-a');
});
it('clears local data before waiting for sign-out to finish', async () => {
  await openWithPrivateDraft();
  auth.signOut.mockImplementation(() => new Promise(() => {}));
  fireEvent.click(screen.getByRole('button', { name: 'sign out' }));
  expect(useOnboardingStore.getState().sessionId).toBeNull();
  expect(localStorage.getItem('umbra-onboarding') ?? '').not.toContain('private-draft-a');
});
it('does not restore an older identity when getSession resolves after a newer auth event', async () => {
  let resolveInitial: (value: { data: { session: Session | null } }) => void = () => {};
  auth.getSession.mockImplementation(() => new Promise(resolve => { resolveInitial = resolve; }));
  render(<AuthProvider><View /></AuthProvider>);
  act(() => auth.callback('SIGNED_IN', session('user-b')));
  await act(async () => resolveInitial({ data: { session: session('user-a') } }));
  await waitFor(() => expect(screen.getByText('user-b')).toBeInTheDocument());
});
it('clears an unowned draft left by a legacy browser session', async () => {
  useOnboardingStore.setState({ sessionId: 'legacy-private-draft' });
  render(<AuthProvider><View /></AuthProvider>);
  await screen.findByText('user-a');
  expect(useOnboardingStore.getState().sessionId).toBeNull();
});
