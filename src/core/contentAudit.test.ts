import { afterEach, describe, expect, it } from 'vitest';
import { auditPack } from './contentAudit';
import { CONTENT_INDEX } from './contentIndex';
import type { ActivityDef, EquipDef, EventDef } from './types';

const registered: string[] = [];

afterEach(() => {
  for (const id of registered.splice(0)) {
    CONTENT_INDEX.equips.delete(id);
    CONTENT_INDEX.activities.delete(id);
    CONTENT_INDEX.events.delete(id);
  }
});

describe('content audit', () => {
  it('has no broken references or rule violations', () => {
    const issues = auditPack(CONTENT_INDEX);
    const errors = issues.filter((issue) => issue.level === 'error');
    expect(errors).toEqual([]);
  });

  it('has no warnings in the active pack', () => {
    expect(auditPack(CONTENT_INDEX)).toEqual([]);
  });

  it('flags a bad modifier key and an unbranched check', () => {
    const badEquip: EquipDef = {
      id: 'audit.bad.equip',
      name: '坏饰品',
      slot: 'charm',
      description: '',
      modifiers: [{ key: 'nope' as never, value: 1 }],
    };
    const badCheck: ActivityDef = {
      id: 'audit.bad.check',
      name: '坏检定',
      description: '',
      kind: 'training',
      durationMinutes: 60,
      cost: {},
      effects: [],
      check: { ref: 'vocal', difficulty: 'F' },
      resultTexts: ['ok'],
    };
    CONTENT_INDEX.equips.set(badEquip.id, badEquip);
    CONTENT_INDEX.activities.set(badCheck.id, badCheck);
    registered.push(badEquip.id, badCheck.id);

    const codes = auditPack(CONTENT_INDEX).map((issue) => issue.code);

    expect(codes).toContain('modifier-key');
    expect(codes).toContain('check-branch');
  });

  it('flags idol-exclusive activities that can never appear', () => {
    const wrongTarget: ActivityDef = {
      id: 'audit.exclusive.target',
      name: '专属但地点页',
      description: '',
      kind: 'bond',
      target: 'none',
      idolIds: ['mano'],
      durationMinutes: 30,
      cost: {},
      effects: [],
      resultTexts: ['ok'],
    };
    const missingIdol: ActivityDef = {
      id: 'audit.exclusive.idol',
      name: '专属但人不存在',
      description: '',
      kind: 'bond',
      target: 'present-idol',
      idolIds: ['nobody'],
      durationMinutes: 30,
      cost: {},
      effects: [],
      resultTexts: ['ok'],
    };
    const badRest: ActivityDef = {
      id: 'audit.exclusive.rest',
      name: '专属休息',
      description: '',
      kind: 'rest',
      target: 'present-idol',
      idolIds: ['mano'],
      durationMinutes: 30,
      cost: {},
      effects: [],
      resultTexts: ['ok'],
    };
    for (const activity of [wrongTarget, missingIdol, badRest]) {
      CONTENT_INDEX.activities.set(activity.id, activity);
      registered.push(activity.id);
    }

    const issues = auditPack(CONTENT_INDEX);
    const codes = issues.map((issue) => issue.code);

    expect(codes).toContain('idol-ref');
    expect(
      issues.filter((issue) => issue.code === 'activity-idol-target'),
    ).toHaveLength(2);
  });

  it('flags an event whose trigger action the idol can never do', () => {
    // 摩美々的舞蹈课/表演课事件曾经就是这样：她排不出练习室时段。
    // 这里用真乃的专属行动挂到灯织身上，保证永远做不到。
    const unreachable: EventDef = {
      id: 'audit.unreachable.event',
      title: '做不到的行动之后',
      when: [],
      after: { ids: ['activity.mano.extra_practice'] },
      afterIdol: { ids: ['hiori'] },
      text: '正文',
      choices: [{ label: '好', effects: [], result: '嗯。' }],
    };
    CONTENT_INDEX.events.set(unreachable.id, unreachable);
    registered.push(unreachable.id);

    const issues = auditPack(CONTENT_INDEX);
    const found = issues.find((issue) => issue.code === 'event-unreachable');

    expect(found?.level).toBe('error');
    expect(found?.message).toContain('audit.unreachable.event');
    expect(found?.message).toContain('hiori');
  });

  it('reports a malformed event instead of throwing', () => {
    const broken = {
      id: 'audit.broken.event',
      title: '没有选项',
      when: [],
      text: '正文',
    } as unknown as EventDef;
    CONTENT_INDEX.events.set(broken.id, broken);
    registered.push(broken.id);

    const issues = auditPack(CONTENT_INDEX);
    expect(issues.some((issue) => issue.code === 'event-shape')).toBe(true);
  });
});
