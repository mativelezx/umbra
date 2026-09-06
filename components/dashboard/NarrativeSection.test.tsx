import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NarrativeSection } from './NarrativeSection';

afterEach(() => vi.unstubAllGlobals());

describe('NarrativeSection recovery', () => {
  it.each(['http', 'stream'])('preserves saved text on %s failure and can retry', async (failure) => {
    const body = new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"text","chunk":"Incomplete replacement"}\n\ndata: {"type":"error","error":"provider_failed"}\n\n'));
      controller.close();
    } });
    const fetchMock = vi.fn().mockResolvedValueOnce(failure === 'http' ? { ok: false } : { ok: true, body })
      .mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', fetchMock);
    render(<NarrativeSection profileId="profile-test" initialContent="Mi texto anterior" />);
    fireEvent.click(screen.getByRole('button', { name: /regenerar|volver a generar/i }));
    await screen.findByRole('alert');
    expect(screen.getByText('Mi texto anterior')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('offers retry after initial generation fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    render(<NarrativeSection profileId="profile-test" />);
    await screen.findByRole('alert');
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeEnabled();
  });

  it.each([false, true])('requires a completed stream before replacing saved text (done: %s)', async (done) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"text","chunk":"Mi nueva lectura"}\n\n' + (done ? 'data: {"type":"done"}\n\n' : '')));
      controller.close();
    } }) }));
    render(<NarrativeSection profileId="profile-test" initialContent="Mi texto anterior" />);
    fireEvent.click(screen.getByRole('button', { name: /volver a generar/i }));
    if (done) {
      expect(await screen.findByText('Mi nueva lectura')).toBeVisible();
      expect(screen.queryByText('Mi texto anterior')).not.toBeInTheDocument();
    } else {
      await screen.findByRole('alert');
      expect(screen.getByText('Mi texto anterior')).toBeVisible();
      expect(screen.queryByText('Mi nueva lectura')).not.toBeInTheDocument();
    }
  });

  it('labels synthetic content and never requests demo regeneration', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<NarrativeSection profileId="demo-profile" initialContent="Texto de ejemplo" />);
    expect(screen.getByText(/ejemplo.*no.*gener/i)).toBeVisible();
    for (const button of screen.queryAllByRole('button', { name: /regenerar|volver a generar/i })) {
      fireEvent.click(button);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
