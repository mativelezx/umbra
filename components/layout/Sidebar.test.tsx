import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';

vi.mock('next/navigation', () => ({ usePathname: () => '/settings/export' }));

it('opens the grouped account controls and marks them active on a data-rights route', () => {
  render(<Sidebar />);
  const account = screen.getByRole('link', { name: 'Mi cuenta' });
  expect(account).toHaveAttribute('href', '/settings');
  expect(account).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Mi resultado' })).not.toHaveAttribute('aria-current');
});
