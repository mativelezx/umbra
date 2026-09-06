import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { HeroExperience } from './HeroExperience';

let intersect: (visible: boolean) => void;
let setReducedMotion: (reduced: boolean) => void;

beforeEach(() => {
  intersect = () => {};
  const media = new EventTarget();
  let reduced = false;
  vi.stubGlobal('matchMedia', () => ({
    get matches() { return reduced; },
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: media.addEventListener.bind(media),
    removeEventListener: media.removeEventListener.bind(media),
  }));
  setReducedMotion = (value) => {
    reduced = value;
    media.dispatchEvent(new Event('change'));
  };
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) {
      intersect = (visible) => callback(
        [{ isIntersecting: visible } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    observe() {}
    disconnect() {}
  });
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('landing example', () => {
  it('switches the actual example content and keeps one selected tab in the tab order', () => {
    render(<HeroExperience />);
    const questions = screen.getByRole('tab', { name: 'Preguntas' });
    expect(questions).toHaveAttribute('aria-selected', 'true');
    expect(within(screen.getByRole('tabpanel')).getByText(/¿Qué te pasa cuando/)).toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'Lectura' }));
    expect(screen.getByRole('tabpanel', { name: 'Lectura' })).toHaveTextContent('Interpretación de ejemplo');
    expect(questions).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Lectura' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: 'Actividades' }));
    expect(screen.getByRole('tabpanel', { name: 'Actividades' })).toHaveTextContent('Caminata sin destino');
    expect(screen.queryByRole('tabpanel', { name: 'Preguntas' })).not.toBeInTheDocument();
  });

  it('moves selection and focus together with arrows, Home and End, including wrapping', () => {
    render(<HeroExperience />);
    const questions = screen.getByRole('tab', { name: 'Preguntas' });
    questions.focus();
    fireEvent.keyDown(questions, { key: 'ArrowLeft' });
    const activities = screen.getByRole('tab', { name: 'Actividades' });
    expect(activities).toHaveFocus();
    expect(activities).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(activities, { key: 'ArrowRight' });
    expect(questions).toHaveFocus();
    fireEvent.keyDown(questions, { key: 'End' });
    expect(activities).toHaveFocus();
    fireEvent.keyDown(activities, { key: 'Home' });
    expect(questions).toHaveFocus();
  });

  it('pauses the current offscreen and in hidden documents without losing the manual pause', () => {
    render(<HeroExperience />);
    const example = screen.getByRole('region', { name: 'Vista de ejemplo de Umbra' });
    expect(example).toHaveAttribute('data-motion', 'paused');
    act(() => intersect(true));
    expect(example).toHaveAttribute('data-motion', 'running');
    act(() => intersect(false));
    expect(example).toHaveAttribute('data-motion', 'paused');
    act(() => intersect(true));
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    fireEvent(document, new Event('visibilitychange'));
    expect(example).toHaveAttribute('data-motion', 'paused');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    fireEvent(document, new Event('visibilitychange'));
    expect(example).toHaveAttribute('data-motion', 'running');

    fireEvent.click(screen.getByRole('button', { name: 'Pausar movimiento' }));
    expect(example).toHaveAttribute('data-motion', 'paused');
    act(() => { intersect(false); intersect(true); });
    expect(example).toHaveAttribute('data-motion', 'paused');
    fireEvent.click(screen.getByRole('button', { name: 'Reanudar movimiento' }));
    expect(example).toHaveAttribute('data-motion', 'running');
  });

  it('honors a changing reduced-motion preference while keeping example navigation available', () => {
    act(() => setReducedMotion(true));
    render(<HeroExperience />);
    act(() => intersect(true));
    const example = screen.getByRole('region', { name: 'Vista de ejemplo de Umbra' });
    expect(example).toHaveAttribute('data-motion', 'reduced');
    expect(screen.getByRole('button', { name: 'Movimiento reducido' })).toBeDisabled();
    fireEvent.click(screen.getByRole('tab', { name: 'Actividades' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Caminata sin destino');
    act(() => setReducedMotion(false));
    expect(example).toHaveAttribute('data-motion', 'running');
  });
});
