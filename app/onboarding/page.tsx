'use client';

import { useState } from 'react';
import { DynamicFlow } from '@/components/onboarding/DynamicFlow';
import { CartaForm } from '@/components/onboarding/CartaForm';
import { ModeSelector, type OnboardingEntryMode } from '@/components/onboarding/ModeSelector';
import { SeedFromChatgptFlow } from '@/components/onboarding/SeedFromChatgptFlow';

type Stage = 'mode-select' | 'flow' | 'seed-copy' | 'seed-verify' | 'carta';

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('mode-select');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [seededSessionId, setSeededSessionId] = useState<string | null>(null);

  function handlePickMode(mode: OnboardingEntryMode) {
    setStage(mode === 'dynamic' ? 'flow' : 'seed-copy');
  }

  function handleSeeded(sessionId: string) {
    setSeededSessionId(sessionId);
    setStage('seed-verify');
  }

  function handleComplete(id: string) {
    setProfileId(id);
    setStage('carta');
  }

  function handleBackToModeSelect() {
    setStage('mode-select');
  }

  if (stage === 'mode-select') {
    return <ModeSelector onPick={handlePickMode} />;
  }

  if (stage === 'seed-copy') {
    return (
      <SeedFromChatgptFlow
        onSeeded={handleSeeded}
        onBack={handleBackToModeSelect}
      />
    );
  }

  if (stage === 'seed-verify' && seededSessionId) {
    return (
      <DynamicFlow
        seededSessionId={seededSessionId}
        onComplete={handleComplete}
      />
    );
  }

  if (stage === 'carta' && profileId) {
    return (
      <main className="relative mx-auto max-w-3xl px-6 py-16 md:px-10">
        <CartaForm profileId={profileId} />
      </main>
    );
  }

  return <DynamicFlow onComplete={handleComplete} />;
}
