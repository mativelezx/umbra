import { expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InfoPopover } from './InfoPopover';

it('offers an explicit dismiss action and still dismisses with Escape and outside click', () => {
  render(<InfoPopover title="Intuición" body="Una explicación para reflexionar." />);
  const trigger = screen.getByRole('button', { name: /qué es intuición/i });
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Intuición' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /cerrar ayuda/i }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(trigger);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(trigger);
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
