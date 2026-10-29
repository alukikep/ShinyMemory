import { afterEach, describe, expect, it } from 'vitest';
import { auditPack } from './contentAudit';
import { CONTENT_INDEX } from './contentIndex';
import type { ActivityDef, EquipDef } from './types';

const registered: string[] = [];

afterEach(() => {
  for (const id of registered.splice(0)) {
    CONTENT_INDEX.equips.delete(id);
    CONTENT_INDEX.activities.delete(id);
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
});
