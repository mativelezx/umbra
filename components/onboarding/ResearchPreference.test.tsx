import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/components/layout/LayoutShell', () => ({ LayoutShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'fixture-user' } } }) }, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { research_opt_in: true }, error: null }) }) }) }) }) }));
import ResearchPage from '@/app/settings/research-opt-out/page';
afterEach(() => vi.unstubAllGlobals());
it('shows an incomplete purge and lets the user retry without restoring participation', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ ok: false, error: 'research_purge_failed', research_opt_in: false }, { status: 500 }))
    .mockResolvedValueOnce(Response.json({ ok: true, data: { research_opt_in: false, purged_records: 2 } }));
  vi.stubGlobal('fetch', fetchMock);
  render(<ResearchPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Salir de investigación' }));
  expect(await screen.findByText('No participando')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(/no pudimos borrar/i);
  fireEvent.click(screen.getByRole('button', { name: /eliminar contribuciones anteriores/i }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ research_opt_in: false, purge_existing: true });
  expect(await screen.findByText(/Borramos 2 registros previos/)).toBeInTheDocument();
});
