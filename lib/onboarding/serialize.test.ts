import { describe, it, expect } from 'vitest';
import { serializeDynamicTranscript, transcriptCharLength, writtenResponses } from './serialize';
import type { OnboardingTurn } from '@/types';

function turn(partial: Partial<OnboardingTurn>): OnboardingTurn {
  return {
    question: {
      id: 'q',
      turnIndex: 0,
      type: 'open_text',
      prompt: 'default',
      probe: { kind: 'open' },
      minWords: 0,
      maxWords: 100,
      placeholder: '',
    },
    answer: null,
    signals: [],
    insights: [],
    ...partial,
  };
}

describe('writtenResponses', () => {
  it('passes only the user written answers, never generated questions or option meanings', () => {
    const turns = [
      turn({ answer: { questionId: 'q', type: 'open_text', answeredAt: '2026-09-07', text: '  Prefiero escuchar antes de hablar.  ' } }),
      turn({ answer: { questionId: 'q', type: 'open_text', answeredAt: '2026-09-07', text: '   ' } }),
      turn({ answer: { questionId: 'q', type: 'multi_choice', answeredAt: '2026-09-07', selectedIds: ['a'] } }),
      turn({ answer: null }),
    ];
    expect(writtenResponses(turns)).toEqual(['Prefiero escuchar antes de hablar.']);
  });
});

