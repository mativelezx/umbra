import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ loading: true, user: { id: 'user-a' } as { id: string } | null }));
vi.mock('@/lib/providers/auth-context', () => ({ useAuth: () => auth }));
vi.mock('@/components/onboarding/ModeSelector', () => ({ ModeSelector: ({ onPick }: { onPick: (mode: string) => void }) => <button onClick={() => onPick('dynamic')}>pick mode</button> }));
vi.mock('@/components/onboarding/DynamicFlow', () => ({ DynamicFlow: () => <div>Private flow</div> }));
vi.mock('@/components/onboarding/CartaForm', () => ({ CartaForm: () => null }));
vi.mock('@/components/onboarding/SeedFromChatgptFlow', () => ({ SeedFromChatgptFlow: () => null }));
import OnboardingPage from '@/app/onboarding/page';
beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false'); auth.loading = true; auth.user = { id: 'user-a' }; });
it('does not mount a resumable flow before identity has been checked', () => {
  render(<OnboardingPage />);
  expect(screen.queryByRole('button', { name: 'pick mode' })).not.toBeInTheDocument();
});
it('resets the mounted flow when the account changes', () => {
  auth.loading = false;
  const { rerender } = render(<OnboardingPage />);
  fireEvent.click(screen.getByRole('button', { name: 'pick mode' }));
  expect(screen.getByText('Private flow')).toBeInTheDocument();
  auth.user = { id: 'user-b' };
  rerender(<OnboardingPage />);
  expect(screen.queryByText('Private flow')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'pick mode' })).toBeInTheDocument();
});
