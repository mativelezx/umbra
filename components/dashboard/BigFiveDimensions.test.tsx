import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BigFiveDimensions } from './BigFiveDimensions';
import { RIDGE_V1_STATUS } from '@/lib/profile/dimension-display';
import type { BigFive } from '@/types';

const BF: BigFive = {
  openness: 61,
  conscientiousness: 54,
  extraversion: 71,
  agreeableness: 58,
  neuroticism: 33,
};

describe('BigFiveDimensions — el tablero no muestra lo que no puede sostener (HU-06 / ADR-027)', () => {
  it('groups unsupported estimates in one explanation without five empty result cards', () => {
    render(<BigFiveDimensions bigFive={BF} status={RIDGE_V1_STATUS} />);
    expect(screen.getAllByRole('region', { name: /análisis de texto/i })).toHaveLength(1);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ 100/)).not.toBeInTheDocument();
    expect(screen.queryByText('evidencia insuficiente — sin cifra')).not.toBeInTheDocument();
  });
  it('no muestra cifras ni barras cuando el modelo no tiene evidencia española suficiente', () => {
    render(<BigFiveDimensions bigFive={BF} status={RIDGE_V1_STATUS} />);

    expect(screen.queryByRole('progressbar')).toBeNull();
    for (const dim of [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
    ] as const) {
      expect(screen.queryByTestId(`bf-value-${dim}`)).toBeNull();
    }

    // ningún valor numérico de las dimensiones no sostenidas aparece como texto
    for (const v of ['61', '54', '71', '58', '33']) {
      expect(screen.queryByText(v)).toBeNull();
    }
  });

  it('las cinco dimensiones aparecen nombradas, con o sin cifra', () => {
    render(<BigFiveDimensions bigFive={BF} status={RIDGE_V1_STATUS} />);
    for (const label of [
      'Apertura a lo nuevo',
      'Responsabilidad',
      'Cuánto salís al mundo',
      'Calidez con los demás',
      'Sensibilidad emocional',
    ]) {
      expect(screen.getAllByText(label, { exact: false }).length).toBeGreaterThan(0);
    }
  });

  it('si una dimensión pasa a ok, su cifra se muestra', () => {
    render(
      <BigFiveDimensions
        bigFive={BF}
        status={{ ...RIDGE_V1_STATUS, conscientiousness: 'ok' }}
      />,
    );
    expect(screen.getByTestId('bf-value-conscientiousness')).toHaveTextContent('54');
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('listitem', { name: 'Responsabilidad' })).toHaveAccessibleDescription(/organizar|compromisos/i);
    expect(screen.queryByTestId('bf-value-openness')).not.toBeInTheDocument();
  });

  it('offers the questionnaire when missing, without claiming it was completed', () => {
    const { rerender } = render(<BigFiveDimensions bigFive={BF} status={RIDGE_V1_STATUS} hasSelfReport={false} />);
    expect(screen.getByRole('link', { name: 'Completar mi cuestionario' })).toHaveAttribute('href', '/assessment');
    expect(screen.queryByText(/tu cuestionario ya tiene/i)).not.toBeInTheDocument();
    rerender(<BigFiveDimensions bigFive={BF} status={RIDGE_V1_STATUS} hasSelfReport />);
    expect(screen.queryByRole('link', { name: 'Completar mi cuestionario' })).not.toBeInTheDocument();
    expect(screen.getByText(/tu cuestionario ya tiene/i)).toBeInTheDocument();
  });

  it('does not call an unevaluable dimension a low-confidence result', () => {
    render(<BigFiveDimensions bigFive={BF} status={{ openness: 'not_applicable', conscientiousness: 'not_applicable', extraversion: 'not_applicable', agreeableness: 'not_applicable', neuroticism: 'not_applicable' }} />);
    expect(screen.getByText(/no pudieron evaluarse/i)).toBeInTheDocument();
    expect(screen.queryByText(/precisión suficiente/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
