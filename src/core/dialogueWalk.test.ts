import { describe, expect, it } from 'vitest';
import { walkDialogue } from './dialogueWalk';
import type { DialogueNode } from './types';

/**
 * 审查台按阅读顺序展开对话。
 * 分支必须缩进展开，孤立节点也要露出来（否则"写了没接上"会被静默吞掉）。
 */

const nodes: Record<string, DialogueNode> = {
  n01: { id: 'n01', text: '开场', nextNodeId: 'n02' },
  n02: { id: 'n02', text: '提问', choices: [
    { label: 'A', nextNodeId: 'n02a' },
    { label: 'B', nextNodeId: 'n02b' },
  ] },
  n02a: { id: 'n02a', text: '走 A', nextNodeId: 'n03' },
  n02b: { id: 'n02b', text: '走 B', nextNodeId: 'n03' },
  n03: { id: 'n03', text: '汇合' },
  orphan: { id: 'orphan', text: '没接上的一句' },
};

describe('walkDialogue', () => {
  it('follows nextNodeId, not object key order', () => {
    const entries = walkDialogue(nodes, 'n01');
    expect(entries.map((entry) => entry.nodeId)).toEqual([
      'n01',
      'n02',
      'n02a',
      'n03',
      'n02b',
      'orphan',
    ]);
  });

  it('indents branch nodes and records the choice that led there', () => {
    const entries = walkDialogue(nodes, 'n01');
    const a = entries.find((entry) => entry.nodeId === 'n02a');
    expect(a?.depth).toBe(1);
    expect(a?.viaChoice).toBe('A');
    // 汇合点按"第一次到达"的深度显示（从 A 分支进来就是 1）
    expect(entries.find((entry) => entry.nodeId === 'n03')?.depth).toBe(1);
  });

  it('surfaces orphan nodes instead of silently dropping them', () => {
    const entries = walkDialogue(nodes, 'n01');
    expect(entries.some((entry) => entry.nodeId === 'orphan')).toBe(true);
  });
});
