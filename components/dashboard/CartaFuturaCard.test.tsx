import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartaFuturaCard } from './CartaFuturaCard';
import { DEMO_ARCHETYPE, DEMO_JUNG_FUNCTIONS } from '@/lib/demo/seed';

describe('The example letter does not imply a saved user action', () => {
  it('labels the example without promising a saved letter or future delivery', () => {
    render(<CartaFuturaCard example letter={{ id: 'example', content: 'Una nota ficticia.', written_at: '2026-09-01', unlock_at: '2099-03-01' }} snapshot={{ archetype: DEMO_ARCHETYPE, jungFunctions: DEMO_JUNG_FUNCTIONS }} />);
    expect(screen.getByRole('heading', { name: 'Ejemplo de carta al futuro' })).toBeVisible();
    expect(screen.getByText(/no se guardó una carta tuya/)).toBeVisible();
    expect(screen.queryByText(/Tu carta se abre|Escribiste una nota|Faltan \d/)).not.toBeInTheDocument();
  });
});
