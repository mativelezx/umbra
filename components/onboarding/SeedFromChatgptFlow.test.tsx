import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SeedFromChatgptFlow } from './SeedFromChatgptFlow';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it('keeps a pasted demo text local and labels the example', async () => {
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
  const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'test' }) });
  vi.stubGlobal('fetch', fetchMock);
  const onSeeded = vi.fn();
  render(<SeedFromChatgptFlow onBack={vi.fn()} onSeeded={onSeeded} />);
  fireEvent.click(screen.getByRole('button', { name: /ya lo pegué/i }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Una respuesta ficticia para probar este recorrido. '.repeat(10) } });
  fireEvent.click(screen.getByRole('button', { name: /continuar con/i }));
  await waitFor(() => expect(onSeeded).toHaveBeenCalledWith('demo-session'));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByText(/ejemplo local.*no se envía/i)).toBeVisible();
});
