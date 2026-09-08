'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerCard } from '@/components/onboarding/DisclaimerCard';
import { LiveProfilePanel } from './LiveProfilePanel';
import { QuestionCard } from './QuestionCard';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { serializeDynamicTranscript, writtenResponses } from '@/lib/onboarding/serialize';
import { DEMO_ONBOARDING_SCRIPT } from '@/lib/demo/onboarding-script';
import { emptyWorkingProfile } from '@/lib/prompts/onboarding-conductor';
import { Brand } from '@/components/layout/Brand';
import type {
  InsightPing as InsightPingType,
  OnboardingAnswer,
  OnboardingNextResponse,
  OnboardingTurn,
} from '@/types';

const DEFAULT_maxTurns = 8;

interface DynamicFlowProps {
  onComplete: (profileId: string) => void;
  /**
   * If provided, the flow resumes an existing (usually just-seeded)
   * onboarding_session instead of creating a fresh one. Used by the
   * ChatGPT seed entry to pipe the seeded working_profile into the
   * normal conductor flow for refinement turns.
   */
  seededSessionId?: string;
}

type FlowError =
  | { kind: 'rate_limited' }
  | { kind: 'crisis'; resources?: unknown }
  | { kind: 'consent' }
  | { kind: 'generic'; message: string; retry?: 'analysis' | 'undo' };

