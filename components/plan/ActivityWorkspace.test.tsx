import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActivityWorkspace } from './ActivityWorkspace';
import type { DevelopmentArea } from '@/types';

const areas: DevelopmentArea[] = [{ id: 'a', name: 'Prestar atención', rationale: 'Una propuesta opcional.', actions: [
  { id: 'walk', title: 'Caminar', description: 'Observar una hoja.', microGoals: [{ id: 'notice', text: 'Anotar un detalle', completed: false }] },
  { id: 'write', title: 'Escribir', description: 'Tomar una pausa.', microGoals: [{ id: 'note', text: 'Escribir una frase', completed: false }] },
] }];
function Example() {
  const [value, setValue] = useState(areas);
  return <ActivityWorkspace areas={value} onToggle={(areaId, actionId, goalId) => setValue(current => current.map(area => area.id !== areaId ? area : { ...area, actions: area.actions.map(action => action.id !== actionId ? action : { ...action, microGoals: action.microGoals.map(goal => goal.id !== goalId ? goal : { ...goal, completed: !goal.completed }) }) }))} />;
}
describe('Focused activities', () => {
  it('reports the checked steps of each activity and updates the count after returning', async () => {
    render(<Example />);
    expect(screen.getByRole('button', { name: /abrir caminar/i })).toHaveAccessibleDescription('0 de 1 pasos completados');
    fireEvent.click(screen.getByRole('button', { name: /abrir caminar/i }));
    expect(screen.getByRole('heading', { name: 'Caminar' })).toHaveFocus();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Anotar un detalle' }));
    fireEvent.click(screen.getByRole('button', { name: /volver a actividades/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /abrir caminar/i })).toHaveFocus());
    expect(screen.getByRole('button', { name: /abrir caminar/i })).toHaveAccessibleDescription('1 de 1 pasos completados');
    expect(screen.getByRole('button', { name: /abrir escribir/i })).toHaveAccessibleDescription('0 de 1 pasos completados');
  });
  it('opens the chosen activity and retains checked steps when returning', async () => {
    render(<Example />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /abrir caminar/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Anotar un detalle' }));
    fireEvent.click(screen.getByRole('button', { name: /volver a actividades/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /abrir caminar/i })).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: /abrir escribir/i }));
    expect(screen.queryByText('Observar una hoja.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /volver a actividades/i }));
    fireEvent.click(screen.getByRole('button', { name: /abrir caminar/i }));
    expect(screen.getByRole('checkbox', { name: 'Anotar un detalle' })).toBeChecked();
  });
  it('prevents another edit while a save is pending', () => {
    render(<ActivityWorkspace areas={areas} onToggle={() => {}} saving />);
    fireEvent.click(screen.getByRole('button', { name: /abrir caminar/i }));
    expect(screen.getByRole('checkbox', { name: 'Anotar un detalle' })).toBeDisabled();
  });
});
