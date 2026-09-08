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
    render(<ProfileWorkspace questionnaire={<p>Mis respuestas</p>} reading={<Reading />} measurement={<p>Estimación experimental.</p>} interpretation={<p>Interpretación simbólica.</p>} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tu lectura' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pasaje 1' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Otras miradas' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Tu lectura' }));

    await waitFor(() => expect(screen.getByRole('tabpanel', { name: 'Tu lectura' })).toBeVisible());
    expect(screen.getByRole('tab', { name: 'Tu lectura' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Pasaje 2' })).toBeVisible();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });
  it('keeps the current reading position when visiting the measurement panel', () => {
    render(<ProfileWorkspace questionnaire={<p>Mis respuestas</p>} reading={<Reading />} measurement={<p>Estimación experimental.</p>} interpretation={<p>Interpretación simbólica.</p>} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tu lectura' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pasaje 1' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Otras miradas' }));
    fireEvent.click(screen.getByText('Ver el módulo experimental de ML'));
    expect(screen.getByText('Estimación experimental.')).toBeVisible();
    expect(screen.getByText('Pasaje 2')).not.toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Tu lectura' }));
    expect(screen.getByRole('button', { name: 'Pasaje 2' })).toBeVisible();
  });
  it('supports keyboard selection and exposes only one panel', () => {
    render(<ProfileWorkspace questionnaire="Mis respuestas" reading="Lectura" measurement="Medición" interpretation="Símbolo" />);
    const first = screen.getByRole('tab', { name: 'Tu cuestionario' });
    first.focus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Otras miradas' })).toHaveFocus();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Símbolo');
  });
  it('opens the questionnaire first and does not mount the AI reading until requested', async () => {
    render(<ProfileWorkspace questionnaire={<p>Mis respuestas</p>} reading={<Reading />} measurement="Medición" interpretation="Símbolo" />);
    expect(screen.getByRole('tabpanel', { name: 'Tu cuestionario' })).toHaveTextContent('Mis respuestas');
    expect(screen.queryByText('Pasaje 1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Tu lectura' }));
    expect(screen.getByRole('button', { name: 'Pasaje 1' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Ver mi cuestionario' }));
    await waitFor(() => expect(screen.getByRole('tabpanel', { name: 'Tu cuestionario' })).toHaveFocus());
    expect(screen.getByRole('tab', { name: 'Tu cuestionario' })).toHaveAttribute('aria-selected', 'true');
  });
});
