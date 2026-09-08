import { describe, it, expect } from 'vitest';
import { cn, wordCount, clamp, formatDateEs } from './utils';

describe('cn — className concatenator', () => {
  it('joins strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });
  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
  it('handles arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });
  it('handles object with boolean values', () => {
    expect(cn('a', { b: true, c: false, d: true })).toBe('a b d');
  });
});

describe('wordCount', () => {
  it('counts whitespace-delimited tokens', () => {
    expect(wordCount('hola mundo')).toBe(2);
    expect(wordCount('a b c d e')).toBe(5);
  });
  it('handles extra whitespace', () => {
    expect(wordCount('  hola   mundo  ')).toBe(2);
  });
  it('handles empty string', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('   ')).toBe(0);
  });
});

describe('clamp', () => {
  it('returns value if within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
  it('clamps below min', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });
  it('clamps above max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });
});

describe('formatDateEs', () => {
  it('formats a date in Spanish', () => {
    const date = new Date('2026-04-13T10:00:00Z');
    const formatted = formatDateEs(date);
    // e.g. "13 de abril de 2026"
    expect(formatted).toMatch(/abril/i);
    expect(formatted).toContain('2026');
    // One calendar date for screen and PDF, including around UTC midnight.
    expect(formatDateEs('2026-09-08T01:30:00Z')).toBe('7 de septiembre de 2026');
  });
});
