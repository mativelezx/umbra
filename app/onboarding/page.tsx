'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DisclaimerCard } from '@/components/onboarding/DisclaimerCard';
import { ModeSelector } from '@/components/onboarding/ModeSelector';
import { GuidedFlow } from '@/components/onboarding/GuidedFlow';
import { FreeTextInput } from '@/components/onboarding/FreeTextInput';
import { ProgressiveLoad } from '@/components/onboarding/ProgressiveLoad';
import { CartaForm } from '@/components/onboarding/CartaForm';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { ONBOARDING_AREAS } from '@/types';

type Stage = 'select' | 'flow' | 'loading' | 'carta';

export default function OnboardingPage() {
  const router = useRouter();
  const { mode, setMode, texts, freeText, reset } = useOnboardingStore();
  const [stage, setStage] = useState<Stage>(mode ? 'flow' : 'select');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setStage('loading');

    // Demo mode: skip the real Claude call. Show the progressive load
    // animation for ~9s then drop into the carta form with seed data.
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setTimeout(() => {
        setProfileId('demo-profile-0000-0000-000000000001');
        reset();
        setStage('carta');
      }, 9500);
      return;
    }

    const payload =
      mode === 'freetext'
        ? { mode, texts: [freeText] }
        : {
            mode,
            texts: ONBOARDING_AREAS.map((a) => texts[a.key] ?? ''),
            areas: ONBOARDING_AREAS.map((a) => a.label),
          };

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? 'analysis_failed');
      }
      setProfileId(data.data.profileId);
      reset();
      setStage('carta');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown_error');
      setStage(mode === 'freetext' ? 'flow' : 'flow');
    }
  }

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
      {stage === 'select' && (
        <>
          <DisclaimerCard />
          <div className="mb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-3">
              Paso 1 de 2
            </p>
            <h1 className="mt-3 font-display text-5xl italic text-text-1 md:text-6xl">
              Empezá como te sientas cómodo
            </h1>
            <p className="mt-4 font-body text-lg text-text-2 max-w-2xl">
              Tres caminos. Los tres sirven para generar tu perfil. Elegí el que
              más te resuene ahora.
            </p>
          </div>
          <ModeSelector
            selected={mode}
            onSelect={(m) => {
              setMode(m);
              setStage('flow');
            }}
          />
        </>
      )}

      {stage === 'flow' && mode === 'guided' && (
        <>
          {error && (
            <div className="mb-6 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
              {error}. Probá de nuevo.
            </div>
          )}
          <GuidedFlow onSubmit={submit} />
        </>
      )}

      {stage === 'flow' && (mode === 'freetext' || mode === 'hybrid') && (
        <>
          {error && (
            <div className="mb-6 rounded-md border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 font-body text-sm text-accent-rose">
              {error}. Probá de nuevo.
            </div>
          )}
          <FreeTextInput onSubmit={submit} />
        </>
      )}

      {stage === 'loading' && <ProgressiveLoad />}

      {stage === 'carta' && profileId && <CartaForm profileId={profileId} />}
    </main>
  );
}
