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
    flags: row.flags ?? {},
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

/**
 * Creates a seeded session from an external retrato (ChatGPT output). The
 * working profile is pre-populated from the parser output; flags mark the
 * session so the conductor knows to run in refinement mode.
 */
export async function createSeededSession(
  svc: Svc,
  userId: string,
  workingProfile: WorkingProfile,
  rawSeedText: string,
): Promise<OnboardingSessionState> {
  const { data, error } = await svc
    .from('onboarding_sessions')
    .insert({
      user_id: userId,
      status: 'in_progress',
      turns: [],
      working_profile: workingProfile,
      flags: {
        seeded: true,
        seedSource: 'chatgpt',
        seedLength: rawSeedText.length,
        // Persist the full pasted text inside the session flags so the
        // downstream analyze route can recover the retrato and prepend
        // it to the final texts array. Without this, seeded users end
        // up with analysis grounded only in the 2-3 refinement turns,
        // losing the whole imported portrait (codex P1 finding, commit
        // f185d25). Size bounded by SeedRequestSchema.max(14000).
        seedText: rawSeedText,
      },
    })
    .select('*')
    .single();
  if (error || !data) {
    throw new Error(
      `[session-store] createSeededSession failed: ${error?.message ?? 'unknown'}`,
    );
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
  // Merge `degraded: true` into the existing flags instead of replacing the
  // whole object. Replacing wipes `seeded: true` and other prior flags, which
  // silently reverts a seeded session to the normal 8-turn flow on the next
  // request after a fallback. Flagged in codex review 2026-04-14.
  return updateSession(svc, session.sessionId, {
    turns,
    flags: { ...session.flags, degraded: true },
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

/**
 * Removes the most recent answered turn (and any pending turn queued
 * after it), restoring the session to the state it was in before the
 * user's last answer. Used by `POST /api/onboarding/undo` to let the
 * user revise their previous answer.
 *
 * The working profile is NOT re-derived here — the next conductor
 * call will regenerate `workingProfile` from the truncated turns
 * array, which is the correct behavior since the conductor rebuilds
 * the profile from evidence on every turn.
 *
 * No-op if there is no answered turn to undo (empty session or only
 * a pending first question).
 */
export async function undoLastAnsweredTurn(
  svc: Svc,
  session: OnboardingSessionState,
): Promise<OnboardingSessionState> {
  const turns = [...session.turns];
  // Drop any trailing pending (unanswered) turn first so we don't lose
  // an ongoing conductor question — we only undo the last COMMITTED
  // answer. Then drop the most recent answered turn.
  while (turns.length > 0 && turns[turns.length - 1].answer === null) {
    turns.pop();
  }
  if (turns.length === 0) return session;
  turns.pop();
  return updateSession(svc, session.sessionId, { turns });
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
