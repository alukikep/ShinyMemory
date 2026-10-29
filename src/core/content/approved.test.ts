import { describe, expect, it } from 'vitest';
import { REVIEW_KINDS } from '../../review/types';
import { packApprovedFiles } from './approved';

describe('approved content packing', () => {
  it('routes every review kind into its own bucket', () => {
    for (const kind of REVIEW_KINDS) {
      const packed = packApprovedFiles({
        'draft.json': { kind, payload: { id: `probe.${kind}` } },
      });
      const total = Object.values(packed).reduce(
        (count, list) => count + list.length,
        0,
      );
      // 漏接一个 kind 时它会被丢进错误的桶，或者直接消失。
      expect(total, `kind ${kind} 没有被接住`).toBe(1);
    }
  });

  it('skips payloads without an id instead of crashing', () => {
    const packed = packApprovedFiles({
      'a.json': { kind: 'item', payload: { name: '没有 id' } },
      'b.json': { kind: 'item', payload: null },
    });
    expect(Object.values(packed).reduce((n, list) => n + list.length, 0)).toBe(0);
  });
});
