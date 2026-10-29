import { describe, expect, it } from 'vitest';
import { BASE_PACK } from '../core/content/basePack';
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

/** 校验基准固定为不带 approved 的内容包。 */
const check = (draft: ReviewDraft) => validateReviewDraft(draft, BASE_PACK);

describe('review validation', () => {
  it('accepts a valid event draft', () => {
    const result = check(
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
    const result = check(
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
    const valid = check(
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

    const invalid = check(
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
    const valid = check(
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

    const invalid = check(
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

  it('accepts modern field usage that the old whitelist rejected', () => {
    const result = check(
      draft('event', {
        id: 'evt.modern',
        title: '现代写法',
        text: '正文',
        entry: { kind: 'arrival' },
        when: [
          { kind: 'fansAtLeast', idolId: 'mano', value: 100 },
          { kind: 'varAtLeast', key: 'fan.total', value: 3 },
        ],
        choices: [
          {
            label: '选项',
            result: '结果',
            effects: [
              { kind: 'fans', value: 50 },
              { kind: 'var', key: 'fan.total', value: 1 },
            ],
          },
        ],
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects unknown condition and effect kinds', () => {
    const result = check(
      draft('event', {
        id: 'evt.bad',
        title: '坏写法',
        text: '正文',
        when: [{ kind: 'moonPhase', value: 3 }],
        choices: [
          {
            label: '选项',
            result: '结果',
            effects: [{ kind: 'idolExp', tier: 3 }],
          },
        ],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('未知条件'))).toBe(true);
    expect(result.errors.some((error) => error.includes('未知效果'))).toBe(true);
  });

  it('rejects an id that already exists', () => {
    const result = validateReviewDraft(
      draft('event', {
        id: 'evt.dupe',
        title: '重复',
        text: '正文',
        choices: [{ label: '选项', result: '结果', effects: [] }],
      }),
      {
        ...BASE_PACK,
        events: [
          {
            id: 'evt.dupe',
            title: '已有',
            when: [],
            text: '已有',
            choices: [{ label: '好', result: '好', effects: [] }],
          },
        ],
      },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('重复'))).toBe(true);
  });

  it('accepts a valid activity and rejects a bad kind', () => {
    const valid = check(
      draft('activity', {
        id: 'activity.test',
        name: '测试行动',
        description: '描述',
        kind: 'work',
        locations: ['park'],
        durationMinutes: 30,
        cost: { stamina: 10 },
        effects: [{ kind: 'money', delta: 200 }],
        resultTexts: ['结果'],
      }),
    );
    expect(valid.ok).toBe(true);

    const invalid = check(
      draft('activity', {
        id: 'activity.test',
        name: '测试行动',
        description: '描述',
        kind: 'nap',
        locations: ['missing'],
        durationMinutes: -5,
        cost: {},
        effects: [],
        resultTexts: [],
      }),
    );
    expect(invalid.ok).toBe(false);
    expect(invalid.errors.some((error) => error.includes('kind'))).toBe(true);
    expect(invalid.errors.some((error) => error.includes('地点'))).toBe(true);
    expect(invalid.errors.some((error) => error.includes('结果文本'))).toBe(true);
  });

  it('accepts a valid story chain and rejects invalid steps', () => {
    const valid = check(
      draft('story', {
        id: 'story.test',
        idolId: 'mano',
        steps: [
          {
            id: 'step-1',
            locationId: 'park',
            dialogueId: 'dialogue.mano.first',
            actionLabel: '去公园',
            timeWindow: { fromMinute: 600, toMinute: 1080 },
          },
        ],
      }),
    );
    expect(valid.ok).toBe(true);

    const invalid = check(
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
