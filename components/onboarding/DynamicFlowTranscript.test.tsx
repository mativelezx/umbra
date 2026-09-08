import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { OnboardingAnswer, OnboardingQuestion, OnboardingTurn } from '@/types';
vi.mock('@/components/onboarding/LiveProfilePanel', () => ({ LiveProfilePanel: () => null }));
vi.mock('@/components/onboarding/QuestionCard', () => ({
  QuestionCard: ({ question, onSubmit }: { question: OnboardingQuestion; onSubmit: (answer: OnboardingAnswer) => void }) =>
    <button onClick={() => onSubmit({ type: 'open_text', questionId: question.id, answeredAt: '2026-09-07T12:00:00Z', text: `Respuesta propia a ${question.id}` })}>Responder {question.id}</button>,
}));
import { DynamicFlow } from './DynamicFlow';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { emptyWorkingProfile } from '@/lib/prompts/onboarding-conductor';
import { DEMO_ONBOARDING_SCRIPT } from '@/lib/demo/onboarding-script';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); useOnboardingStore.getState().bindUser(null); });

it.each(['json', 'hosting-text'] as const)('retries %s analysis failures with the same writing instead of asking another question', async responseType => {
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
  useOnboardingStore.getState().bindUser('qa-retry-owner');
  useOnboardingStore.getState().reset();
  let nextCalls = 0;
  const attempts: unknown[] = [];
  const onComplete = vi.fn();
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string);
    if (url === '/api/analyze') {
      attempts.push(body);
      return attempts.length === 1
        ? responseType === 'json'
          ? Response.json({ok:false,error:'ml_unavailable'},{status:503})
          : new Response('An error occurred with your deployment', { status: 504 })
        : Response.json({ok:true,data:{profileId:'recovered-profile'}});
    }
    nextCalls++;
    return Response.json({ok:true,data:{sessionId:'qa-retry-session',workingProfile:emptyWorkingProfile(),insights:[],done:nextCalls===2,turnNumber:nextCalls,maxTurns:2,
      turn:{question:{...DEMO_ONBOARDING_SCRIPT[0].question,id:'q1'},answer:nextCalls===2 ? body.previousAnswer : null,signals:[],insights:[]}}});
  }));
  render(<DynamicFlow onComplete={onComplete}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Responder q1'}));
  expect(await screen.findByText(/Tus respuestas siguen acá/)).toBeVisible();
  expect(screen.queryByText(/Unexpected token|deployment/)).not.toBeInTheDocument();
  fireEvent.click(await screen.findByRole('button',{name:'Reintentar'}));
  await waitFor(() => expect(onComplete).toHaveBeenCalledWith('recovered-profile'));
  expect(nextCalls).toBe(2); expect(attempts).toHaveLength(2); expect(attempts[1]).toEqual(attempts[0]);
});

it.each(['next_pending', 'last_answered'] as const)('sends each acknowledged answer once when the conductor finishes with %s', async finalTurn => {
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
  useOnboardingStore.getState().bindUser('synthetic-transcript-owner');
  useOnboardingStore.getState().reset();
  let turn = 0;
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const onComplete = vi.fn();
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(init.body as string) });
    if (url === '/api/analyze') return Response.json({ ok: true, data: { profileId: 'synthetic-profile' } });
    turn++;
    return Response.json({ ok: true, data: {
      sessionId: 'synthetic-session', workingProfile: emptyWorkingProfile(), insights: [],
      done: turn === 3, turnNumber: turn, maxTurns: 3,
      turn: {
        question: { ...DEMO_ONBOARDING_SCRIPT[0].question, id: `q${turn === 3 && finalTurn === 'last_answered' ? 2 : turn}` },
        answer: turn === 3 && finalTurn === 'last_answered' ? calls.at(-1)?.body.previousAnswer : null,
        signals: [], insights: [],
      },
    } });
  }));
  render(<DynamicFlow onComplete={onComplete} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Responder q1' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Responder q2' }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledWith('synthetic-profile'));
  const analysis = calls.find(call => call.url === '/api/analyze');
  expect(analysis?.body.texts).toEqual([
    expect.stringContaining('Respuesta propia a q1'),
    expect.stringContaining('Respuesta propia a q2'),
  ]);
  expect(analysis?.body.sessionId).toBe('synthetic-session');
  expect(useOnboardingStore.getState().turns).toEqual([]);
});

it('keeps earlier answers after undo and analyzes the revised answer only once', async () => {
  vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
  useOnboardingStore.getState().bindUser('synthetic-transcript-owner');
  useOnboardingStore.getState().reset();
  const makeTurn = (id: string, answered = false): OnboardingTurn => ({
    question: { ...DEMO_ONBOARDING_SCRIPT[0].question, id },
    answer: answered ? { type: 'open_text', questionId: id, answeredAt: '2026-09-07T12:00:00Z', text: `Respuesta propia a ${id}` } : null,
    signals: [], insights: [],
  });
  const nextTurns = [makeTurn('q1'), makeTurn('q2'), makeTurn('q3'), makeTurn('q2-revised'), makeTurn('q2-revised', true)];
  let nextRequest = 0;
  let analysisTexts: string[] = [];
  const onComplete = vi.fn();
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    if (url === '/api/analyze') {
      analysisTexts = JSON.parse(init.body as string).texts;
      return Response.json({ ok: true, data: { profileId: 'synthetic-profile' } });
    }
    if (url === '/api/onboarding/undo') return Response.json({ ok: true, data: {
      sessionId: 'synthetic-session', turns: [makeTurn('q1', true)],
    } });
    const turn = nextTurns[nextRequest++];
    return Response.json({ ok: true, data: {
      sessionId: 'synthetic-session', workingProfile: emptyWorkingProfile(), insights: [],
      done: nextRequest === 5, turnNumber: nextRequest, maxTurns: 8, turn,
    } });
  }));
  render(<DynamicFlow onComplete={onComplete} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Responder q1' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Responder q2' }));
  await screen.findByRole('button', { name: 'Responder q3' });
  fireEvent.click(screen.getByRole('button', { name: 'Revisar la respuesta anterior' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Responder q2-revised' }));
  await waitFor(() => expect(onComplete).toHaveBeenCalledWith('synthetic-profile'));
  expect(analysisTexts).toEqual([
    expect.stringContaining('Respuesta propia a q1'),
    expect.stringContaining('Respuesta propia a q2-revised'),
  ]);
});
