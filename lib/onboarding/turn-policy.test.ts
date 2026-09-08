import { expect, it } from 'vitest';
import { turnPolicy } from './turn-policy';
import type { OnboardingTurn } from '@/types';
import { DEMO_ONBOARDING_SCRIPT } from '@/lib/demo/onboarding-script';

const turn = (writing: boolean, answered = true): OnboardingTurn => ({
  question: DEMO_ONBOARDING_SCRIPT[0].question, signals: [], insights: [],
  answer: !answered ? null : writing
    ? { type: 'open_text', questionId: 'qa', answeredAt: '2026-09-07', text: 'Escritura ficticia propia.' }
    : { type: 'polarity', questionId: 'qa', answeredAt: '2026-09-07', value: 50 },
});
it.each([3, 8])('finishes at %i answered questions without another provider call', limit => {
  expect(turnPolicy([turn(true), ...Array.from({length:limit-1},()=>turn(false))],limit).complete).toBe(true);
});
it.each([3, 8])('reserves the last of %i questions for writing when missing', limit => {
  expect(turnPolicy(Array.from({length:limit-1},()=>turn(false)),limit)).toEqual({hasWriting:false,complete:false,needsWriting:true});
});
it('does not count an unanswered fallback as a completed answer', () => {
  expect(turnPolicy([turn(true),turn(false),turn(false,false)],3).complete).toBe(false);
});
it('recovers an older session past its limit without inventing writing', () => {
  expect(turnPolicy(Array.from({length:6},()=>turn(false)),3)).toEqual({hasWriting:false,complete:false,needsWriting:true});
});
