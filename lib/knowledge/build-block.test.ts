import { describe, it, expect } from 'vitest';
import { buildKnowledgeBlock } from './build-block';

describe('buildKnowledgeBlock', () => {
  it('joins items with default separator', () => {
    const items = [{ name: 'A' }, { name: 'B' }];
    const result = buildKnowledgeBlock({
      items,
      render: (item) => item.name,
    });
    expect(result).toBe('A\n\n---\n\nB');
  });

  it('uses custom separator', () => {
    const items = ['x', 'y', 'z'];
    const result = buildKnowledgeBlock({
      items,
      render: (s) => s,
      separator: ' | ',
    });
    expect(result).toBe('x | y | z');
  });

  it('skips items with the COMPLETAR sentinel', () => {
    const items = [
      { name: 'real', description: 'real data' },
      { name: 'stub', description: '/' + '* COMPLETAR *' + '/' },
      { name: 'another', description: 'more data' },
    ];
    const result = buildKnowledgeBlock({
      items,
      render: (item) => item.name,
    });
    expect(result).toContain('real');
    expect(result).not.toContain('stub');
    expect(result).toContain('another');
  });

  it('returns empty string for empty input', () => {
    expect(buildKnowledgeBlock({ items: [], render: (x) => String(x) })).toBe('');
  });

  it('supports custom skipIf', () => {
    const result = buildKnowledgeBlock({
      items: [1, 2, 3, 4, 5],
      render: (n) => `item-${n}`,
      skipIf: (n) => n % 2 === 0,
    });
    expect(result).toBe('item-1\n\n---\n\nitem-3\n\n---\n\nitem-5');
  });
});
