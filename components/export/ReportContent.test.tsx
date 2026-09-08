import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE, DEMO_NARRATIVE } from '@/lib/demo/seed';
import { ReportContent } from './ReportContent';
import { createSelfReport } from '@/lib/assessment/bfi2s';

describe('print report preserves and explains the result', () => {
  it('prints questionnaire scores separately and does not add a second break after the cover', () => {
    const { container } = render(<ReportContent data={{ profile: { ...DEMO_PROFILE, analysisRaw: { ...DEMO_PROFILE.analysisRaw, selfReport: createSelfReport(Array(30).fill(3), '2026-09-07T12:00:00Z') } }, userName: 'Prueba', narrative: null, plan: null }} />);
    expect(screen.getAllByText('3,00 / 5')).toHaveLength(5);
    expect(screen.getAllByText('evidencia insuficiente — sin cifra')).toHaveLength(5);
    expect(container.querySelector('.pdf-self-report')).not.toHaveClass('pdf-new-page');
    expect(container).toHaveTextContent('no las predice la IA');
    expect(container).toHaveTextContent('No son percentiles');
    expect(screen.getByRole('img', { name: 'umbra', exact: true })).toBeInTheDocument();
  });
  it('retains full saved content, explains terms, and prints no unvalidated bars', () => {
    const { container } = render(<ReportContent data={{ profile: DEMO_PROFILE, userName: 'Persona ficticia', narrative: DEMO_NARRATIVE + '\n\nÚltimo párrafo conservado.', plan: { areas: [{ id: 'a', name: 'Una propuesta', rationale: 'Se en 18 y Ti alto (78).', actions: [{ id: 'b', title: 'Mirar un detalle', description: 'Descripción conservada.', microGoals: [{ text: 'Primer paso conservado.' }] }] }] } }} />);
    expect(container).toHaveTextContent('Último párrafo conservado.');
    expect(container).toHaveTextContent('Se (Sensación extravertida) en 18');
    expect(container).toHaveTextContent('Ti (Pensamiento introvertido) alto (78)');
    expect(container).toHaveTextContent('Descripción conservada.');
    expect(container).toHaveTextContent('Primer paso conservado.');
    expect(screen.getAllByText('evidencia insuficiente — sin cifra')).toHaveLength(5);
    expect(container.querySelectorAll('.pdf-bar')).toHaveLength(0);
    expect(container.querySelectorAll('.pdf-function')).toHaveLength(8);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Persona,');
    expect(container).toHaveTextContent('Por ejemplo: Notar el sonido, la temperatura');
    expect(container).toHaveTextContent('Algo con lo que no coincido o quiero revisar');
    expect(container.querySelectorAll('.pdf-notes')).toHaveLength(3);
    expect(container.querySelector('.pdf-cover-visual svg')).toBeInTheDocument();
    expect(container.querySelector('.pdf-action-opening svg')).toBeInTheDocument();
  });
  it('offers personal notes without inventing a missing narrative or plan', () => {
    const { container } = render(<ReportContent data={{ profile: DEMO_PROFILE, userName: null, narrative: null, plan: null }} />);
    expect(container.querySelector('.pdf-reading')).toBeNull();
    expect(container.querySelector('.pdf-action')).toBeNull();
    expect(container.querySelectorAll('.pdf-function')).toHaveLength(8);
    expect(container).toHaveTextContent('Lo importante');
    expect(container).not.toHaveTextContent('undefined');
  });
});
