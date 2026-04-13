import { describe, it, expect } from 'vitest';
import { computeHash, verifyHash, randomToken } from './peppers';

describe('peppers — Web Crypto HMAC helpers', () => {
  it('computes deterministic hashes for the same input', async () => {
    const h1 = await computeHash('crisis', 'user-123');
    const h2 = await computeHash('crisis', 'user-123');
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns different hashes for different kinds', async () => {
    const crisis = await computeHash('crisis', 'user-123');
    const research = await computeHash('research', 'user-123');
    expect(crisis).not.toBe(research);
  });

  it('returns different hashes for different inputs', async () => {
    const a = await computeHash('crisis', 'user-a');
    const b = await computeHash('crisis', 'user-b');
    expect(a).not.toBe(b);
  });

  it('verifyHash works with correct input', async () => {
    const h = await computeHash('delete_token', 'token-abc');
    expect(await verifyHash('delete_token', 'token-abc', h, 1)).toBe(true);
    expect(await verifyHash('delete_token', 'token-xyz', h, 1)).toBe(false);
  });

  it('randomToken produces hex tokens of the right length', () => {
    const t = randomToken(32);
    expect(t).toMatch(/^[0-9a-f]{64}$/);
    const t2 = randomToken(16);
    expect(t2).toMatch(/^[0-9a-f]{32}$/);
  });

  it('randomToken produces unique tokens', () => {
    const tokens = new Set();
    for (let i = 0; i < 100; i++) tokens.add(randomToken());
    expect(tokens.size).toBe(100);
  });
});
