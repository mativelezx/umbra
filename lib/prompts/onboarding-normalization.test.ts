import { expect, it } from 'vitest';
import { normalizeConductorJson, OnboardingSignalSchema } from './onboarding-conductor';

it('accepts absent optional signal provenance without inventing evidence',()=>{
  const normalized=normalizeConductorJson({signalsCaptured:[{dimension:'openness',direction:'high',strength:20,source:{questionId:'qa-1',quote:null,choiceId:null}}]},2) as {signalsCaptured:unknown[]};
  expect(OnboardingSignalSchema.parse(normalized.signalsCaptured[0]).source).toEqual({questionId:'qa-1'});
});
