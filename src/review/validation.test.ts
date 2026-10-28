import { describe, expect, it } from 'vitest';
import type { ReviewDraft, ReviewKind } from './types';
import { validateReviewDraft } from './validation';

function draft(
  kind: ReviewKind,
  payload: Record<string, unknown>,
): ReviewDraft {
  return {
    id: 'draft.test',
    kind,
    title: '测试',
    status: 'review',
    payload,
    annotations: [],
    createdAt: '2026-10-25T00:00:00.000Z',
    updatedAt: '2026-10-25T00:00:00.000Z',
  };
}

describe('review validation', () => {
  it('accepts a valid event draft', () => {
    const result = validateReviewDraft(
      draft('event', {
        id: 'evt.test',
        title: '测试事件',
        text: '正文',
        when: [{ kind: 'atLocation', locationId: 'studio' }],
        choices: [
          {
            label: '选项',
            result: '结果',
            effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
          },
        ],
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects a missing event result and unknown effect', () => {
    const result = validateReviewDraft(
      draft('event', {
        id: 'evt.test',
        title: '测试事件',
        text: '正文',
        choices: [
          {
            label: '选项',
            result: '',
            effects: [{ kind: 'unknown' }],
          },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('result'))).toBe(true);
    expect(result.errors.some((error) => error.includes('未知效果'))).toBe(true);
  });

  it('accepts a valid job and rejects a missing location', () => {
    const valid = validateReviewDraft(
      draft('job', {
        id: 'job.test',
        name: '测试工作',
        description: '描述',
        locationId: 'studio',
        fromMinute: 600,
        toMinute: 720,
        pay: 1200,
        effects: [],
      }),
    );
    expect(valid.ok).toBe(true);

    const invalid = validateReviewDraft(
      draft('job', {
        id: 'job.test',
        name: '测试工作',
        description: '描述',
        locationId: 'missing',
        fromMinute: 720,
        toMinute: 600,
        pay: -1,
        effects: [],
      }),
    );
    expect(invalid.ok).toBe(false);
    expect(invalid.errors.some((error) => error.includes('地点'))).toBe(true);
    expect(invalid.errors.some((error) => error.includes('工作时间'))).toBe(true);
  });

  it('accepts a valid dialogue and rejects broken node references', () => {
    const valid = validateReviewDraft(
      draft('dialogue', {
        id: 'dialogue.test',
        idolId: 'mano',
        startNodeId: 'n01',
        nodes: {
          n01: {
            id: 'n01',
            text: '第一句',
            choices: [{ label: '继续', nextNodeId: 'n02' }],
          },
          n02: { id: 'n02', text: '第二句' },
        },
      }),
    );
    expect(valid.ok).toBe(true);

    const invalid = validateReviewDraft(
      draft('dialogue', {
        id: 'dialogue.test',
        idolId: 'missing',
        startNodeId: 'n01',
        nodes: {
          n01: {
            id: 'n01',
            text: '',
            nextNodeId: 'missing',
          },
        },
      }),
    );
    expect(invalid.ok).toBe(false);
    expect(invalid.errors.some((error) => error.includes('偶像'))).toBe(true);
    expect(invalid.errors.some((error) => error.includes('text'))).toBe(true);
    expect(invalid.errors.some((error) => error.includes('nextNodeId'))).toBe(
      true,
    );
  });

  it('accepts a valid story chain and rejects invalid steps', () => {
    const valid = validateReviewDraft(
      draft('story', {
        id: 'story.test',
        idolId: 'mano',
        steps: [
          {
            id: 'step-1',
            locationId: 'park',
            dialogueId: 'dialogue.test',
            actionLabel: '去公园',
            timeWindow: { fromMinute: 600, toMinute: 1080 },
          },
        ],
      }),
    );
    expect(valid.ok).toBe(true);

    const invalid = validateReviewDraft(
      draft('story', {
        id: 'story.test',
        idolId: 'missing',
        steps: [
          {
            id: '',
            locationId: 'missing',
            dialogueId: '',
            actionLabel: '',
            timeWindow: { fromMinute: 720, toMinute: 600 },
          },
        ],
      }),
    );
    expect(invalid.ok).toBe(false);
    expect(invalid.errors.some((error) => error.includes('偶像'))).toBe(true);
    expect(invalid.errors.some((error) => error.includes('地点'))).toBe(true);
    expect(invalid.errors.some((error) => error.includes('timeWindow'))).toBe(
      true,
    );
  });
});