export function DynamicFlow({ onComplete, seededSessionId }: DynamicFlowProps) {
  const sessionId = useOnboardingStore((s) => s.sessionId);
  const workingProfile = useOnboardingStore((s) => s.workingProfile);

  const [currentQuestion, setCurrentQuestion] = useState<OnboardingTurn['question'] | null>(
    null,
  );
  const [thinking, setThinking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [maxTurns, setMaxTurns] = useState(DEFAULT_maxTurns);
  const [localInsights, setLocalInsights] = useState<InsightPingType[]>([]);
  const [synthesizing, setSynthesizing] = useState(false);
  const [error, setError] = useState<FlowError | null>(null);
  const bootstrapped = useRef(false);
  const demoStep = useRef(0);
  const mounted = useRef(true);
  const ownerAtMount = useRef(useOnboardingStore.getState().ownerId);
  const isCurrentFlow = useCallback(() => mounted.current
    && useOnboardingStore.getState().ownerId === ownerAtMount.current, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const pushInsights = useCallback((pings: InsightPingType[]) => {
    setLocalInsights((curr) => [...curr, ...pings]);
  }, []);

  const expireInsight = useCallback((id: string) => {
    setLocalInsights((curr) => curr.filter((p) => p.id !== id));
  }, []);

  const applyResponse = useCallback(
    (res: OnboardingNextResponse) => {
      if (!isCurrentFlow()) return;
      const api = useOnboardingStore.getState();
      api.applyProfileUpdate(res.workingProfile);
      // At completion the server can return the last answered turn again,
      // rather than a new pending question. Replace it instead of duplicating it.
      const existingAnswered = api.turns.filter((t) => t.answer !== null
        && (res.turn.answer === null || t.question.id !== res.turn.question.id));
      api.setTurns([...existingAnswered, res.turn]);
      if (res.insights.length > 0) pushInsights(res.insights);
      setCurrentQuestion(res.turn.question);
      setTurnNumber(res.turnNumber);
      if (res.maxTurns) setMaxTurns(res.maxTurns);
      if (res.done) api.markDone();
    },
    [pushInsights, isCurrentFlow],
  );

  const undoLastTurn = useCallback(async () => {
    if (isDemo) {
      if (demoStep.current === 0) return;
      demoStep.current -= 1;
      const step = DEMO_ONBOARDING_SCRIPT[demoStep.current];
      setCurrentQuestion(step.question);
      setTurnNumber(demoStep.current + 1);
      setLocalInsights([]);
      return;
    }
    const api = useOnboardingStore.getState();
    if (!api.sessionId) return;
    if (api.turns.filter((t) => t.answer !== null).length === 0) return;
    setThinking(true);
    try {
      const res = await fetch('/api/onboarding/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: api.sessionId }),
      });
      if (!isCurrentFlow()) return;
      if (!res.ok) {
        setError({ kind: 'generic', message: 'undo_failed', retry: 'undo' });
        return;
      }
      const data = await res.json() as {
        ok?: boolean;
        data?: { sessionId: string; turns: OnboardingTurn[] };
      };
      if (!isCurrentFlow() || useOnboardingStore.getState().sessionId !== api.sessionId) return;
      if (!data.ok || data.data?.sessionId !== api.sessionId || !Array.isArray(data.data.turns)) {
        setError({ kind: 'generic', message: 'undo_failed', retry: 'undo' });
        return;
      }
      // The server removes only the revised answer. Keep the earlier answers
      // it returned so the next analysis still includes the whole conversation.
      api.setTurns(data.data.turns);
      setCurrentQuestion(null);
      await fetchNextRef.current?.(null);
    } catch (e) {
      setError({
        kind: 'generic',
        message: e instanceof Error ? e.message : 'undo_network',
        retry: 'undo',
      });
    } finally {
      setThinking(false);
    }
  }, [isDemo, isCurrentFlow]);

  const fetchNextRef = useRef<
    ((previousAnswer: OnboardingAnswer | null) => Promise<OnboardingNextResponse | null>) | null
  >(null);

  const fetchNext = useCallback(
    async (previousAnswer: OnboardingAnswer | null): Promise<OnboardingNextResponse | null> => {
      setError(null);
      setThinking(true);
      try {
        const currentSessionId = useOnboardingStore.getState().sessionId;
        const res = await fetch('/api/onboarding/next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            previousAnswer,
          }),
        });
        const data = await res.json().catch(() => ({ ok: false, error: 'server_unavailable' }));
        if (!isCurrentFlow()) return null;
        if (!res.ok || !data.ok) {
          const code = data.error ?? 'generic';
          if (code === 'rate_limited') setError({ kind: 'rate_limited' });
          else if (code === 'crisis')
            setError({ kind: 'crisis', resources: data.resources });
          else if (code === 'consent_required') setError({ kind: 'consent' });
          else setError({ kind: 'generic', message: code });
          return null;
        }
        const envelope = data.data as OnboardingNextResponse;
        const api = useOnboardingStore.getState();
        // Keep the answer only after this same session acknowledged it. The
        // server returns the next question, not the previous answered turn.
        // Without this, applyResponse drops it and the final transcript is empty.
        if (previousAnswer && api.sessionId === envelope.sessionId) {
          const pendingIndex = api.turns.findIndex(turn => turn.answer === null);
          if (pendingIndex >= 0) {
            api.setTurns(api.turns.map((turn, index) => index === pendingIndex
              ? { ...turn, answer: previousAnswer }
              : turn));
          }
        }
        if (!api.sessionId || api.sessionId !== envelope.sessionId) {
          api.startSession(envelope.sessionId);
        }
        applyResponse(envelope);
        return envelope;
      } catch (e) {
        setError({
          kind: 'generic',
          message: e instanceof Error ? e.message : 'network',
        });
        return null;
      } finally {
        setThinking(false);
      }
    },
    [applyResponse, isCurrentFlow],
  );

  // Keep fetchNextRef in sync so undoLastTurn (defined earlier) can
  // invoke it without creating a circular callback dependency.
  fetchNextRef.current = fetchNext;

  const advanceDemo = useCallback(() => {
    const step = DEMO_ONBOARDING_SCRIPT[demoStep.current];
    if (!step) return;
    setThinking(true);
    setTimeout(() => {
      if (!isCurrentFlow()) return;
      const api = useOnboardingStore.getState();
      setCurrentQuestion(step.question);
      setTurnNumber(demoStep.current + 1);
      api.applyProfileUpdate(step.workingProfile);
      // Also append demo turn to store so serialize would work if we call analyze
      api.setTurns([
        ...api.turns.filter((t) => t.answer !== null),
        {
          question: step.question,
          answer: null,
          signals: [],
          insights: step.insights.map((i) => i.text),
        },
      ]);
      pushInsights(step.insights);
      if (step.done) api.markDone();
      setThinking(false);
    }, 280);
  }, [pushInsights, isCurrentFlow]);

  // Bootstrap on mount
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    if (isDemo) {
      const api = useOnboardingStore.getState();
      api.startSession('demo-session');
      api.applyProfileUpdate(emptyWorkingProfile());
      demoStep.current = 0;
      setMaxTurns(DEMO_ONBOARDING_SCRIPT.length);
      advanceDemo();
      return;
    }

    // Seeded entry: a fresh onboarding_session was just created from a
    // ChatGPT retrato. Hydrate the store with that sessionId and ask the
    // conductor for the first (refinement) question.
    if (seededSessionId) {
      const api = useOnboardingStore.getState();
      api.reset();
      api.startSession(seededSessionId);
      fetchNext(null);
      return;
    }

    // Resume-on-refresh: if the persisted store already has a pending turn
    // (question without answer), show it instead of re-fetching.
    const persisted = useOnboardingStore.getState();
    const pendingTurn = persisted.turns.find((t) => t.answer === null);
    if (persisted.sessionId && pendingTurn && !persisted.done) {
      setCurrentQuestion(pendingTurn.question);
      setTurnNumber(persisted.turns.length);
      return;
    }

    fetchNext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const synthesizeAndComplete = useCallback(async () => {
    setSynthesizing(true);
    setError(null);
    try {
      const api = useOnboardingStore.getState();
      const { texts, areas } = serializeDynamicTranscript(api.turns);
      if (texts.length === 0) {
        setError({ kind: 'generic', message: 'empty_transcript' });
        setSynthesizing(false);
        return;
      }
      // Pass the sessionId so the analyze route can recover the original
      // ChatGPT-seeded portrait (if present in session flags) and
      // prepend it to the texts. Fixes codex P1 finding on seeded flows.
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'dynamic',
          texts,
          mlTexts: writtenResponses(api.turns),
          areas,
          sessionId: api.sessionId ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({ ok: false, error: 'server_unavailable' }));
      if (!isCurrentFlow()) return;
      if (!res.ok || !data.ok) {
        setError({ kind: 'generic', message: data.error ?? 'analyze_failed', retry: 'analysis' });
        setSynthesizing(false);
        return;
      }
      api.reset();
      onComplete(data.data.profileId);
    } catch (e) {
      setError({
        kind: 'generic',
        message: e instanceof Error ? e.message : 'analyze_network',
        retry: 'analysis',
      });
      setSynthesizing(false);
    }
  }, [onComplete, isCurrentFlow]);

  const handleAnswer = useCallback(
    async (answer: OnboardingAnswer) => {
      setSubmitting(true);
      if (isDemo) {
        const step = DEMO_ONBOARDING_SCRIPT[demoStep.current];
        if (step?.done) {
          setSubmitting(false);
          onComplete('demo-profile-0000-0000-000000000001');
          return;
        }
        demoStep.current += 1;
        advanceDemo();
        setSubmitting(false);
        return;
      }
      const envelope = await fetchNext(answer);
      setSubmitting(false);
      if (envelope?.done) {
        await synthesizeAndComplete();
      }
    },
    [isDemo, fetchNext, advanceDemo, onComplete, synthesizeAndComplete],
  );

  return (
    <div className="focus-backdrop"><main className="focus-entry relative z-10 mx-auto flex max-w-3xl flex-col gap-5 px-6 py-5 md:px-10 md:py-8">
      <header>
        <Brand />
        <h1 className="sr-only">
          Un momento para responder
        </h1>
      </header>
      <div className="border-y border-violet-400/15 py-2">
        <DisclaimerCard compact />
        {isDemo && <p role="status" className="pb-2 text-sm leading-relaxed text-text-2">Ejemplo local: preguntas preparadas. Tus respuestas no se envían ni generan un perfil real.</p>}
      </div>

      {error && <ErrorBanner error={error} onRetry={() => {
        if (error.kind === 'generic' && error.retry === 'analysis') void synthesizeAndComplete();
        else if (error.kind === 'generic' && error.retry === 'undo') void undoLastTurn();
        else void fetchNext(null);
      }} />}

      <div className="grid grid-cols-1 gap-8">
        <div className="flex min-h-[420px] flex-col gap-3">
          <div className="mb-1" aria-label="Tu recorrido">
            <p className="text-sm text-text-2">Pregunta {turnNumber} de {maxTurns}</p>
            <div role="progressbar" aria-label="Preguntas completadas" aria-valuenow={Math.max(0, turnNumber - 1)} aria-valuemin={0} aria-valuemax={maxTurns} className="mb-4 mt-3 flex gap-1">
              {Array.from({ length: maxTurns }, (_, index) => <span key={index} aria-hidden="true" className={`h-1.5 min-w-0 flex-1 rounded-full ${index < turnNumber - 1 ? 'bg-text-1' : index === turnNumber - 1 ? 'bg-text-3' : 'bg-umbra-shadow'}`} />)}
            </div>
          </div>
          {synthesizing ? (
            <SynthesisReveal />
          ) : !currentQuestion ? (
            <ThinkingIndicator />
          ) : (
            <>
              <QuestionCard
                question={currentQuestion}
                onSubmit={handleAnswer}
                submitting={submitting || thinking}
              />
              {turnNumber > 1 && (
                <button
                  type="button"
                  onClick={undoLastTurn}
                  disabled={submitting || thinking}
                  className="min-h-11 self-start text-sm text-text-2 underline underline-offset-4 hover:text-text-1 disabled:opacity-50"
                  aria-label="Revisar la respuesta anterior"
                >
                  Revisar la respuesta anterior
                </button>
              )}
            </>
          )}
        </div>

        <LiveProfilePanel
          workingProfile={workingProfile}
          insights={localInsights}
          turnNumber={turnNumber}
          maxTurns={maxTurns}
          onExpireInsight={expireInsight}
        />
      </div>
    </main></div>
  );
}

