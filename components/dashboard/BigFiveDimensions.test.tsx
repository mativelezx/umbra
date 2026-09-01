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
  it('muestra la cifra ÚNICAMENTE para las dimensiones en estado ok', () => {
    render(<BigFiveDimensions bigFive={BF} status={RIDGE_V1_STATUS} />);

    // apertura (ok) → cifra visible
    expect(screen.getByTestId('bf-value-openness')).toHaveTextContent('61');

    // las otras cuatro → sin cifra, con su estado declarado
    for (const dim of [
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
    ] as const) {
      expect(screen.queryByTestId(`bf-value-${dim}`)).toBeNull();
      expect(screen.getByTestId(`bf-status-${dim}`)).toBeInTheDocument();
    }

    // ningún valor numérico de las dimensiones no sostenidas aparece como texto
    for (const v of ['54', '71', '58', '33']) {
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
