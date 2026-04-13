import { describe, expect, it } from 'vitest';
import { classifyMessage, LEXICON_VERSION } from './crisis-lexicon';

describe('crisis lexicon — positive cases (MUST fire)', () => {
  const positives: Array<{ text: string; expectedMin: 'low' | 'med' | 'high' }> = [
    { text: 'Pienso en suicidarme', expectedMin: 'high' },
    { text: 'Quiero quitarme la vida', expectedMin: 'high' },
    { text: 'No quiero vivir más así', expectedMin: 'high' },
    { text: 'Tengo autolesiones desde hace meses', expectedMin: 'high' },
    { text: 'Estoy pensando en cortarme', expectedMin: 'high' },
    { text: 'Tomé pastillas de más anoche', expectedMin: 'high' },
    { text: 'Pienso en morir todos los días', expectedMin: 'high' },
    { text: 'No puedo más con esta vida', expectedMin: 'med' },
    { text: 'Mi vida no vale nada', expectedMin: 'med' },
    { text: 'Quiero desaparecer para siempre', expectedMin: 'med' },
    { text: 'Nada tiene sentido últimamente', expectedMin: 'low' },
    { text: 'Escucho voces que me dicen que haga cosas', expectedMin: 'med' },
  ];

  for (const { text, expectedMin } of positives) {
    it(`flags "${text}" as at least ${expectedMin}`, () => {
      const result = classifyMessage(text);
      const rank = { none: 0, low: 1, med: 2, high: 3 } as const;
      expect(rank[result.severity]).toBeGreaterThanOrEqual(rank[expectedMin]);
      expect(result.hits.length).toBeGreaterThan(0);
    });
  }
});

describe('crisis lexicon — idiom false positives (MUST NOT fire)', () => {
  const idioms = [
    'Me quiero matar estudiando para este final',
    'Me quiero matar laburando en este proyecto',
    'Me quiero matar con esto, no sale',
    'Me cago de risa con ese meme',
    'Me muero de risa, es increíble',
    'Me muero de hambre, no desayuné',
    'Me muero de frío, bajá el aire',
    'Me muero de ganas de verlo',
    'Me mata la cabeza, no puedo pensar',
    'No aguanto más la rutina, necesito vacaciones',
    'No aguanto más estudiar esta materia',
  ];

  for (const text of idioms) {
    it(`does NOT flag idiom: "${text}"`, () => {
      const result = classifyMessage(text);
      expect(result.severity).toBe('none');
      expect(result.hits).toEqual([]);
    });
  }
});

describe('crisis lexicon — ambiguous edge cases', () => {
  it('does not flag "matarme el hambre"', () => {
    const result = classifyMessage('Voy a comer algo para matarme el hambre');
    expect(result.severity).toBe('none');
  });

  it('does not flag "cortarme el pelo"', () => {
    const result = classifyMessage('Tengo que cortarme el pelo mañana');
    expect(result.severity).toBe('none');
  });

  it('does not flag "cortarme las uñas"', () => {
    const result = classifyMessage('Me olvidé de cortarme las uñas');
    expect(result.severity).toBe('none');
  });
});

describe('crisis lexicon — case insensitivity', () => {
  it('matches regardless of case', () => {
    const lower = classifyMessage('pienso en suicidarme');
    const upper = classifyMessage('PIENSO EN SUICIDARME');
    const mixed = classifyMessage('Pienso En SuIcIdArMe');
    expect(lower.severity).toBe('high');
    expect(upper.severity).toBe('high');
    expect(mixed.severity).toBe('high');
  });
});

describe('crisis lexicon — version', () => {
  it('has a version string', () => {
    expect(LEXICON_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('crisis lexicon — empty + whitespace', () => {
  it('returns none for empty string', () => {
    expect(classifyMessage('').severity).toBe('none');
  });
  it('returns none for whitespace only', () => {
    expect(classifyMessage('   \n\t  ').severity).toBe('none');
  });
});
