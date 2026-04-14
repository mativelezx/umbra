'use client';

import { useState } from 'react';
import { DynamicFlow } from '@/components/onboarding/DynamicFlow';
import { CartaForm } from '@/components/onboarding/CartaForm';

type Stage = 'flow' | 'carta';

export default function OnboardingPage() {
  const [stage, setStage] = useState<Stage>('flow');
  const [profileId, setProfileId] = useState<string | null>(null);

  function handleComplete(id: string) {
    setProfileId(id);
    setStage('carta');
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
