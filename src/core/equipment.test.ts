import { describe, expect, it } from 'vitest';
import {
  activityStaminaCost,
  applyActivityDef,
  equipItem,
  equippedEquips,
  getActivity,
  newGame,
  resolveModifiers,
  slotCount,
  slotKeys,
  travelTo,
  unequipSlot,
} from './sim';
import type { ActivityDef, Effect, GameState } from './types';

function grant(state: GameState, effects: Effect[]): GameState {
  const activity: ActivityDef = {
    id: 'test.grant',
    name: '发放',
    description: '测试用',
    kind: 'rest',
    locations: ['practice_room'],
    durationMinutes: 1,
    timeWindows: [{ fromMinute: 8 * 60, toMinute: 22 * 60 }],
    cost: {},
    effects,
    resultTexts: ['好。'],
  };
  return applyActivityDef(state, activity);
}

function base(): GameState {
  return travelTo(newGame(1), 'practice_room');
}

describe('equipment slots', () => {
  it('starts with one charm slot', () => {
    const state = base();
    expect(slotCount(state, 'charm')).toBe(1);
    expect(slotKeys(state, 'charm')).toEqual(['charm1']);
  });

  it('unlocks more slots', () => {
    const state = grant(base(), [{ kind: 'unlockSlot', slot: 'charm' }]);
    expect(slotCount(state, 'charm')).toBe(2);
    expect(slotKeys(state, 'charm')).toEqual(['charm1', 'charm2']);
  });

  it('grants equipment once', () => {
    const state = grant(base(), [
      { kind: 'grantEquip', equipId: 'equip.test.watch' },
      { kind: 'grantEquip', equipId: 'equip.test.watch' },
    ]);
    expect(state.ownedEquips).toEqual(['equip.test.watch']);
  });

  it('ignores unknown equipment ids', () => {
    const state = grant(base(), [
      { kind: 'grantEquip', equipId: 'equip.nope' },
    ]);
    expect(state.ownedEquips ?? []).toEqual([]);
  });
});

describe('equipping', () => {
  it('refuses equipment the player does not own', () => {
    expect(equipItem(base(), 'equip.test.watch')).toEqual(base());
  });

  it('fills the first free slot and stops when full', () => {
    let state = grant(base(), [
      { kind: 'grantEquip', equipId: 'equip.test.watch' },
      { kind: 'grantEquip', equipId: 'equip.test.ribbon' },
    ]);

    state = equipItem(state, 'equip.test.watch');
    expect(state.equipment).toEqual({ charm1: 'equip.test.watch' });

    const full = equipItem(state, 'equip.test.ribbon');
    expect(full.equipment).toEqual({ charm1: 'equip.test.watch' });
  });

  it('uses the second slot once unlocked', () => {
    let state = grant(base(), [
      { kind: 'grantEquip', equipId: 'equip.test.watch' },
      { kind: 'grantEquip', equipId: 'equip.test.ribbon' },
      { kind: 'unlockSlot', slot: 'charm' },
    ]);
    state = equipItem(state, 'equip.test.watch');
    state = equipItem(state, 'equip.test.ribbon');

    expect(state.equipment).toEqual({
      charm1: 'equip.test.watch',
      charm2: 'equip.test.ribbon',
    });
    expect(equippedEquips(state)).toHaveLength(2);
  });

  it('releases the modifier when unequipped', () => {
    const vocal = getActivity('vocal')!;
    let state = grant(base(), [
      { kind: 'grantEquip', equipId: 'equip.test.watch' },
    ]);
    const without = activityStaminaCost(state, vocal);

    state = equipItem(state, 'equip.test.watch');
    const withWatch = activityStaminaCost(state, vocal);
    expect(withWatch).toBeLessThan(without);

    state = unequipSlot(state, 'charm1');
    expect(activityStaminaCost(state, vocal)).toBe(without);
  });

  it('feeds training exp through the same pipeline', () => {
    const state = equipItem(
      grant(base(), [{ kind: 'grantEquip', equipId: 'equip.test.ribbon' }]),
      'equip.test.ribbon',
    );

    expect(resolveModifiers(state, 'trainingExp')).toBeCloseTo(1.2);
  });
});
