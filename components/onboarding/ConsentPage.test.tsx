import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import ConsentPage from '@/app/consent/page';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

it('provides a named keyboard-focusable region for scrolling the consent information', () => {
  render(<ConsentPage />);
  const region = screen.getByRole('region', { name: 'Información sobre el consentimiento' });
  expect(region).toHaveAttribute('tabindex', '0');
  region.focus();
  expect(region).toHaveFocus();
  expect(region).toHaveTextContent('Umbra no es terapia');
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});
