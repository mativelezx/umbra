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
  it('explains what each unsupported dimension describes without presenting a score', () => {
    render(<BigFiveDimensions bigFive={BF} status={RIDGE_V1_STATUS} />);
    expect(screen.getByRole('listitem', { name: 'Apertura a lo nuevo' })).toHaveAccessibleDescription(/ideas|experiencias/i);
    expect(screen.getByRole('listitem', { name: 'Responsabilidad' })).toHaveAccessibleDescription(/organizar|compromisos/i);
    expect(screen.getByRole('listitem', { name: 'Cuánto salís al mundo' })).toHaveAccessibleDescription(/interacción|social/i);
    expect(screen.getByRole('listitem', { name: 'Calidez con los demás' })).toHaveAccessibleDescription(/cooperar|vínculos/i);
    expect(screen.getByRole('listitem', { name: 'Sensibilidad emocional' })).toHaveAccessibleDescription(/emociones|tensión/i);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ 100/)).not.toBeInTheDocument();
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
      expect(screen.getByTestId(`bf-status-${dim}`)).toBeInTheDocument();
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
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
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
  });
});
