import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReflectionScene } from './ReflectionScene';

afterEach(() => vi.unstubAllGlobals());

describe('reflection illustration playback', () => {
  it('pauses on request, outside the viewport and when motion preference changes', () => {
    let onIntersection: IntersectionObserverCallback = () => undefined;
    let onPreference: () => void = () => undefined;
    const preference = { matches: false, addEventListener: (_event: string, callback: () => void) => { onPreference = callback; }, removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', () => preference);
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class { constructor(callback: IntersectionObserverCallback) { onIntersection = callback; } observe() {} disconnect = disconnect; });
    const { container, unmount } = render(<ReflectionScene />);
    const scene = container.querySelector('.reflection-scene');
    const observe = (isIntersecting: boolean) => act(() => onIntersection([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
    observe(true);
    expect(scene).toHaveAttribute('data-scene-motion', 'running');
    fireEvent.click(screen.getByRole('button', { name: 'Pausar ilustración' }));
    expect(scene).toHaveAttribute('data-scene-motion', 'paused');
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir ilustración' }));
    observe(false);
    expect(scene).toHaveAttribute('data-scene-motion', 'paused');
    observe(true);
    expect(scene).toHaveAttribute('data-scene-motion', 'running');
    act(() => { preference.matches = true; onPreference(); });
    expect(scene).toHaveAttribute('data-scene-motion', 'reduced');
    expect(screen.getByRole('button', { name: 'Movimiento reducido activado' })).toBeDisabled();
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
