import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileWorkspace } from './ProfileWorkspace';

function Reading() {
  const [page, setPage] = useState(1);
  return <button onClick={() => setPage(page + 1)}>Pasaje {page}</button>;
}

describe('Explore a profile without losing context', () => {
  it('moves the guided entry into the reading panel without resetting the current passage', async () => {
    render(<ProfileWorkspace reading={<Reading />} measurement={<p>Estimación experimental.</p>} interpretation={<p>Interpretación simbólica.</p>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pasaje 1' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Datos del modelo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Leer mi resultado' }));

    await waitFor(() => expect(screen.getByRole('tabpanel', { name: 'Tu lectura' })).toHaveFocus());
    expect(screen.getByRole('tab', { name: 'Tu lectura' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Pasaje 2' })).toBeVisible();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });
  it('keeps the current reading position when visiting the measurement panel', () => {
    render(<ProfileWorkspace reading={<Reading />} measurement={<p>Estimación experimental.</p>} interpretation={<p>Interpretación simbólica.</p>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pasaje 1' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Datos del modelo' }));
    expect(screen.getByText('Estimación experimental.')).toBeVisible();
    expect(screen.getByText('Pasaje 2')).not.toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Tu lectura' }));
    expect(screen.getByRole('button', { name: 'Pasaje 2' })).toBeVisible();
  });
  it('supports keyboard selection and exposes only one panel', () => {
    render(<ProfileWorkspace reading="Lectura" measurement="Medición" interpretation="Símbolo" />);
    const first = screen.getByRole('tab', { name: 'Tu lectura' });
    first.focus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Lectura simbólica' })).toHaveFocus();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Símbolo');
  });
});
