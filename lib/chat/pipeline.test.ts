import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { classifyMessage } from './crisis-lexicon';
import { CrisisDetected } from '@/lib/errors';

describe('crisis pipeline — unit tests for core logic', () => {
  describe('idiom short-circuit', () => {
    it('never triggers on known Argentine idioms', () => {
      const idioms = [
        'me quiero matar estudiando',
        'me cago de risa',
        'me muero de hambre',
      ];
      for (const idiom of idioms) {
        const result = classifyMessage(idiom);
        expect(result.severity, `"${idiom}" should be safe`).toBe('none');
      }
    });
  });

  describe('crisis detection', () => {
    it('detects explicit suicide ideation as high', () => {
      expect(classifyMessage('pienso en suicidarme').severity).toBe('high');
      expect(classifyMessage('quiero quitarme la vida').severity).toBe('high');
    });

    it('detects hopelessness as med', () => {
      expect(classifyMessage('no puedo más con esta vida').severity).toBe('med');
      expect(classifyMessage('mi vida no vale nada').severity).toBe('med');
    });

    it('detects meaninglessness as low', () => {
      expect(classifyMessage('nada tiene sentido últimamente').severity).toBe('low');
    });
  });

  describe('CrisisDetected error class', () => {
    it('carries severity and hits', () => {
      const err = new CrisisDetected('high', ['suicide_word']);
      expect(err.severity).toBe('high');
      expect(err.hits).toEqual(['suicide_word']);
      expect(err.message).toBe('crisis');
      expect(err.name).toBe('CrisisDetected');
    });
  });
});
