// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import type { OnboardingSessionState, OnboardingTurn } from '@/types';
import { emptyWorkingProfile, buildFallbackOpenTextQuestion } from '@/lib/prompts/onboarding-conductor';

const fixture = vi.hoisted(() => ({
  session: null as OnboardingSessionState | null,
  charge: vi.fn(), provider: vi.fn(), completed: vi.fn(), fallback: vi.fn(),
}));
vi.mock('@/lib/supabase/edge', () => ({
  createEdgeClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'qa-owner' } } }) },
    from: () => {
      const query = { select: () => query, eq: () => query, limit: () => query,
        maybeSingle: async () => ({ data: { id: 'consent' }, error: null }) };
      return query;
    },
  }),
  createEdgeServiceClient: () => ({ rpc: fixture.charge }),
}));
vi.mock('@/lib/onboarding/session-store', () => ({
  loadSession: async () => fixture.session,
  createSession: vi.fn(), attachAnswer: vi.fn(), commitConductorTurn: vi.fn(),
  commitFallbackTurn: fixture.fallback, markCompleted: fixture.completed, markAbandoned: vi.fn(),
}));
vi.mock('@/lib/claude/client', () => ({ claudeText: fixture.provider, getHaikuModelId: () => 'unused' }));
vi.mock('@/lib/chat/pipeline', () => ({ runSafetyPipeline: vi.fn() }));
import { POST } from '@/app/api/onboarding/next/route';

const sessionId = '00000000-0000-4000-8000-000000000002';
const question = buildFallbackOpenTextQuestion(0, []);
const turn = (writing: boolean): OnboardingTurn => ({ question, insights: [], signals: [],
  answer: writing
    ? { type: 'open_text', questionId: question.id, answeredAt: '2026-09-07T00:00:00Z', text: 'Texto ficticio escrito para QA.' }
    : { type: 'polarity', questionId: question.id, answeredAt: '2026-09-07T00:00:00Z', value: 50 },
});
const run = () => POST(new Request('http://localhost/api/onboarding/next', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ sessionId, previousAnswer: null }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  fixture.session = { sessionId, status: 'in_progress', turns: [], workingProfile: emptyWorkingProfile(),
    flags: { seeded: true }, startedAt: '2026-09-07', updatedAt: '2026-09-07' };
  fixture.fallback.mockImplementation(async (_service, session: OnboardingSessionState, next: OnboardingTurn['question']) => ({
    ...session, turns: [...session.turns, { question: next, answer: null, insights: [], signals: [] }],
  }));
});
it.each([3, 8])('stops at %i answered cards without charging for another question', async limit => {
  fixture.session!.flags = { seeded: limit === 3 };
  fixture.session!.turns = [turn(true), ...Array.from({ length: limit - 1 }, () => turn(false))];
  const response = await run();
  expect(response.status).toBe(200);
  expect((await response.json()).data).toMatchObject({ done: true, turnNumber: limit, maxTurns: limit });
  expect(fixture.completed).toHaveBeenCalledOnce();
  expect(fixture.charge).not.toHaveBeenCalled(); expect(fixture.provider).not.toHaveBeenCalled();
});
it('reserves the last seeded question for the person to write, without a provider call', async () => {
  fixture.session!.turns = [turn(false), turn(false)];
  const response = await run();
  expect((await response.json()).data).toMatchObject({ done: false, turnNumber: 3, turn: { answer: null, question: { type: 'open_text' } } });
  expect(fixture.fallback).toHaveBeenCalledOnce(); expect(fixture.charge).not.toHaveBeenCalled();
});
it('resumes an old unanswered non-writing card without duplicating it', async () => {
  const pending: OnboardingTurn = { question: {
    id: 'qa-pending', turnIndex: 6, type: 'polarity', prompt: 'Pregunta ficticia', probe: { kind: 'open' },
    axis: { dimension: 'openness' }, leftPole: { label: 'A', meaning: 'A' }, rightPole: { label: 'B', meaning: 'B' },
  }, answer: null, insights: [], signals: [] };
  fixture.session!.turns = [...Array.from({ length: 6 }, () => turn(false)), pending];
  const response = await run();
  expect((await response.json()).data).toMatchObject({ done: false, turn: pending });
  expect(fixture.fallback).not.toHaveBeenCalled(); expect(fixture.charge).not.toHaveBeenCalled();
});
