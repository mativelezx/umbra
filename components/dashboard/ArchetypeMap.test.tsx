import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ArchetypeMap } from './ArchetypeMap';

// jsdom has no browser top layer. Verify invocation of the native modal
// contract here; the browser QA verifies its actual Tab/background isolation.
const showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', ''); });
const close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open'); });
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: showModal });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: close });
});
afterEach(() => vi.clearAllMocks());

it('opens a named native modal, focuses close and restores its trigger on close', () => {
  render(<ArchetypeMap userArchetype="sage" />);
  const trigger = screen.getAllByRole('button')[0];
  trigger.focus();
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: /héroe/i })).toBeVisible();
  expect(showModal).toHaveBeenCalledTimes(1);
  const closeButton = screen.getByRole('button', { name: 'Cerrar comparación' });
  expect(closeButton).toHaveFocus();
  fireEvent.click(closeButton);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it('handles native Escape cancellation and restores focus', () => {
  render(<ArchetypeMap userArchetype="sage" />);
  const trigger = screen.getAllByRole('button')[0];
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
