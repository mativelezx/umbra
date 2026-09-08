import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import ConsentPage from '@/app/consent/page';
import { computeConsentTextHash } from '@/lib/consent/text-v1-es-AR';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
afterEach(() => vi.unstubAllGlobals());

it('submits the hash of the complete text the person can read on screen', async () => {
  let submitted: { consentTextHash: string } | null = null;
  vi.stubGlobal('fetch', async (_url: string, options: RequestInit) => {
    submitted = JSON.parse(String(options.body));
    return { ok: true };
  });
  render(<ConsentPage />);
  const region = screen.getByRole('region', { name: 'Información sobre el consentimiento' });
  const visibleHash = await computeConsentTextHash(region.textContent ?? '');
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  fireEvent.click(screen.getByRole('button', { name: /de acuerdo/i }));
  await waitFor(() => expect(submitted).not.toBeNull());
  expect(submitted).toMatchObject({ consentTextHash: visibleHash });
});

it('provides a named keyboard-focusable region for scrolling the consent information', () => {
  render(<ConsentPage />);
  const region = screen.getByRole('region', { name: 'Información sobre el consentimiento' });
  expect(region).toHaveAttribute('tabindex', '0');
  region.focus();
  expect(region).toHaveFocus();
  expect(region).toHaveTextContent('Umbra no es terapia');
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});
