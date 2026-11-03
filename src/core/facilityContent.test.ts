import { describe, expect, it } from 'vitest';
import vocal from './content/activities/vocal';
import dance from './content/activities/dance';
import expression from './content/activities/expression';
import { FACILITIES } from './content/facilities';
import type { ActivityDef, Effect } from './types';

const EXPECTED = [
  { level: 0, duration: 60, exp: 2, money: 150, stamina: 15 },
  { level: 1, duration: 50, exp: 3, money: 150, stamina: 15 },
  { level: 2, duration: 40, exp: 4, money: 150, stamina: 15 },
  { level: 3, duration: 30, exp: 5, money: 150, stamina: 15 },
];

function expOf(activity: { effects?: Effect[] }): number {
  const effect = activity.effects?.find((entry) => entry.kind === 'attributeExp');
  if (!effect || effect.kind !== 'attributeExp') {
    throw new Error('missing attributeExp');
  }
  return effect.tier;
}

function assertActivity(activity: ActivityDef): void {
  for (const expected of EXPECTED) {
    const level =
      expected.level === 0
        ? activity
        : activity.levels?.find((entry) => entry.level === expected.level);
    expect(level, `${activity.id} 缺少等级 ${expected.level}`).toBeDefined();
    expect(level!.durationMinutes).toBe(expected.duration);
    expect(level!.cost?.money).toBe(expected.money);
    expect(level!.cost?.stamina).toBe(expected.stamina);
    expect(expOf(level!)).toBe(expected.exp);
  }
}

describe('facility content', () => {
  it('uses the agreed four-level curve for all three rooms', () => {
    assertActivity(vocal);
    assertActivity(dance);
    assertActivity(expression);
  });

  it('keeps the F to E early budget non-negative', () => {
    const expNeeded = 20;
    const sessions = expNeeded / EXPECTED[0]!.exp;
    const money = sessions * EXPECTED[0]!.money;
    const hours = (sessions * EXPECTED[0]!.duration) / 60;

    expect(sessions).toBe(10);
    expect(money).toBe(1500);
    expect(hours).toBe(10);
    expect(3000 - money).toBe(1500);
  });

  it('totals 90k for all three practice rooms', () => {
    const total = FACILITIES.filter(
      (facility) => facility.locationId === 'practice_room',
    ).reduce(
      (sum, facility) =>
        sum + facility.levels.reduce((roomSum, level) => roomSum + level.cost, 0),
      0,
    );
    expect(total).toBe(90000);
  });

  it('totals 50k for the office workroom', () => {
    const office = FACILITIES.find((facility) => facility.id === 'office_jobs');
    expect(office).toBeDefined();
    expect(office?.locationId).toBe('office');
    expect(office?.levels.map((level) => level.cost)).toEqual([
      5000, 15000, 30000,
    ]);
  });
});
