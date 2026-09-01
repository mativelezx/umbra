import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import {
  CONSENT_TEXT_V1_ES_AR,
  CONSENT_VERSION_V1,
  CONSENT_LOCALE_V1,
  computeConsentTextHash,
} from './text-v1-es-AR';

/**
 * Huella canónica de la versión 2026-04-13-v1 del consentimiento.
 * Este test hace verificable en CI la promesa de la migración 004 y del
 * ADR-024: si alguien edita el texto in-place (rompiendo la trazabilidad
 * del art. 7, Ley 25.326), este hash deja de coincidir y la suite falla.
 * Un cambio material legítimo NO edita esta versión: crea la v2 con su
 * propio archivo y su propio hash.
 */
const CANONICAL_SHA256_V1 =
  'dee26e7da2149f7c54a3d037944c687eb216f82070c5a618d035a1ac32d66f62';

describe('texto de consentimiento v1 es-AR — inmutabilidad verificable', () => {
  it('el SHA-256 del texto canónico coincide con la huella registrada', () => {
    const hash = createHash('sha256')
      .update(CONSENT_TEXT_V1_ES_AR, 'utf8')
      .digest('hex');
    expect(hash).toBe(CANONICAL_SHA256_V1);
  });

  it('computeConsentTextHash (Web Crypto) produce la misma huella que Node crypto', async () => {
    const hash = await computeConsentTextHash(CONSENT_TEXT_V1_ES_AR);
    expect(hash).toBe(CANONICAL_SHA256_V1);
  });

  it('la versión y el locale declarados son los de la v1', () => {
    expect(CONSENT_VERSION_V1).toBe('2026-04-13-v1');
    expect(CONSENT_LOCALE_V1).toBe('es-AR');
    expect(CONSENT_TEXT_V1_ES_AR).toContain(CONSENT_VERSION_V1);
  });

  it('el texto declara lo que el sistema efectivamente hace', () => {
    // Afirmaciones operativas clave que la tesis y el ADR-024 citan.
    expect(CONSENT_TEXT_V1_ES_AR).toContain('hash SHA-256');
    expect(CONSENT_TEXT_V1_ES_AR).toContain('se purgan automáticamente a los 30 días');
    expect(CONSENT_TEXT_V1_ES_AR).toContain('Umbra no es terapia');
    expect(CONSENT_TEXT_V1_ES_AR).toContain('Ley 25.326');
  });
});
