import type { OnboardingTurn } from '@/types';

// The server, not the language model, owns the question limit. Imported text
// and selected options cannot replace the person's own writing for ML.
export function turnPolicy(turns: OnboardingTurn[], maxTurns: number) {
  const answered = turns.filter(turn => turn.answer !== null);
  const hasWriting = answered.some(turn => turn.answer?.type === 'open_text' && turn.answer.text.trim().length > 0);
  return {
    hasWriting,
    complete: hasWriting && answered.length >= maxTurns,
    needsWriting: !hasWriting && answered.length >= maxTurns - 1,
  };
}
