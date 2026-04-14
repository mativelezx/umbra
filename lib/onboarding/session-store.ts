import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  OnboardingAnswer,
  OnboardingQuestion,
  OnboardingSessionState,
  OnboardingSessionStatus,
  OnboardingTurn,
  WorkingProfile,
} from '@/types';
import {
  emptyWorkingProfile,
  type ConductorResponse,
} from '@/lib/prompts/onboarding-conductor';

type Svc = SupabaseClient;

interface DbRow {
  id: string;
  user_id: string;
  status: OnboardingSessionStatus;
  turns: OnboardingTurn[];
  working_profile: WorkingProfile;
  flags: Record<string, unknown>;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

function rowToState(row: DbRow): OnboardingSessionState {
  return {
    sessionId: row.id,
    status: row.status,
    turns: row.turns,
    workingProfile: row.working_profile,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function createSession(svc: Svc, userId: string): Promise<OnboardingSessionState> {
  const { data, error } = await svc
    .from('onboarding_sessions')
    .insert({
      user_id: userId,
      status: 'in_progress',
      turns: [],
      working_profile: emptyWorkingProfile(),
      flags: {},
    })
    .select('*')
    .single();
  if (error || !data) {
    throw new Error(`[session-store] createSession failed: ${error?.message ?? 'unknown'}`);
  }
  return rowToState(data as DbRow);
}

export async function loadSession(
  svc: Svc,
  userId: string,
  sessionId: string,
): Promise<OnboardingSessionState> {
  const { data, error } = await svc
    .from('onboarding_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw new Error(`[session-store] loadSession failed: ${error.message}`);
  }
  if (!data) {
    return createSession(svc, userId);
  }
  return rowToState(data as DbRow);
}

async function updateSession(
  svc: Svc,
  sessionId: string,
  patch: Partial<
    Pick<DbRow, 'status' | 'turns' | 'working_profile' | 'flags' | 'completed_at'>
  >,
): Promise<OnboardingSessionState> {
  const { data, error } = await svc
    .from('onboarding_sessions')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select('*')
    .single();
  if (error || !data) {
    throw new Error(`[session-store] updateSession failed: ${error?.message ?? 'unknown'}`);
  }
  return rowToState(data as DbRow);
}

/**
 * Attaches a user's `previousAnswer` to the most recent turn that is still
 * waiting on one. If no turn is pending (e.g. first call) this is a no-op.
 */
export async function attachAnswer(
  svc: Svc,
  session: OnboardingSessionState,
  answer: OnboardingAnswer,
): Promise<OnboardingSessionState> {
  const turns = [...session.turns];
  const idx = turns.findIndex((t) => t.answer === null);
  if (idx === -1) return session;
  turns[idx] = { ...turns[idx], answer };
  return updateSession(svc, session.sessionId, { turns });
}

/**
 * Commits a conductor response: appends the new question as a pending turn
 * and replaces the working profile with the updated one.
 */
export async function commitConductorTurn(
  svc: Svc,
  session: OnboardingSessionState,
  parsed: ConductorResponse,
): Promise<OnboardingSessionState> {
  const turns = [...session.turns];
  if (parsed.signalsCaptured.length > 0) {
    const idx = turns.findIndex(
      (t) => t.answer !== null && t.signals.length === 0,
    );
    if (idx !== -1) {
      turns[idx] = {
        ...turns[idx],
        signals: parsed.signalsCaptured,
        insights: parsed.insights.map((i) => i.text),
      };
    }
  }
  if (parsed.nextQuestion) {
    turns.push({
      question: parsed.nextQuestion,
      answer: null,
      signals: [],
      insights: [],
    });
  }
  return updateSession(svc, session.sessionId, {
    turns,
    working_profile: parsed.updatedProfile,
  });
}

export async function commitFallbackTurn(
  svc: Svc,
  session: OnboardingSessionState,
  question: OnboardingQuestion,
): Promise<OnboardingSessionState> {
  const turns = [...session.turns];
  turns.push({
    question,
    answer: null,
    signals: [],
    insights: [],
  });
  return updateSession(svc, session.sessionId, {
    turns,
    flags: { degraded: true },
  });
}

export async function markCompleted(svc: Svc, sessionId: string): Promise<void> {
  await svc
    .from('onboarding_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
}

export async function markAbandoned(svc: Svc, sessionId: string): Promise<void> {
  await svc
    .from('onboarding_sessions')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
}
