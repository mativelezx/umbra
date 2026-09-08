import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  save: vi.fn(),
  authenticated: true,
  planCreated: '2026-09-07T12:00:00Z',
  areas: [{ id: 'a', name: 'Atención', rationale: 'Reflexión', actions: [{ id: 'walk', title: 'Caminar', description: 'Observar una hoja.', microGoals: [{ id: 'notice', text: 'Anotar un detalle', completed: false }] }] }],
}));
vi.mock('@/components/layout/LayoutShell', () => ({ LayoutShell: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({
  auth: { getUser: async () => ({ data: { user: db.authenticated ? { id: 'user-a' } : null } }) },
  from: (table: string) => {
    let updating = false;
    let minimumDate = '';
    const query = {
      select() { return query; }, eq() { return query; }, order() { return query; }, limit() { return query; },
      gte(_field: string, value: string) { minimumDate = value; return query; },
      update() { updating = true; return query; },
      maybeSingle() { return query; }, single() { return query; },
      then(resolve: (value: unknown) => unknown) {
        if (updating) return db.save().then(resolve);
        const data = table === 'psychological_profiles' ? { id: 'profile-a', updated_at: '2026-09-07T11:00:00Z' }
          : minimumDate && Date.parse(db.planCreated) < Date.parse(minimumDate) ? null
          : { id: 'plan-a', areas: db.areas, created_at: db.planCreated };
        return Promise.resolve(resolve({ data, error: null }));
      },
    };
    return query;
  },
}) }));

import PlanPage from '@/app/plan/page';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
  db.authenticated = true;
  db.planCreated = '2026-09-07T12:00:00Z';
  db.save.mockReset().mockResolvedValue({ data: { id: 'plan-a' }, error: null });
});

async function openActivity() {
  render(<PlanPage />);
  fireEvent.click(await screen.findByRole('button', { name: /abrir caminar/i }));
  return screen.getByRole('checkbox', { name: 'Anotar un detalle' });
}

describe('plan persistence', () => {
  it('rolls the checkbox back and explains a failed save', async () => {
    db.save.mockResolvedValue({ data: null, error: { message: 'fixture save failure' } });
    const checkbox = await openActivity();
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
    expect(screen.getByRole('alert')).toHaveTextContent(/no pudimos guardar/i);
  });

  it('blocks another change while the optimistic value is being saved', async () => {
    let finish: (value: unknown) => void = () => {};
    db.save.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const checkbox = await openActivity();
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeDisabled());
    expect(checkbox).toBeChecked();
    finish({ data: { id: 'plan-a' }, error: null });
    await waitFor(() => expect(checkbox).toBeEnabled());
    expect(checkbox).toBeChecked();
  });

  it('treats a successful response with no owned row updated as a failed save', async () => {
    db.save.mockResolvedValue({ data: null, error: null });
    const checkbox = await openActivity();
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
    expect(screen.getByRole('alert')).toHaveTextContent(/no pudimos guardar/i);
  });

  it('offers generation instead of displaying a plan from before reanalysis', async () => {
    db.planCreated = '2026-09-06T12:00:00Z';
    render(<PlanPage />);
    expect(await screen.findByRole('button', { name: 'Generar mi plan' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /abrir caminar/i })).not.toBeInTheDocument();
  });
});
