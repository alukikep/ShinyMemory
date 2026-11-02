import { describe, expect, it } from 'vitest';
import { newGame, resolveActivity, activityCost, activityDuration } from './sim';
import type { ActivityDef } from './types';
import vocal from './content/activities/vocal';

function leveledActivity(): ActivityDef {
  return {
    id: 'vocal',
    name: '初级声乐',
    description: '',
    kind: 'training',
    durationMinutes: 60,
    cost: { stamina: 15, money: 150 },
    effects: [{ kind: 'attributeExp', ref: 'vocal', tier: 2 }],
    resultTexts: ['初级'],
    levels: [
      {
        level: 1,
        name: '中级声乐',
        requires: [{ kind: 'varAtLeast', key: 'facility.vocal', value: 1 }],
        durationMinutes: 50,
        effects: [{ kind: 'attributeExp', ref: 'vocal', tier: 3 }],
        resultTexts: ['中级'],
      },
      {
        level: 2,
        name: '高级声乐',
        requires: [{ kind: 'varAtLeast', key: 'facility.vocal', value: 2 }],
        durationMinutes: 40,
        effects: [{ kind: 'attributeExp', ref: 'vocal', tier: 4 }],
        resultTexts: ['高级'],
      },
    ],
  };
}

describe('activity levels', () => {
  it('falls back to the base activity without facility levels', () => {
    const state = newGame(1);
    const resolved = resolveActivity(state, leveledActivity());
    expect(resolved.name).toBe('初级声乐');
    expect(resolved.durationMinutes).toBe(60);
    expect(resolved.effects).toEqual([
      { kind: 'attributeExp', ref: 'vocal', tier: 2 },
    ]);
  });

  it('picks the highest satisfied level but keeps the base id', () => {
    const state = newGame(1);
    state.vars = { 'facility.vocal': 2 };

    const resolved = resolveActivity(state, leveledActivity());
    expect(resolved.id).toBe('vocal');
    expect(resolved.name).toBe('高级声乐');
    expect(resolved.durationMinutes).toBe(40);
    expect(resolved.effects).toEqual([
      { kind: 'attributeExp', ref: 'vocal', tier: 4 },
    ]);
    expect(activityDuration(state, leveledActivity())).toBe(40);
    expect(activityCost(state, leveledActivity())).toEqual({
      money: 150,
      stamina: 15,
    });
  });

  it('uses the middle level when only level 1 is unlocked', () => {
    const state = newGame(1);
    state.vars = { 'facility.vocal': 1 };
    const resolved = resolveActivity(state, leveledActivity());
    expect(resolved.name).toBe('中级声乐');
    expect(resolved.resultTexts).toEqual(['中级']);
  });

  it('keeps the production training id at every level', () => {
    const state = newGame(1);
    state.vars = { 'facility.vocal': 3 };

    const resolved = resolveActivity(state, vocal);
    expect(resolved.id).toBe('vocal');
    expect(resolved.name).toBe('顶级声乐课');
    expect(resolved.durationMinutes).toBe(30);
    expect(resolved.cost).toEqual({ money: 150, stamina: 15 });
  });
});
