import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceTransition } from './WorkspaceTransition';
import { MotionProvider } from '@/components/motion/MotionProvider';

const renderWorkspace = (ui: React.ReactElement) => render(ui, { wrapper: MotionProvider });

const route = vi.hoisted(() => ({ pathname: '/settings/profile' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

let reduced = false;
let preferenceEvents: EventTarget;
let animate: ReturnType<typeof vi.fn>;
let entrance: { cancel: ReturnType<typeof vi.fn> };

function Draft({ notice = '' }: { notice?: string }) {
  const [value, setValue] = useState('');
  return <><label>Reflexión<input value={value} onChange={event => setValue(event.target.value)} /></label><p>{notice}</p></>;
}

beforeEach(() => {
  route.pathname = '/settings/profile';
  reduced = false;
  preferenceEvents = new EventTarget();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() { return query === '(prefers-reduced-motion: reduce)' && reduced; },
    addEventListener: preferenceEvents.addEventListener.bind(preferenceEvents),
    removeEventListener: preferenceEvents.removeEventListener.bind(preferenceEvents),
  }));
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  entrance = { cancel: vi.fn() };
  animate = vi.fn(() => entrance);
  vi.stubGlobal('Animation', class {});
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  window.history.replaceState(null, '', '/');
});

describe('workspace route continuity', () => {
  it('keeps the draft and focus through rerenders and search changes without replaying entrance', () => {
    const { rerender } = renderWorkspace(<WorkspaceTransition><Draft /></WorkspaceTransition>);
    const field = screen.getByRole('textbox', { name: 'Reflexión' });
    field.focus();
    fireEvent.change(field, { target: { value: 'Quiero guardar esta idea.' } });

    window.history.replaceState(null, '', '/settings/profile?notice=saved');
    rerender(<WorkspaceTransition><Draft notice="Cambio guardado" /></WorkspaceTransition>);

    expect(screen.getByRole('textbox')).toBe(field);
    expect(field).toHaveValue('Quiero guardar esta idea.');
    expect(field).toHaveFocus();
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('does not replay the curtain on internal navigation and preserves the draft', () => {
    const { rerender } = renderWorkspace(<WorkspaceTransition><Draft /></WorkspaceTransition>);
    const field = screen.getByRole('textbox');
    fireEvent.change(field, { target: { value: 'Un borrador existente.' } });
    const nextEntrance = { cancel: vi.fn() };
    animate.mockReturnValueOnce(nextEntrance);

    route.pathname = '/settings/export';
    rerender(<WorkspaceTransition><Draft /></WorkspaceTransition>);

    expect(entrance.cancel).toHaveBeenCalledTimes(1);
    expect(animate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox')).toBe(field);
    expect(field).toHaveValue('Un borrador existente.');
    expect(animate.mock.calls[0][1]).toMatchObject({ duration: 1240, iterations: 1, fill: 'none' });
    expect(document.querySelector('.workspace-brand-transition')?.parentElement).toBe(document.body);
    expect(document.querySelector('.workspace-transition .workspace-brand-transition')).toBeNull();
  });

  it('remembers the entrance when another page remounts the workspace shell', () => {
    const { rerender } = renderWorkspace(<WorkspaceTransition key="reading"><Draft /></WorkspaceTransition>);
    expect(animate).toHaveBeenCalledTimes(1);
    route.pathname = '/plan';
    rerender(<WorkspaceTransition key="activities"><Draft /></WorkspaceTransition>);
    expect(animate).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.workspace-brand-transition')).toHaveAttribute('data-transition-state', 'quiet');
  });

  it('leaves the route still for reduced motion and does not autoplay when the preference is lifted', () => {
    reduced = true;
    const { rerender } = renderWorkspace(<WorkspaceTransition><Draft /></WorkspaceTransition>);
    expect(animate).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toBeVisible();

    act(() => { reduced = false; preferenceEvents.dispatchEvent(new Event('change')); });
    expect(animate).not.toHaveBeenCalled();

    route.pathname = '/plan';
    rerender(<WorkspaceTransition><Draft /></WorkspaceTransition>);
    expect(animate).not.toHaveBeenCalled();
  });

  it.each(['focus', 'pointer', 'keyboard', 'print', 'hidden', 'reduced'] as const)(
    'cancels the current movement for %s and keeps the draft usable', reason => {
      renderWorkspace(<WorkspaceTransition><Draft /></WorkspaceTransition>);
      const field = screen.getByRole('textbox');
      act(() => {
        if (reason === 'focus') field.focus();
        if (reason === 'pointer') fireEvent.pointerDown(field);
        if (reason === 'keyboard') fireEvent.keyDown(document, { key: 'Escape' });
        if (reason === 'print') window.dispatchEvent(new Event('beforeprint'));
        if (reason === 'hidden') {
          Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
          document.dispatchEvent(new Event('visibilitychange'));
        }
        if (reason === 'reduced') {
          reduced = true;
          preferenceEvents.dispatchEvent(new Event('change'));
        }
      });
      expect(entrance.cancel).toHaveBeenCalledTimes(1);
      fireEvent.change(field, { target: { value: 'Sigue editable.' } });
      expect(field).toHaveValue('Sigue editable.');
      expect(animate).toHaveBeenCalledTimes(1);
    },
  );

  it('cancels once on unmount and removes the lifecycle listeners', () => {
    const { unmount } = renderWorkspace(<WorkspaceTransition><Draft /></WorkspaceTransition>);
    unmount();
    expect(entrance.cancel).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event('beforeprint'));
    act(() => { reduced = true; preferenceEvents.dispatchEvent(new Event('change')); });
    expect(entrance.cancel).toHaveBeenCalledTimes(1);
  });

  it('keeps content usable without the browser animation API', () => {
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    renderWorkspace(<WorkspaceTransition><Draft /></WorkspaceTransition>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Sin animación.' } });
    expect(screen.getByRole('textbox')).toHaveValue('Sin animación.');
  });
});
