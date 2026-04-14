'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DisclaimerCard } from '@/components/onboarding/DisclaimerCard';
import { LiveProfilePanel } from './LiveProfilePanel';
import { QuestionCard } from './QuestionCard';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { serializeDynamicTranscript } from '@/lib/onboarding/serialize';
import { DEMO_ONBOARDING_SCRIPT } from '@/lib/demo/onboarding-script';
import { emptyWorkingProfile } from '@/lib/prompts/onboarding-conductor';
import type {
  InsightPing as InsightPingType,
  OnboardingAnswer,
  OnboardingNextResponse,
  OnboardingTurn,
} from '@/types';

const MAX_TURNS = 8;

interface DynamicFlowProps {
  onComplete: (profileId: string) => void;
}

type FlowError =
  | { kind: 'rate_limited' }
  | { kind: 'crisis'; resources?: unknown }
  | { kind: 'consent' }
  | { kind: 'generic'; message: string };

export function DynamicFlow({ onComplete }: DynamicFlowProps) {
  const sessionId = useOnboardingStore((s) => s.sessionId);
  const workingProfile = useOnboardingStore((s) => s.workingProfile);

  const [currentQuestion, setCurrentQuestion] = useState<OnboardingTurn['question'] | null>(
    null,
  );
  const [thinking, setThinking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [localInsights, setLocalInsights] = useState<InsightPingType[]>([]);
  const [synthesizing, setSynthesizing] = useState(false);
  const [error, setError] = useState<FlowError | null>(null);
  const bootstrapped = useRef(false);
  const demoStep = useRef(0);

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const pushInsights = useCallback((pings: InsightPingType[]) => {
    setLocalInsights((curr) => [...curr, ...pings]);
  }, []);

  const expireInsight = useCallback((id: string) => {
    setLocalInsights((curr) => curr.filter((p) => p.id !== id));
  }, []);

  const applyResponse = useCallback(
    (res: OnboardingNextResponse) => {
      const api = useOnboardingStore.getState();
      api.applyProfileUpdate(res.workingProfile);
      const existingAnswered = api.turns.filter((t) => t.answer !== null);
      api.setTurns([...existingAnswered, res.turn]);
      if (res.insights.length > 0) pushInsights(res.insights);
      setCurrentQuestion(res.turn.question);
      setTurnNumber(res.turnNumber);
      if (res.done) api.markDone();
    },
    [pushInsights],
  );

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
        const data = await res.json();
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
    [applyResponse],
  );

  const advanceDemo = useCallback(() => {
    const step = DEMO_ONBOARDING_SCRIPT[demoStep.current];
    if (!step) return;
    setThinking(true);
    setTimeout(() => {
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
  }, [pushInsights]);

  // Bootstrap on mount
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    if (isDemo) {
      const api = useOnboardingStore.getState();
      api.startSession('demo-session');
      api.applyProfileUpdate(emptyWorkingProfile());
      demoStep.current = 0;
      advanceDemo();
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
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'dynamic', texts, areas }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError({ kind: 'generic', message: data.error ?? 'analyze_failed' });
        setSynthesizing(false);
        return;
      }
      api.reset();
      onComplete(data.data.profileId);
    } catch (e) {
      setError({
        kind: 'generic',
        message: e instanceof Error ? e.message : 'analyze_network',
      });
      setSynthesizing(false);
    }
  }, [onComplete]);

  const handleAnswer = useCallback(
    async (answer: OnboardingAnswer) => {
      setSubmitting(true);
      if (isDemo) {
        const step = DEMO_ONBOARDING_SCRIPT[demoStep.current];
        if (step?.done) {
          setSubmitting(false);
          setSynthesizing(true);
          setTimeout(() => {
            onComplete('demo-profile-0000-0000-000000000001');
          }, 2200);
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
    <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:px-10">
      <DisclaimerCard />

      <header className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
          Exploración dinámica
        </p>
        <h1 className="font-display text-4xl italic text-text-1 md:text-5xl">
          Conversemos
        </h1>
        <p className="max-w-2xl font-body text-base text-text-2">
          Respondé con naturalidad. A medida que avanzás, tu perfil se construye al lado.
          Podés parar y volver en otro momento — la conversación se guarda.
        </p>
      </header>

      {error && <ErrorBanner error={error} onRetry={() => fetchNext(null)} />}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="min-h-[420px]">
          {synthesizing ? (
            <SynthesisReveal />
          ) : thinking || !currentQuestion ? (
            <ThinkingIndicator />
          ) : (
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleAnswer}
              submitting={submitting}
            />
          )}
        </div>

        <LiveProfilePanel
          workingProfile={workingProfile}
          insights={localInsights}
          turnNumber={turnNumber}
          maxTurns={MAX_TURNS}
          onExpireInsight={expireInsight}
        />
      </div>
    </div>
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
        : `Algo falló: ${error.message}. Probá de nuevo.`;

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
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
        Listo
      </p>
      <h2 className="max-w-xl text-center font-display text-3xl italic text-text-1 md:text-4xl">
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

