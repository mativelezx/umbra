import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchetypeCard } from './ArchetypeCard';
import { QuickGlance } from './QuickGlance';
import { DEMO_BIG_FIVE, DEMO_JUNG_FUNCTIONS } from '@/lib/demo/seed';

describe('Experimental result presentation', () => {
  it('does not present interpretative confidence as individual certainty', () => {
    render(<><ArchetypeCard archetype="sage" confidence={82} turnsCount={14} />
      <QuickGlance bigFive={DEMO_BIG_FIVE} jungFunctions={DEMO_JUNG_FUNCTIONS} archetypeName="El Sabio" confidence={82} />
    </>);
    expect(screen.queryByText('82%')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar', { name: /certeza/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/interpretación.*IA/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/estimación experimental.*ML/i)).toBeVisible();
    expect(screen.getAllByText(/no.*diagnóstico/i).length).toBeGreaterThan(0);
  });
});
