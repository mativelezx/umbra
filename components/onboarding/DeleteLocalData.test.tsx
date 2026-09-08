import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams({ token: 'fixture-token' }) }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { signOut: () => new Promise(() => {}) } }) }));
import DeleteConfirmPage from '@/app/settings/delete/confirm/page';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
afterEach(() => vi.unstubAllGlobals());
it('clears the local draft immediately after confirmed deletion, before sign-out completes', async () => {
  useOnboardingStore.getState().bindUser('fixture-user');
  useOnboardingStore.getState().startSession('private-deleted-draft');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: true })));
  render(<DeleteConfirmPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar ahora' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Cuenta eliminada' })).toBeInTheDocument());
  expect(useOnboardingStore.getState().sessionId).toBeNull();
  expect(localStorage.getItem('umbra-onboarding')).toBeNull();
});
