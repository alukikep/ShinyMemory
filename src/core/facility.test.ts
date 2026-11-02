import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import {
  getFacilityLevel,
  newGame,
  upgradeFacility,
} from './sim';
import type { FacilityDef } from './types';

const TEST_FACILITY: FacilityDef = {
  id: 'test.vocal',
  name: '测试声乐室',
  description: '',
  locationId: 'practice_room',
  activityId: 'vocal',
  varKey: 'facility.test.vocal',
  levels: [
    { level: 1, cost: 5000, description: '中级' },
    { level: 2, cost: 10000, description: '高级' },
    { level: 3, cost: 15000, description: '顶级' },
  ],
};

function registered(): void {
  CONTENT_INDEX.facilities.set(TEST_FACILITY.id, TEST_FACILITY);
}

afterEach(() => {
  CONTENT_INDEX.facilities.delete(TEST_FACILITY.id);
});

describe('facility upgrades', () => {
  it('upgrades one room and stores the level in vars', () => {
    registered();
    const state = newGame(1);
    state.phase = 'plan';
    state.locationId = 'practice_room';
    state.money = 30000;

    const next = upgradeFacility(state, TEST_FACILITY.id);
    expect(next.money).toBe(25000);
    expect(getFacilityLevel(next, TEST_FACILITY.id)).toBe(1);
    expect(next.vars?.['facility.test.vocal']).toBe(1);
  });

  it('stops at max level and rejects wrong location or insufficient money', () => {
    registered();
    const base = newGame(1);
    base.phase = 'plan';
    base.locationId = 'practice_room';
    base.money = 30000;

    let state = base;
    for (let i = 0; i < 3; i += 1) {
      state = upgradeFacility(state, TEST_FACILITY.id);
    }
    expect(getFacilityLevel(state, TEST_FACILITY.id)).toBe(3);
    expect(upgradeFacility(state, TEST_FACILITY.id)).toBe(state);

    const poor = { ...base, money: 100 };
    expect(upgradeFacility(poor, TEST_FACILITY.id)).toBe(poor);

    const elsewhere = { ...base, locationId: 'office' };
    expect(upgradeFacility(elsewhere, TEST_FACILITY.id)).toBe(elsewhere);
  });

  it('only changes the targeted room', () => {
    registered();
    const other: FacilityDef = {
      ...TEST_FACILITY,
      id: 'test.dance',
      name: '测试舞蹈室',
      activityId: 'dance',
      varKey: 'facility.test.dance',
    };
    CONTENT_INDEX.facilities.set(other.id, other);
    const state = newGame(1);
    state.phase = 'plan';
    state.locationId = 'practice_room';
    state.money = 30000;

    const next = upgradeFacility(state, TEST_FACILITY.id);
    expect(getFacilityLevel(next, TEST_FACILITY.id)).toBe(1);
    expect(getFacilityLevel(next, other.id)).toBe(0);
    CONTENT_INDEX.facilities.delete(other.id);
  });
});
