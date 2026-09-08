// @vitest-environment node
import { expect, it, vi } from 'vitest';

const captured = vi.hoisted(() => ({ options: {} as Record<string, unknown> }));
vi.mock('@anthropic-ai/sdk', () => ({ default: class {
  constructor(options: Record<string, unknown>) { captured.options = options; }
} }));
import { getClaude } from './client';

it('lets Fetch calculate content length instead of sending the legacy SDK header', () => {
  getClaude();
  expect(captured.options.defaultHeaders).toEqual({ 'Content-Length': null });
});
