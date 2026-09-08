import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/components/onboarding/LiveProfilePanel', () => ({ LiveProfilePanel: () => null }));
vi.mock('@/components/onboarding/QuestionCard', () => ({ QuestionCard: () => null }));
import { DynamicFlow } from './DynamicFlow';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { emptyWorkingProfile } from '@/lib/prompts/onboarding-conductor';
import { DEMO_ONBOARDING_SCRIPT } from '@/lib/demo/onboarding-script';
afterEach(() => vi.unstubAllGlobals());
it.each(['account-change', 'unmount'])('ignores a late onboarding response after %s', async reason => {
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
  useOnboardingStore.getState().bindUser('fixture-a');
  useOnboardingStore.getState().reset();
  let resolveResponse: (response: Response) => void = () => {};
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(resolve => { resolveResponse = resolve; })));
  const { unmount } = render(<DynamicFlow onComplete={vi.fn()} />);
  if (reason === 'account-change') act(() => useOnboardingStore.getState().bindUser('fixture-b'));
  else { unmount(); useOnboardingStore.getState().reset(); }
  await act(async () => resolveResponse(Response.json({ ok: true, data: {
    sessionId: 'private-old-account-session', workingProfile: emptyWorkingProfile(), insights: [], turnNumber: 1, done: false,
    turn: { question: DEMO_ONBOARDING_SCRIPT[0].question, answer: null, signals: [], insights: [] },
  } })));
  expect(useOnboardingStore.getState().sessionId).toBeNull();
  expect(localStorage.getItem('umbra-onboarding') ?? '').not.toContain('private-old-account-session');
});
