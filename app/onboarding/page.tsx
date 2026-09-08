'use client';

import { useState } from 'react';
import { DynamicFlow } from '@/components/onboarding/DynamicFlow';
import { CartaForm } from '@/components/onboarding/CartaForm';
import { ModeSelector, type OnboardingEntryMode } from '@/components/onboarding/ModeSelector';
import { SeedFromChatgptFlow } from '@/components/onboarding/SeedFromChatgptFlow';
import { useAuth } from '@/lib/providers/auth-context';
import { SelfReportForm } from '@/components/assessment/SelfReportForm';

type Stage = 'mode-select' | 'flow' | 'seed-copy' | 'seed-verify' | 'assessment' | 'carta';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (!isDemo && loading) return <p role="status" className="p-6 text-text-2">Verificando tu sesión...</p>;
  if (!isDemo && !user) return <p role="status" className="p-6 text-text-2">Iniciá sesión para continuar con tu perfil.</p>;
  return <OnboardingContent key={isDemo ? 'demo' : user?.id} />;
}

function OnboardingContent() {
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
    setStage('assessment');
  }

  function handleBackToModeSelect() {
    setStage('mode-select');
  }

  if (stage === 'mode-select') {
    return <ModeSelector onPick={handlePickMode} />;
  }

  if (stage === 'seed-copy') {
    return (
      <div className="focus-backdrop"><div className="focus-entry mx-auto max-w-3xl p-6 md:p-10"><SeedFromChatgptFlow
        onSeeded={handleSeeded}
        onBack={handleBackToModeSelect}
      /></div></div>
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

  if (stage === 'assessment' && profileId) {
    return <div className="focus-backdrop"><main className="focus-entry relative mx-auto max-w-3xl px-6 py-10 md:px-10"><SelfReportForm profileId={profileId} onContinue={() => setStage('carta')} /></main></div>;
  }

  if (stage === 'carta' && profileId) {
    return (
      <div className="focus-backdrop"><main className="focus-entry relative mx-auto max-w-3xl px-6 py-16 md:px-10">
        <CartaForm profileId={profileId} />
      </main></div>
    );
  }

  return <DynamicFlow onComplete={handleComplete} />;
}
