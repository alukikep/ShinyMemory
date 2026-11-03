import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { FACILITIES } from './content/facilities';
import rest from './content/activities/rest';
import vocal from './content/activities/vocal';
import {
  activityStaminaCost,
  maxStamina,
  newGame,
  resolveActivity,
  upgradeFacility,
} from './sim';
import type { ActivityDef, Effect, GameState } from './types';

const SOFA = FACILITIES.find((facility) => facility.id === 'sofa');

function stat(effect: Effect | undefined): number | undefined {
  return effect?.kind === 'sharedStat' ? effect.delta : undefined;
}

function values(activity: ActivityDef): { stamina: number; stress: number } {
  return {
    stamina: stat(
      activity.effects?.find(
        (effect) => effect.kind === 'sharedStat' && effect.stat === 'stamina',
      ),
    )!,
    stress: stat(
      activity.effects?.find(
        (effect) => effect.kind === 'sharedStat' && effect.stat === 'stress',
      ),
    )!,
  };
}

function atOffice(): GameState {
  const state = newGame(1);
  state.pendingDialogueId = undefined;
  state.dialogueNodeId = undefined;
  state.phase = 'plan';
  state.locationId = 'office';
  state.clock.absoluteMinutes = 12 * 60;
  return state;
}

beforeEach(() => {
  if (!SOFA) throw new Error('缺少 sofa 设施');
  CONTENT_INDEX.facilities.set(SOFA.id, SOFA);
});

afterEach(() => {
  if (SOFA) CONTENT_INDEX.facilities.delete(SOFA.id);
});

describe('sofa and stamina curve', () => {
  it('uses the agreed four sofa values with a fixed two-hour rest', () => {
    const state = atOffice();
    expect(resolveActivity(state, rest).durationMinutes).toBe(120);
    expect(values(resolveActivity(state, rest))).toEqual({
      stamina: 15,
      stress: -4,
    });

    for (const [level, expected] of [
      [1, { stamina: 20, stress: -6 }],
      [2, { stamina: 25, stress: -8 }],
      [3, { stamina: 30, stress: -10 }],
    ] as const) {
      state.vars = { ...(state.vars ?? {}), 'facility.sofa': level };
      expect(values(resolveActivity(state, rest))).toEqual(expected);
      expect(resolveActivity(state, rest).durationMinutes).toBe(120);
    }
  });

  it('costs 3k / 6k / 9k and upgrades in the office', () => {
    expect(SOFA?.levels.map((level) => level.cost)).toEqual([3000, 6000, 9000]);
    const state = atOffice();
    state.money = 3000;

    const next = upgradeFacility(state, 'sofa');
    expect(next.money).toBe(0);
    expect(next.vars?.['facility.sofa']).toBe(1);
  });

  it('uses the new stamina cap and cost curve', () => {
    const state = atOffice();
    expect(maxStamina(state)).toBe(100);
    state.producer.stamina.rank = 'S';
    expect(maxStamina(state)).toBe(160);
    expect(activityStaminaCost(state, vocal)).toBe(14);

    state.vars = { ...(state.vars ?? {}), 'stamina.trustBonus': 56 };
    expect(maxStamina(state)).toBe(216);
  });
});