describe('serializeDynamicTranscript', () => {
  it('skips turns without answers', () => {
    const { texts, areas } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'a',
          turnIndex: 0,
          type: 'open_text',
          prompt: 'x',
          probe: { kind: 'open' },
          minWords: 0,
          maxWords: 100,
          placeholder: '',
        },
        answer: null,
      }),
    ]);
    expect(texts).toEqual([]);
    expect(areas).toEqual([]);
  });

  it('serializes open_text answers verbatim', () => {
    const { texts, areas } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q1',
          turnIndex: 0,
          type: 'open_text',
          prompt: '¿Qué te importa?',
          probe: { kind: 'big_five', dimension: 'openness' },
          minWords: 0,
          maxWords: 100,
          placeholder: '',
        },
        answer: {
          questionId: 'q1',
          type: 'open_text',
          answeredAt: '2026-04-13T00:00:00Z',
          text: 'La libertad intelectual.',
        },
      }),
    ]);
    expect(areas).toEqual(['Big Five: openness']);
    expect(texts[0]).toContain('¿Qué te importa?');
    expect(texts[0]).toContain('La libertad intelectual.');
  });

  it('serializes multi_choice with selected labels and meanings', () => {
    const { texts, areas } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q2',
          turnIndex: 0,
          type: 'multi_choice',
          prompt: '¿Qué te define?',
          probe: { kind: 'jung', func: 'Ti' },
          allowMultiple: false,
          options: [
            { id: 'a', label: 'Analizar', meaning: 'alta Ti' },
            { id: 'b', label: 'Sentir', meaning: 'alta Fi' },
          ],
        },
        answer: {
          questionId: 'q2',
          type: 'multi_choice',
          answeredAt: '2026-04-13T00:00:00Z',
          selectedIds: ['a'],
        },
      }),
    ]);
    expect(areas).toEqual(['Jung: Ti']);
    expect(texts[0]).toContain('"Analizar"');
    expect(texts[0]).toContain('alta Ti');
  });

  it('serializes scenario with scene and chosen reaction', () => {
    const { texts } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q3',
          turnIndex: 0,
          type: 'scenario',
          prompt: 'Imaginate',
          probe: { kind: 'archetype', candidate: 'sage' },
          scene: 'Una amiga te pide consejo.',
          options: [
            { id: 'a', label: 'Le digo lo que pienso', meaning: 'alta Ti' },
            { id: 'b', label: 'Le hago preguntas', meaning: 'Ni + Ti' },
          ],
        },
        answer: {
          questionId: 'q3',
          type: 'scenario',
          answeredAt: '2026-04-13T00:00:00Z',
          selectedId: 'b',
        },
      }),
    ]);
    expect(texts[0]).toContain('Una amiga te pide consejo.');
    expect(texts[0]).toContain('"Le hago preguntas"');
  });

  it('serializes ranking preserving order', () => {
    const { texts } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q4',
          turnIndex: 0,
          type: 'ranking',
          prompt: 'Ordená',
          probe: { kind: 'open' },
          instruction: 'Tocá en orden',
          items: [
            { id: 'a', label: 'Comprender', meaning: 'Ti' },
            { id: 'b', label: 'Cuidar', meaning: 'Fe' },
            { id: 'c', label: 'Crear', meaning: 'Ni' },
          ],
        },
        answer: {
          questionId: 'q4',
          type: 'ranking',
          answeredAt: '2026-04-13T00:00:00Z',
          orderedIds: ['c', 'a', 'b'],
        },
      }),
    ]);
    const out = texts[0];
    const idxCreate = out.indexOf('Crear');
    const idxUnderstand = out.indexOf('Comprender');
    const idxCare = out.indexOf('Cuidar');
    expect(idxCreate).toBeLessThan(idxUnderstand);
    expect(idxUnderstand).toBeLessThan(idxCare);
    expect(out).toContain('>');
  });

  it('serializes polarity picking side by value', () => {
    const { texts } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q5',
          turnIndex: 0,
          type: 'polarity',
          prompt: 'Elegí',
          probe: { kind: 'big_five', dimension: 'extraversion' },
          axis: { dimension: 'extraversion' },
          leftPole: { label: 'A solas', meaning: 'baja E' },
          rightPole: { label: 'Con gente', meaning: 'alta E' },
        },
        answer: {
          questionId: 'q5',
          type: 'polarity',
          answeredAt: '2026-04-13T00:00:00Z',
          value: 20,
        },
      }),
    ]);
    expect(texts[0]).toContain('A solas');
    expect(texts[0]).toContain('20/100');
  });

  it('picks center for polarity values near 50', () => {
    const { texts } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q6',
          turnIndex: 0,
          type: 'polarity',
          prompt: 'Elegí',
          probe: { kind: 'open' },
          axis: { dimension: 'openness' },
          leftPole: { label: 'Preservo', meaning: 'baja O' },
          rightPole: { label: 'Rompo', meaning: 'alta O' },
        },
        answer: {
          questionId: 'q6',
          type: 'polarity',
          answeredAt: '2026-04-13T00:00:00Z',
          value: 50,
        },
      }),
    ]);
    expect(texts[0]).toContain('punto medio');
  });

  it('serializes metaphor with chosen card', () => {
    const { texts } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q7',
          turnIndex: 0,
          type: 'metaphor',
          prompt: 'Elegí',
          probe: { kind: 'open' },
          instruction: 'La que resuene',
          cards: [
            {
              id: 'a',
              title: 'El faro',
              description: 'Fijo, luminoso',
              iconHint: 'Sun',
              meaning: 'alta Ni',
            },
            {
              id: 'b',
              title: 'El río',
              description: 'Fluye, adapta',
              iconHint: 'Waves',
              meaning: 'alta O',
            },
          ],
        },
        answer: {
          questionId: 'q7',
          type: 'metaphor',
          answeredAt: '2026-04-13T00:00:00Z',
          selectedId: 'a',
        },
      }),
    ]);
    expect(texts[0]).toContain('"El faro"');
    expect(texts[0]).toContain('alta Ni');
  });

  it('formats areas across different probe kinds', () => {
    const { areas } = serializeDynamicTranscript([
      turn({
        question: {
          id: 'q8',
          turnIndex: 0,
          type: 'open_text',
          prompt: 'x',
          probe: { kind: 'open' },
          minWords: 0,
          maxWords: 10,
          placeholder: '',
        },
        answer: {
          questionId: 'q8',
          type: 'open_text',
          answeredAt: 'now',
          text: 'hola',
        },
      }),
    ]);
    expect(areas[0]).toBe('Apertura');
  });
});

describe('transcriptCharLength', () => {
  it('counts prompt length + open_text text length', () => {
    const len = transcriptCharLength([
      turn({
        question: {
          id: 'q',
          turnIndex: 0,
          type: 'open_text',
          prompt: 'abc',
          probe: { kind: 'open' },
          minWords: 0,
          maxWords: 10,
          placeholder: '',
        },
        answer: {
          questionId: 'q',
          type: 'open_text',
          answeredAt: 'now',
          text: 'hello world',
        },
      }),
    ]);
    // prompt 'abc' (3) + text 'hello world' (11) = 14
    expect(len).toBe(14);
  });

  it('adds flat 40 chars for non-text answers', () => {
    const len = transcriptCharLength([
      turn({
        question: {
          id: 'q',
          turnIndex: 0,
          type: 'polarity',
          prompt: 'x',
          probe: { kind: 'open' },
          axis: { dimension: 'openness' },
          leftPole: { label: 'l', meaning: 'm' },
          rightPole: { label: 'r', meaning: 'n' },
        },
        answer: {
          questionId: 'q',
          type: 'polarity',
          answeredAt: 'now',
          value: 30,
        },
      }),
    ]);
    // prompt 'x' (1) + 40 flat = 41
    expect(len).toBe(41);
  });
});
