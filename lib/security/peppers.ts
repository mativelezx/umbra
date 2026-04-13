import { createHmac, timingSafeEqual } from 'node:crypto';

type PepperKind = 'crisis' | 'research' | 'consent_ip' | 'delete_token';

const PEPPERS: Record<PepperKind, Record<number, string | undefined>> = {
  crisis: {
    1: process.env.CRISIS_PEPPER_V1,
  },
  research: {
    1: process.env.RESEARCH_PEPPER_V1,
  },
  consent_ip: {
    1: process.env.CONSENT_IP_PEPPER_V1,
  },
  delete_token: {
    1: process.env.DELETE_TOKEN_PEPPER_V1,
  },
};

export const CURRENT_PEPPER_VERSION = 1;

function getPepper(kind: PepperKind, version: number): string {
  const pepper = PEPPERS[kind][version];
  if (!pepper) {
    throw new Error(
      `Missing pepper for ${kind} v${version}. Set ${kind.toUpperCase()}_PEPPER_V${version} in .env.local.`,
    );
  }
  return pepper;
}

export function computeHash(
  kind: PepperKind,
  value: string,
  version: number = CURRENT_PEPPER_VERSION,
): string {
  const pepper = getPepper(kind, version);
  return createHmac('sha256', pepper).update(value).digest('hex');
}

export function verifyHash(
  kind: PepperKind,
  value: string,
  storedHash: string,
  version: number,
): boolean {
  try {
    const computed = computeHash(kind, value, version);
    if (computed.length !== storedHash.length) return false;
    return timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

/**
 * Generate a random token for delete confirmations, session tokens, etc.
 */
export function randomToken(bytes: number = 32): string {
  return Buffer.from(
    crypto.getRandomValues(new Uint8Array(bytes)),
  ).toString('hex');
}