function ErrorBanner({
  error,
  onRetry,
}: {
  error: FlowError;
  onRetry: () => void;
}) {
  if (error.kind === 'crisis') {
    return (
      <Card className="border-accent-rose/40 bg-accent-rose/10">
        <h3 className="font-heading text-sm text-accent-rose">
          Recursos de apoyo
        </h3>
        <p className="mt-2 font-body text-sm text-text-2">
          Detectamos señales que nos preocupan. Si estás en crisis, buscá ayuda profesional
          o llamá a una línea de escucha.
        </p>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Empezar de nuevo
          </Button>
        </div>
      </Card>
    );
  }

  const message =
    error.kind === 'rate_limited'
      ? 'Ya usamos lo del día. Probá mañana para continuar.'
      : error.kind === 'consent'
        ? 'Necesitamos que aceptes los términos antes de empezar.'
        : 'No pudimos completar este paso. Tus respuestas siguen acá: comprobá la conexión y reintentá.';

  return (
    <Card className="border-accent-rose/30 bg-accent-rose/10">
      <div className="flex items-center justify-between gap-4">
        <p className="font-body text-sm text-accent-rose">{message}</p>
        {error.kind !== 'rate_limited' && error.kind !== 'consent' && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </Card>
  );
}

function SynthesisReveal() {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-6">
      <p className="font-body text-sm normal-case tracking-normal text-text-3">
        Listo
      </p>
      <h2 className="max-w-xl text-center font-heading font-semibold text-3xl not-italic text-text-1 md:text-4xl">
        Estamos uniendo todo lo que contaste...
      </h2>
      <div className="flex items-center gap-1.5">
        <span className="thinking-dot h-2 w-2 rounded-full bg-violet-300" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-violet-300" />
        <span className="thinking-dot h-2 w-2 rounded-full bg-violet-300" />
      </div>
    </div>
  );
}
