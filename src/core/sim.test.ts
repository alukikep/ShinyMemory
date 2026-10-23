import { describe, expect, it } from 'vitest';
import {
  activityAvailability,
  applyActivity,
  getActivity,
  handleAction,
  newGame,
} from './sim';

describe('raising sim core', () => {
  it('starts at week 1 with the expected numbers', () => {
    const state = newGame(1);
    expect(state.week).toBe(1);
    expect(state.slot).toBe(0);
    expect(state.phase).toBe('plan');
    expect(state.stats.vocal).toBe(20);
    expect(state.money).toBe(3000);
    expect(state.actionsTaken).toBe(0);
  });

  it('applies activity costs and effects', () => {
    const state = newGame(1);
    const next = applyActivity(state, 'vocal');
    expect(next.stats.vocal).toBe(26);
    expect(next.money).toBe(2500);
    expect(next.stats.stamina).toBe(85);
    expect(next.stats.stress).toBe(8);
    expect(next.phase).toBe('activityResult');
    expect(next.actionsTaken).toBe(1);
  });

  it('disables a lesson when money is not enough', () => {
    const state = newGame(1);
    state.money = 100;
    const activity = getActivity('vocal');
    expect(activity).toBeTruthy();
    const availability = activityAvailability(state, activity!);
    expect(availability.ok).toBe(false);
    expect(availability.reason).toBe('金钱不足');
  });

  it('reaches the mid exam after 10 actions', () => {
    let state = newGame(1);
    let guard = 0;
    while (state.phase !== 'examMid' && guard < 60) {
      guard += 1;
      if (state.phase === 'plan') {
        state = handleAction(state, 'rest');
      } else if (state.phase === 'event') {
        state = handleAction(state, 'choice:0');
      } else {
        state = handleAction(state, 'continue');
      }
    }
    expect(state.phase).toBe('examMid');
    expect(state.week).toBe(6);
    expect(state.actionsTaken).toBe(10);
  });

  it('can finish a full 24-action run and reach an ending', () => {
    let state = newGame(1);
    let guard = 0;
    while (state.phase !== 'ending' && guard < 80) {
      guard += 1;
      if (state.phase === 'plan') {
        state = handleAction(state, 'rest');
      } else if (state.phase === 'event') {
        state = handleAction(state, 'choice:0');
      } else {
        state = handleAction(state, 'continue');
      }
    }
    expect(state.phase).toBe('ending');
    expect(state.endingId).toBeTruthy();
    expect(state.actionsTaken).toBe(24);
  });
});
