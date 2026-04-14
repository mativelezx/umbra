'use client';

import { GlassCard } from '@/components/ui/Card';
import type { OnboardingAnswer, OnboardingQuestion } from '@/types';
import { OpenTextCard } from './cards/OpenTextCard';
import { MultiChoiceCard } from './cards/MultiChoiceCard';
import { ScenarioCard } from './cards/ScenarioCard';
import { RankingCard } from './cards/RankingCard';
import { PolarityCard } from './cards/PolarityCard';
import { MetaphorCard } from './cards/MetaphorCard';

interface QuestionCardProps {
  question: OnboardingQuestion;
  onSubmit: (answer: OnboardingAnswer) => void;
  submitting: boolean;
}

export function QuestionCard({ question, onSubmit, submitting }: QuestionCardProps) {
  return (
    <GlassCard key={question.id} className="onboarding-card-enter p-6 md:p-8">
      {renderInner(question, onSubmit, submitting)}
    </GlassCard>
  );
}

function renderInner(
  q: OnboardingQuestion,
  onSubmit: (a: OnboardingAnswer) => void,
  submitting: boolean,
) {
  switch (q.type) {
    case 'open_text':
      return <OpenTextCard question={q} onSubmit={onSubmit} submitting={submitting} />;
    case 'multi_choice':
      return (
        <MultiChoiceCard question={q} onSubmit={onSubmit} submitting={submitting} />
      );
    case 'scenario':
      return <ScenarioCard question={q} onSubmit={onSubmit} submitting={submitting} />;
    case 'ranking':
      return <RankingCard question={q} onSubmit={onSubmit} submitting={submitting} />;
    case 'polarity':
      return <PolarityCard question={q} onSubmit={onSubmit} submitting={submitting} />;
    case 'metaphor':
      return <MetaphorCard question={q} onSubmit={onSubmit} submitting={submitting} />;
  }
}
