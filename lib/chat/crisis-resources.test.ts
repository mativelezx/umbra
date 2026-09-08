import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { crisisResources } from './crisis-resources';

it('keeps official resource schedules separate instead of promising 24-hour service for every line', () => {
  const resources = crisisResources();
  expect(resources.find(item => item.value === '0800-999-0091')?.hours).toBe('24 horas, todos los días');
  expect(resources.find(item => item.value === '135')?.hours).toBe('8:00 a 0:00');
  expect(resources.find(item => item.value === '011-5263-0583')?.hours).toContain('sábados 10-16h');
  expect(resources.some(item => item.value === '011-4783-1300')).toBe(false);
  for (const path of ['app/not-found.tsx', 'app/error.tsx', 'app/auth/auth-code-error/page.tsx', 'components/export/ReportContent.tsx']) {
    const source = readFileSync(path, 'utf8');
    expect(source).toContain('135 (CABA y GBA)');
    expect(source).toContain('0800-999-0091');
    expect(source).not.toContain('135 (Argentina)');
  }
});
