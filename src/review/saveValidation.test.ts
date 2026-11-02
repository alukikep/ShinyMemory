import { describe, expect, it } from 'vitest';
import type { ReviewDraft } from './types';
import { validateDraftForSave } from './validation';

function draft(kind: ReviewDraft['kind'], payload: Record<string, unknown>): ReviewDraft {
  return {
    id: 'draft.test',
    kind,
    title: '测试',
    status: 'review',
    payload,
    annotations: [],
    createdAt: '2026-11-02T00:00:00.000Z',
    updatedAt: '2026-11-02T00:00:00.000Z',
  };
}

const eventPayload = (tier: unknown) => ({
  id: 'evt.test',
  title: '测试事件',
  text: '正文',
  choices: [
    {
      label: '选项',
      result: '结果',
      effects: [{ kind: 'attributeExp', ref: 'trust', tier }],
    },
  ],
});

describe('save-time draft validation', () => {
  it('rejects an illegal exp tier and names the path', () => {
    const result = validateDraftForSave(draft('event', eventPayload(7)));
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('choices[0].effects[0].tier');
    expect(result.errors[0]).toContain('7');
    expect(result.incomplete).toEqual([]);
  });

  it('accepts every legal tier, including the facility tiers 2 and 4', () => {
    for (const tier of [1, 2, 3, 4, 5, 10, 20]) {
      const result = validateDraftForSave(draft('event', eventPayload(tier)));
      expect(result.errors, `tier ${tier}`).toEqual([]);
    }
  });

  it('rejects a non-numeric tier', () => {
    const result = validateDraftForSave(draft('event', eventPayload('4')));
    expect(result.errors.some((line) => line.includes('tier'))).toBe(true);
  });

  it('lets an unfinished draft through (missing fields are not errors)', () => {
    const result = validateDraftForSave(
      draft('dialogue', { id: '', startNodeId: '', nodes: {} }),
    );
    expect(result.errors).toEqual([]);
    expect(result.incomplete.length).toBeGreaterThan(0);
    expect(result.incomplete.some((line) => line.includes('不能为空'))).toBe(true);
  });

  it('still blocks a wrong enum value while the draft is otherwise empty', () => {
    const result = validateDraftForSave(
      draft('activity', { id: '', name: '', kind: 'dance', durationMinutes: 30, cost: {} }),
    );
    expect(result.errors.some((line) => line.includes('payload.kind'))).toBe(true);
    expect(result.incomplete.some((line) => line.includes('不能为空'))).toBe(true);
  });
});
