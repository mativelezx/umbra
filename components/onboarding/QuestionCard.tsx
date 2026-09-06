'use client';

import { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const previousQuestionId = useRef(question.id);

  useEffect(() => {
    if (previousQuestionId.current === question.id) return;
    previousQuestionId.current = question.id;
    const heading = containerRef.current?.querySelector('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      containerRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, [question.id]);

  return (
    <div ref={containerRef} className="scroll-mt-20">
      <GlassCard key={question.id} className="onboarding-card-enter p-6 md:p-8">
        {renderInner(question, onSubmit, submitting)}
      </GlassCard>
    </div>
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
