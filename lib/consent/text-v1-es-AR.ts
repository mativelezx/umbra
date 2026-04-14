/**
 * Canonical consent text for Umbra — versión 2026-04-13-v1, locale es-AR.
 *
 * This is the SINGLE SOURCE OF TRUTH for the consent text hash computed
 * client-side and stored in `consent_records.consent_text_hash` per
 * ADR-024 and migration 004. The value is rendered verbatim on
 * `/consent` (via the consent page component) and its SHA-256 is sent
 * in the POST body to `/api/consent`.
 *
 * **DO NOT EDIT this constant after release** — any material change
 * bumps the version to `2026-XX-XX-v2` and creates a new file
 * `text-v2-es-AR.ts`. Editing an existing version in place breaks the
 * audit trail required by Ley 25.326 art. 7 (consentimiento expreso
 * verificable para datos sensibles).
 *
 * The markdown mirror at `content/consent/v1-es-AR.md` is the
 * human-readable reference used in documentation; this TypeScript
 * constant is what the runtime actually hashes and displays.
 */

export const CONSENT_VERSION_V1 = '2026-04-13-v1';
export const CONSENT_LOCALE_V1 = 'es-AR';

export const CONSENT_TEXT_V1_ES_AR = `Umbra — Consentimiento informado (versión ${CONSENT_VERSION_V1}, ${CONSENT_LOCALE_V1})

¿Qué datos recolectamos?
- Email (para login y recuperación de cuenta).
- Textos introspectivos del onboarding y el chat.
- Perfil psicológico generado por el análisis.
- Dirección IP, seudonimizada con HMAC usando una clave secreta del servidor.
- User agent del navegador, solo para debugging.

¿Dónde se almacenan?
Supabase PostgreSQL, servidor en US-East. Cifrado en tránsito (TLS) y en reposo. Para el análisis con IA usamos Anthropic Claude, que según su política no usa contenido de usuarios para entrenar modelos.

¿Quién accede a tus datos?
Vos, a través de tu sesión autenticada. El sistema automatizado de Umbra. El responsable del tratamiento (el desarrollador del TFG), únicamente para mantenimiento y soporte. Anthropic, transitoriamente, durante el procesamiento de tus solicitudes. No se comparten con terceros para publicidad, marketing ni monetización.

¿Cuánto tiempo se retienen?
Indefinidamente hasta que solicites el borrado. Algunos payloads técnicos (debug del análisis, eventos de seguridad del chat) se purgan automáticamente a los 30 días.

Tus derechos bajo la Ley 25.326 (arts. 13-17)
Acceso: podés descargar todos tus datos desde Configuración.
Rectificación: podés editar tu perfil en cualquier momento.
Cancelación: podés eliminar tu cuenta y todos tus datos personales.
Oposición: podés retirar el modo investigación en cualquier momento.
Tiempo máximo de respuesta: 10 días hábiles (art. 14).

Modo investigación (opcional)
Si activás el modo investigación, tus textos y perfil generado se guardan en un dataset seudonimizado (identificados por una clave criptográfica). NO es anonimización irreversible: el administrador con acceso a la clave secreta y a tu ID original podría técnicamente re-vincularlos. En la práctica, ese acceso está limitado al responsable del tratamiento. Si cancelás tu cuenta, tus datos de investigación permanecen salvo que marques explícitamente "purgar también mi contribución de investigación" en el flujo de borrado. Podés activar o desactivar este modo en cualquier momento desde Configuración.

Datos sensibles
Tus textos introspectivos pueden tocar temas de salud mental, creencias, relaciones u otros datos sensibles (Ley 25.326 art. 2 inc. 3). El consentimiento que otorgás al aceptar este texto cumple con el requisito de consentimiento expreso por escrito o medio equivalente verificable (art. 7). Umbra guarda el hash SHA-256 de este texto al momento de tu aceptación, para poder probar más adelante qué texto exacto viste.

Umbra no es terapia
Es una herramienta de autoconocimiento. No reemplaza terapia profesional ni pretende diagnosticar. Si estás en crisis emocional, contactá inmediatamente a un profesional de salud mental o llamá al 135 (Centro de Asistencia al Suicida, Argentina) o al 911.

Crisis y detección automática
Umbra incluye un detector de crisis automático. Si un mensaje contiene señales de riesgo (ideación suicida, autolesión activa, psicosis, consumo con riesgo vital), el chat se bloquea y te mostramos recursos profesionales. Umbra no reemplaza ayuda profesional en una crisis.

Responsable del tratamiento
Matías Velez — TFG Ingeniería en Software, Universidad Siglo 21. Podés contactarme por email para ejercer tus derechos o hacer una consulta. Para reclamos formales tenés derecho a presentarte ante la Agencia de Acceso a la Información Pública (AAIP).

Aceptación
Al marcar el checkbox declarás que leíste este texto completo, tenés 18 años o más (o autorización de adulto responsable), aceptás el tratamiento de tus datos personales y sensibles según este texto y la Ley 25.326, entendés que Umbra no es terapia y no reemplaza ayuda profesional, y podés retirar tu consentimiento en cualquier momento solicitando borrado de tu cuenta.`;

/**
 * Compute the SHA-256 hash of a string using the Web Crypto API.
 * Works in the browser (client components) and in Edge runtime. Returns
 * lowercase hex without any prefix (64 characters).
 */
export async function computeConsentTextHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}
