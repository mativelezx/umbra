import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Brand } from './Brand';

afterEach(cleanup);

describe('Umbra brand lockup', () => {
  it('combines the independent symbol and outlined lowercase wordmark', () => {
    const { container } = render(<Brand />);
    expect(screen.getByRole('link', { name: 'Umbra, inicio' })).toHaveAttribute('href', '/');
    expect(container.querySelector('.brand-mark')).toBeInTheDocument();
    const lettering = container.querySelector('.brand-wordmark');
    expect(lettering).toBeInTheDocument();
    expect(lettering?.querySelectorAll('path')).toHaveLength(5);
    expect(lettering?.querySelector('text')).toBeNull();
  });

  it('keeps the private navigation destination and one accessible brand name', () => {
    const { container } = render(<Brand href="/dashboard" />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Umbra, inicio' })).toHaveAttribute('href', '/dashboard');
    for (const artwork of container.querySelectorAll('svg')) {
      expect(artwork).toHaveAttribute('aria-hidden', 'true');
      expect(artwork).toHaveAttribute('focusable', 'false');
    }
  });
});
