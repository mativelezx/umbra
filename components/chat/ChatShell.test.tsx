import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ChatShell } from './ChatShell';

vi.mock('@/components/layout/LayoutShell', () => ({
  LayoutShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
});

it('lets a narrow-screen user open history, load a conversation, and start again', async () => {
  const scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView });
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  const fetchMock = vi.fn(async (url: string) => new Response(JSON.stringify({
    data: url.endsWith('/conversations')
      ? { conversations: [{ id: 'synthetic-chat', title: 'Conversación de prueba', preview: '', createdAt: '2026-09-07', lastMessageAt: '2026-09-07', messageCount: 1 }] }
      : { id: 'synthetic-chat', messages: [{ id: 'synthetic-message', role: 'user', content: 'Un mensaje sintético para esta prueba.' }] },
  }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);

  render(<ChatShell profile={null} />);
  expect(scrollIntoView).not.toHaveBeenCalled();
  const toggle = screen.getByRole('button', { name: 'Tus conversaciones' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(await screen.findByRole('button', { name: /Conversación de prueba/ }));
  expect(await screen.findByText('Un mensaje sintético para esta prueba.')).toBeInTheDocument();
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'end' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(fetchMock).toHaveBeenCalledWith('/api/chat/conversations/synthetic-chat', { signal: expect.any(AbortSignal) });

  fireEvent.click(toggle);
  fireEvent.click(screen.getByRole('button', { name: 'Empezar una conversación nueva' }));
  await waitFor(() => expect(screen.queryByText('Un mensaje sintético para esta prueba.')).not.toBeInTheDocument());
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

const sse = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/event-stream' } });
const event = (body: Record<string, unknown>) => `data: ${JSON.stringify(body)}\n\n`;
function setupChat(response: () => Promise<Response> | Response) {
  const fetchMock = vi.fn((url: string) => url === '/api/chat'
    ? Promise.resolve(response())
    : Promise.resolve(Response.json({ data: { conversations: [] } })));
  vi.stubGlobal('fetch', fetchMock);
  render(<ChatShell profile={null} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Tu mensaje' }), { target: { value: 'Texto ficticio para probar una conversación.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  return fetchMock;
}

it.each([
  ['error event', event({ type: 'text', chunk: 'Respuesta parcial' }) + event({ type: 'error', message: 'provider_failed' })],
  ['EOF without completion', event({ type: 'text', chunk: 'Respuesta parcial' })],
  ['malformed frame', 'data: {invalid}\n\n'],
  ['empty completion', event({ type: 'done' })],
])('shows a recoverable failure for %s instead of an apparently completed answer', async (_name, body) => {
  setupChat(() => sse(body));
  expect(await screen.findByRole('alert')).toHaveTextContent('Se cortó la conexión');
  expect(screen.queryByText('Respuesta parcial')).not.toBeInTheDocument();
  expect(screen.getByText('Texto ficticio para probar una conversación.')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Tu mensaje' })).toBeEnabled();
});

it('accepts completed text and sends its conversation id with the following message', async () => {
  const fetchMock = setupChat(() => sse(event({ type: 'start', conversationId: 'qa-conversation' }) + event({ type: 'text', chunk: 'Respuesta completa.' }) + event({ type: 'done' })));
  expect(await screen.findByText('Respuesta completa.')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Tu mensaje' })).toBeEnabled());
  fireEvent.change(screen.getByRole('textbox', { name: 'Tu mensaje' }), { target: { value: 'Segunda pregunta ficticia.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  const requests = fetchMock.mock.calls.filter(([url]) => url === '/api/chat');
  expect(requests).toHaveLength(2);
  const options = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>).filter(([url]) => url === '/api/chat')[1][1];
  expect(JSON.parse(String(options.body)).conversationId).toBe('qa-conversation');
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Tu mensaje' })).toBeEnabled());
});

it.each([
  ['rate_limited', 429, 'Alcanzaste tu cupo diario'],
  ['session_expired', 401, 'Tu sesión en esta conversación expiró'],
])('explains %s without leaving a streaming placeholder', async (error, status, message) => {
  setupChat(() => Response.json({ error }, { status }));
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(screen.getByRole('textbox', { name: 'Tu mensaje' })).toBeEnabled();
});

it('ignores a late response after the user starts a new conversation', async () => {
  let resolveResponse!: (response: Response) => void;
  const response = new Promise<Response>(resolve => { resolveResponse = resolve; });
  setupChat(() => response);
  fireEvent.click(screen.getByRole('button', { name: 'Tus conversaciones' }));
  fireEvent.click(screen.getByRole('button', { name: 'Empezar una conversación nueva' }));
  await act(async () => resolveResponse(sse(event({ type: 'start', conversationId: 'stale' }) + event({ type: 'text', chunk: 'Texto tardío que no pertenece a esta conversación.' }) + event({ type: 'done' }))));
  expect(screen.queryByText('Texto tardío que no pertenece a esta conversación.')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Tu mensaje' })).toBeEnabled();
});
