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

describe('semántica de falla cerrada (fail-closed) del pipeline completo', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('ante error del clasificador, el caso se trata como situación de riesgo', async () => {
    // El clasificador falla (timeout, red, respuesta malformada) →
    // ClassifierFailure → el pipeline DEBE lanzar CrisisDetected, nunca
    // continuar como si el mensaje fuera seguro.
    vi.doMock('./classifier', () => ({
      classifyViaClaude: vi.fn(async () => {
        const { ClassifierFailure } = await import('@/lib/errors');
        throw new ClassifierFailure('simulated outage');
      }),
    }));
    const { runSafetyPipeline } = await import('./pipeline');

    await expect(
      runSafetyPipeline({ message: 'pienso en suicidarme' }),
    ).rejects.toMatchObject({ name: 'CrisisDetected', severity: 'classifier_error' });
  });

  it('un error ajeno al clasificador NO se enmascara como crisis (se propaga)', async () => {
    vi.doMock('./classifier', () => ({
      classifyViaClaude: vi.fn(async () => {
        throw new TypeError('bug de programación');
      }),
    }));
    const { runSafetyPipeline } = await import('./pipeline');

    await expect(
      runSafetyPipeline({ message: 'pienso en suicidarme' }),
    ).rejects.toBeInstanceOf(TypeError);
  });

  it('si el clasificador responde con crisis, lanza CrisisDetected con la severidad máxima', async () => {
    vi.doMock('./classifier', () => ({
      classifyViaClaude: vi.fn(async () => ({
        is_crisis: true,
        severity: 'high',
        reason: 'ideación explícita',
      })),
    }));
    const { runSafetyPipeline } = await import('./pipeline');

    await expect(
      runSafetyPipeline({ message: 'pienso en suicidarme' }),
    ).rejects.toMatchObject({ name: 'CrisisDetected', severity: 'high' });
  });
});
