import { describe, expect, it } from 'vitest';
import { buildChatSystemPrompt } from './chat-context';
import { buildNarrativePrompt } from './generate-narrative';
import { buildDevelopmentPlanPrompt } from './development-plan';
import type { PsychologicalProfile } from '@/types';
import { buildInterpretNarrativePrompt } from './interpret-narrative';
import { buildEvidencePrompt } from './analyze-evidence';
import { createSelfReport } from '@/lib/assessment/bfi2s';

const profile: PsychologicalProfile = {
  id: 'fixture', userId: 'fixture-user', archetype: 'sage', archetypeSecondary: '',
  bigFive: { openness: 71, conscientiousness: 62, extraversion: 43, agreeableness: 54, neuroticism: 85 },
  jungFunctions: { Se: 10, Si: 20, Ne: 30, Ni: 40, Te: 50, Ti: 60, Fe: 70, Fi: 80 },
  analysisRaw: { ml: { perDimensionStatus: { openness: 'ok', conscientiousness: 'low_confidence', extraversion: 'not_applicable', agreeableness: 'low_confidence', neuroticism: 'not_applicable' } } },
  inputMode: 'dynamic', inputTexts: [], createdAt: '2026-09-07', updatedAt: '2026-09-07',
};

describe('reliability of generated prompt context', () => {
  it('blocks low-confidence numerical hints in interpretation and evidence, not only visible prose', () => {
    const inputs = { bigFive: profile.bigFive, jungFunctions: profile.jungFunctions, texts: ['Una experiencia cotidiana'], originalText: 'Una experiencia cotidiana' };
    for (const prompt of [buildInterpretNarrativePrompt(inputs).prompt, buildEvidencePrompt(inputs).prompt]) {
      for (const number of ['71', '62', '43', '54', '85']) expect(prompt).not.toContain(number);
      expect(prompt).not.toContain('usalos solo como señal');
    }
  });
  it('grounds all personal outputs in explicit texts and independent self-report without relabeling ML', () => {
    const withAnswers = { ...profile, inputTexts: ['Quiero volver a dibujar después del trabajo.'], analysisRaw: { ml: { modelVersion: 'ridge_v1' }, selfReport: createSelfReport(Array(30).fill(3), '2026-09-07T00:00:00Z') } };
    for (const prompt of [buildNarrativePrompt(withAnswers).prompt, buildDevelopmentPlanPrompt(withAnswers).prompt, buildChatSystemPrompt(withAnswers)]) {
      expect(prompt).toContain('Quiero volver a dibujar');
      expect(prompt).toContain('Autoinforme BFI-2-S');
      expect(prompt).toContain('3.00/5');
      expect(prompt).toContain('No es una predicción de ML ni valida el modelo');
      expect(prompt).not.toContain('71/100');
    }
  });
  it('does not frame low symbolic weights as a weakness or publish Jung scores in prose', () => {
    for (const build of [buildNarrativePrompt, buildDevelopmentPlanPrompt]) {
      const { prompt } = build(profile);
      expect(prompt).toContain('Explicá cada sigla');
      expect(prompt).toContain('No cites cifras de funciones Jung');
      expect(prompt).not.toContain('Funciones más débiles:');
      expect(prompt).not.toContain('Las funciones cognitivas más débiles del usuario');
    }
  });
  it('withholds unreliable Big Five numbers from the chat provider', () => {
    const prompt = buildChatSystemPrompt(profile);
    expect(prompt).toContain('71');
    for (const number of ['62', '43', '54', '85']) expect(prompt).not.toContain(number);
    expect(prompt).toMatch(/baja confianza|no evaluable/);
  });
  it('does not reuse an old ridge_v1 openness status based on English evaluation', () => {
    const legacy = { ...profile, analysisRaw: { ml: { ...profile.analysisRaw?.ml as object, modelVersion: 'ridge_v1' } } };
    expect(buildChatSystemPrompt(legacy)).not.toContain('71');
    expect(buildNarrativePrompt(legacy).prompt).not.toContain('71');
  });
  it.each([undefined, {}, { ml: {} }, { ml: { perDimensionStatus: {} } }])('withholds all Big Five scores when evaluation metadata is missing: %j', analysisRaw => {
    const prompt = buildChatSystemPrompt({ ...profile, analysisRaw });
    for (const number of ['71', '62', '43', '54', '85']) expect(prompt).not.toContain(number);
  });
  it.each([profile, null])('does not assure the generator that all incoming messages are safe', value => {
    const prompt = buildChatSystemPrompt(value);
    expect(prompt).not.toMatch(/ya fue evaluado como seguro|te las filtra antes/);
    expect(prompt).toMatch(/no garantiza|puede no detectar/i);
  });
  it('uses a nonclinical narrative role instead of claiming to be a psychologist', () => {
    const { system } = buildNarrativePrompt(profile);
    expect(system).not.toMatch(/Sos un narrador y psicólogo/);
    expect(system).toMatch(/no sos.*profesional|no.*diagnostic/i);
  });
  it('requests a compact narrative within the existing output budget', () => {
    const { prompt } = buildNarrativePrompt(profile);
    expect(prompt).toContain('350-500 palabras');
    expect(prompt).not.toContain('800-1200');
  });
  it.each([profile, { ...profile, analysisRaw: {} }])('does not send unreliable scores as hidden numerical hints to the narrator', value => {
    const { prompt } = buildNarrativePrompt(value);
    for (const number of ['62', '43', '54', '85']) expect(prompt).not.toContain(number);
    if (!value.analysisRaw?.ml) expect(prompt).not.toContain('71');
    expect(prompt).not.toContain('medida con confianza');
  });
  it.each([profile, { ...profile, analysisRaw: { ml: { modelVersion: 'ridge_v1' } } }])('omits unreportable scores from activity generation too', value => {
    const { prompt, system } = buildDevelopmentPlanPrompt(value);
    for (const number of ['62', '43', '54', '85']) expect(prompt).not.toContain(number);
    if ('modelVersion' in (value.analysisRaw?.ml as object)) expect(prompt).not.toContain('71');
    expect(prompt).not.toContain('(medida)');
    expect(system).toContain('experimental');
  });
});
