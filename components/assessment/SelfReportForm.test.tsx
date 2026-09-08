import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createSelfReport } from '@/lib/assessment/bfi2s';
const auth = vi.hoisted(() => ({ user: { id: 'owner' } }));
vi.mock('@/lib/providers/auth-context', () => ({ useAuth: () => auth }));
import { SelfReportForm } from './SelfReportForm';
const request = vi.fn();
beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_DEMO_MODE','false'); vi.stubGlobal('fetch', request); request.mockReset(); });
afterEach(() => vi.unstubAllGlobals());
function complete() {
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Empezar las 30 preguntas' }));
  for (let page=0; page<5; page++) {
    screen.getAllByRole('radio').filter((_,i) => i%5 === 2).forEach(radio => fireEvent.click(radio));
    fireEvent.click(screen.getByRole('button', { name: page < 4 ? 'Siguientes 6' : 'Guardar y ver mi resultado' }));
  }
}
it('requires opt-in, keeps all questions unanswered, and allows skipping', () => {
  const next=vi.fn(); render(<SelfReportForm profileId="fixture" onContinue={next} />);
  expect(screen.getByRole('button', { name: 'Empezar las 30 preguntas' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
  expect(next).toHaveBeenCalledOnce(); expect(request).not.toHaveBeenCalled();
});
it('saves exactly 30 responses, without client scores or ML fields', async () => {
  request.mockResolvedValue({ ok: true, json: async () => ({ ok: true, data: { selfReport: createSelfReport(Array(30).fill(3), '2026-09-07T00:00:00Z') } }) });
  render(<SelfReportForm profileId="fixture" onContinue={() => {}} />); complete();
  await screen.findByText('Tus respuestas quedaron guardadas.');
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ profileId:'fixture', instrument:'bfi-2-s-es-30-v1', answers:Array(30).fill(3), accepted:true });
  expect(screen.getAllByLabelText(/sobre 5/)).toHaveLength(5);
});
it('retains answers after a network error so saving can be retried', async () => {
  request.mockRejectedValue(new Error('offline'));
  render(<SelfReportForm profileId="fixture" onContinue={() => {}} />); complete();
  await screen.findByRole('alert');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar y ver mi resultado' })).toBeEnabled());
  expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(6);
});
