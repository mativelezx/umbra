import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
const navigation = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
import ConsentPage from '@/app/consent/page';
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
it('shows unavailable service without advancing when the required consent RPC is missing', async () => {
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 503 }));
  render(<ConsentPage />);
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  fireEvent.click(screen.getByRole('button', { name: /de acuerdo/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('servicio de consentimiento no está disponible');
  expect(navigation.push).not.toHaveBeenCalled();
});
