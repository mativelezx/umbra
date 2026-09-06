import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ContextualGreeting } from './ContextualGreeting';
import { DEMO_BIG_FIVE, DEMO_JUNG_FUNCTIONS } from '@/lib/demo/seed';

it('attributes its suggestions to an experimental reading instead of stating traits as facts', () => {
  render(<ContextualGreeting profile={{ firstName: 'Ana', archetype: 'sage', bigFive: DEMO_BIG_FIVE, jungFunctions: DEMO_JUNG_FUNCTIONS }} />);
  expect(screen.getByText('Hola, Ana')).toBeVisible();
  expect(screen.getByText(/interpretación de IA para explorar/)).toBeVisible();
  expect(screen.getByText(/estimación experimental de Big Five/)).toBeVisible();
  expect(screen.getByText(/ejemplo para contrastar con tu experiencia/)).toBeVisible();
  expect(screen.queryByText(/Tu mente trabaja|está arriba|está abajo/)).not.toBeInTheDocument();
  expect(screen.getByText(/¿Sobre qué querés pensar hoy/)).toBeVisible();
});
