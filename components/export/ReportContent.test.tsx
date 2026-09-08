import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE, DEMO_NARRATIVE } from '@/lib/demo/seed';
import { ReportContent } from './ReportContent';
import { createSelfReport } from '@/lib/assessment/bfi2s';

describe('print report preserves and explains the result', () => {
  it('prints questionnaire scores separately and does not add a second break after the cover', () => {
    const { container } = render(<ReportContent data={{ profile: { ...DEMO_PROFILE, analysisRaw: { ...DEMO_PROFILE.analysisRaw, selfReport: createSelfReport(Array(30).fill(3), '2026-09-08T01:30:00Z') } }, userName: 'Prueba', narrative: null, plan: null }} />);
    expect(screen.getAllByText('3,00 / 5')).toHaveLength(5);
    expect(container.querySelectorAll('.pdf-ml-appendix .pdf-dimension')).toHaveLength(0);
    expect(screen.queryByText('evidencia insuficiente — sin cifra')).not.toBeInTheDocument();
    expect(container.querySelector('.pdf-ml-appendix')).toHaveTextContent(/tu cuestionario ya tiene/i);
    expect(container.querySelector('.pdf-self-report')).not.toHaveClass('pdf-new-page');
    expect(container).toHaveTextContent('no las predice la IA');
    expect(container).toHaveTextContent('No son percentiles');
    expect(container).toHaveTextContent('Completado el 7 de septiembre de 2026.');
    expect(screen.getByRole('img', { name: /^umbra$/ })).toBeInTheDocument();
  });
  it('retains full saved content, explains terms, and prints no unvalidated bars', () => {
    const { container } = render(<ReportContent data={{ profile: DEMO_PROFILE, userName: 'Persona ficticia', narrative: DEMO_NARRATIVE + '\n\nÚltimo párrafo conservado.', plan: { areas: [{ id: 'a', name: 'Una propuesta', rationale: 'Se en 18 y Ti alto (78).', actions: [{ id: 'b', title: 'Mirar un detalle', description: 'Descripción conservada.', microGoals: [{ text: 'Primer paso conservado.' }] }] }] } }} />);
    expect(container).toHaveTextContent('Último párrafo conservado.');
    expect(container).toHaveTextContent('Se (Sensación extravertida) en 18');
    expect(container).toHaveTextContent('Ti (Pensamiento introvertido) alto (78)');
    expect(container).toHaveTextContent('Descripción conservada.');
    expect(container).toHaveTextContent('Primer paso conservado.');
    expect(container.querySelectorAll('.pdf-ml-appendix .pdf-dimension')).toHaveLength(0);
    expect(screen.queryByText('evidencia insuficiente — sin cifra')).not.toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: 'Tu cuestionario está pendiente.' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Completar mi cuestionario en Umbra' })).toHaveAttribute('href', 'https://umbra-sigma.vercel.app/assessment');
  });
  it('places the user questionnaire before the reading and the ML appendix after the activities', () => {
    const { container } = render(<ReportContent data={{ profile: { ...DEMO_PROFILE, analysisRaw: { ...DEMO_PROFILE.analysisRaw, selfReport: createSelfReport(Array(30).fill(3), '2026-09-07T12:00:00Z') } }, userName: 'Prueba', narrative: DEMO_NARRATIVE, plan: { areas: [{ id: 'a', name: 'Una propuesta', rationale: 'Una invitación general.', actions: [{ id: 'b', title: 'Escribir una idea', description: 'Anotá lo que elegís.', microGoals: [] }] }] } }} />);
    const sections = Array.from(container.querySelectorAll('.pdf-section'));
    expect(sections.indexOf(container.querySelector('.pdf-self-report')!)).toBeLessThan(sections.indexOf(container.querySelector('.pdf-reading')!));
    expect(sections.indexOf(container.querySelector('.pdf-ml-appendix')!)).toBeGreaterThan(sections.findIndex(section => section.querySelector('.pdf-action')));
  });

  it('prints only reportable ML numbers when a future model has mixed dimension statuses', () => {
    const { container } = render(<ReportContent data={{ profile: { ...DEMO_PROFILE, analysisRaw: { ml: { modelVersion: 'future-verified-model', perDimensionStatus: { openness: 'ok', conscientiousness: 'low_confidence', extraversion: 'low_confidence', agreeableness: 'not_applicable', neuroticism: 'low_confidence' } } } }, userName: 'Prueba', narrative: null, plan: null }} />);
    expect(container.querySelectorAll('.pdf-ml-appendix .pdf-dimension')).toHaveLength(1);
    expect(container.querySelector('.pdf-ml-appendix .pdf-dimension')).toHaveTextContent('Apertura');
    expect(container.querySelector('.pdf-ml-appendix')).toHaveTextContent(/no pudieron evaluarse: Amabilidad/i);
    expect(container.querySelector('.pdf-ml-appendix')).not.toHaveTextContent(/tu cuestionario ya tiene/i);
  });
});
