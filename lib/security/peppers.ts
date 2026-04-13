/**
 * HMAC helpers using Web Crypto API (Edge + Node compatible).
 *
 * Why Web Crypto and not node:crypto: Next.js Edge runtime doesn't support
 * node: imports. Web Crypto is available in Edge, Node 16+, and the browser.
 *
 * All functions are async because Web Crypto's HMAC is async. Pepper
 * versioning — see ADR-021 in docs/DECISIONS.md. Rotation is migration-free
 * because each row carries its own `pepper_version` column.
 */

type PepperKind = 'crisis' | 'research' | 'consent_ip' | 'delete_token';

function resolvePepper(kind: PepperKind, version: number): string {
  const env = process.env;
  const lookup: Record<PepperKind, Record<number, string | undefined>> = {
    crisis: { 1: env.CRISIS_PEPPER_V1 },
    research: { 1: env.RESEARCH_PEPPER_V1 },
    consent_ip: { 1: env.CONSENT_IP_PEPPER_V1 },
    delete_token: { 1: env.DELETE_TOKEN_PEPPER_V1 },
  };
  const pepper = lookup[kind][version];
  if (!pepper) {
    throw new Error(
      `Missing pepper for ${kind} v${version}. Set ${kind.toUpperCase()}_PEPPER_V${version} in .env.local.`,
    );
  }
  return pepper;
}

export const CURRENT_PEPPER_VERSION = 1;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compute HMAC-SHA256 using Web Crypto API.
 * Returns a hex-encoded string. Async — all callers must await.
 */
export async function computeHash(
  kind: PepperKind,
  value: string,
  version: number = CURRENT_PEPPER_VERSION,
): Promise<string> {
  const pepper = resolvePepper(kind, version);
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pepper),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return bytesToHex(new Uint8Array(signature));
}

export async function verifyHash(
  kind: PepperKind,
  value: string,
  storedHash: string,
  version: number,
): Promise<boolean> {
  try {
    const computed = await computeHash(kind, value, version);
    if (computed.length !== storedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

/**
 * Generate a random token for delete confirmations, session tokens, etc.
 * Uses Web Crypto's getRandomValues which is available in Edge, Node, browser.
 */
export function randomToken(bytes: number = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bytesToHex(arr);
}
