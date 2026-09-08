import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ReflectionArt } from './ReflectionArt';

let intersect: (visible: boolean) => void;
let reduceMotion: (reduced: boolean) => void;
const disconnect = vi.fn();

beforeEach(() => {
  let reduced = false;
  const media = new EventTarget();
  vi.stubGlobal('matchMedia', () => ({
    get matches() { return reduced; },
    addEventListener: media.addEventListener.bind(media),
    removeEventListener: media.removeEventListener.bind(media),
  }));
  reduceMotion = value => { reduced = value; media.dispatchEvent(new Event('change')); };
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) {
      intersect = visible => callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    observe() {}
    disconnect = disconnect;
  });
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); disconnect.mockClear(); });

it('only runs artwork while visible and pauses when the document is hidden', () => {
  const { container, unmount } = render(<ReflectionArt variant="dialogue" />);
  const artwork = container.firstElementChild;
  expect(artwork).toHaveAttribute('data-art-motion', 'paused');
  act(() => intersect(true));
  expect(artwork).toHaveAttribute('data-art-motion', 'running');
  act(() => intersect(false));
  expect(artwork).toHaveAttribute('data-art-motion', 'paused');
  act(() => intersect(true));
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(artwork).toHaveAttribute('data-art-motion', 'paused');
  unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

it.each(['dialogue', 'mirror', 'steps', 'pages'] as const)('keeps %s artwork visible but still when reduced motion changes', variant => {
  const { container } = render(<ReflectionArt variant={variant} />);
  act(() => intersect(true));
  act(() => reduceMotion(true));
  expect(container.firstElementChild).toHaveAttribute('data-art-motion', 'reduced');
  expect(container.querySelector('svg')).toBeVisible();
  expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  act(() => reduceMotion(false));
  expect(container.firstElementChild).toHaveAttribute('data-art-motion', 'running');
});

it('keeps decorative content available without browser motion APIs', () => {
  vi.stubGlobal('matchMedia', undefined);
  vi.stubGlobal('IntersectionObserver', undefined);
  const { container } = render(<ReflectionArt />);
  expect(container.firstElementChild).toHaveAttribute('data-art-motion', 'reduced');
  expect(container.querySelector('svg')).toBeVisible();
});
