import { describe, expect, it } from 'vitest';
import { buildScene } from './scene';
import {
  MID_EXAM_DAY,
  MID_EXAM_MINUTE,
  MINUTES_PER_DAY,
  START_MINUTE,
} from './config';
import {
  activityAvailability,
  advanceTime,
  applyActivity,
  getActivity,
  handleAction,
  moveTo,
  newGame,
} from './sim';
import { formatClock, getDay } from './time';

describe('raising sim core', () => {
  it('starts on day 1 at 08:00 with the expected numbers', () => {
    const state = newGame(1);
    expect(getDay(state.clock.absoluteMinutes)).toBe(1);
    expect(formatClock(state.clock.absoluteMinutes)).toBe('08:00');
    expect(state.locationId).toBe('office');
    expect(state.phase).toBe('plan');
    expect(state.stats.vocal).toBe(20);
    expect(state.money).toBe(3000);
    expect(state.actionsTaken).toBe(0);
  });

  it('applies activity costs, effects and duration', () => {
    const state = moveTo(newGame(1), 'practice_room');
    const next = applyActivity(state, 'vocal');
    expect(next.stats.vocal).toBe(26);
    expect(next.money).toBe(2500);
    expect(next.stats.stamina).toBe(85);
    expect(next.stats.stress).toBe(8);
    expect(next.phase).toBe('activityResult');
    expect(next.actionsTaken).toBe(1);
    expect(formatClock(next.clock.absoluteMinutes)).toBe('10:15');
  });

  it('disables a lesson when money is not enough', () => {
    const state = moveTo(newGame(1), 'practice_room');
    state.money = 100;
    const activity = getActivity('vocal');
    expect(activity).toBeTruthy();
    const availability = activityAvailability(state, activity!);
    expect(availability.ok).toBe(false);
    expect(availability.reason).toBe('金钱不足');
  });

  it('blocks an activity outside its location', () => {
    const state = newGame(1);
    const activity = getActivity('vocal');
    const availability = activityAvailability(state, activity!);
    expect(availability.ok).toBe(false);
    expect(availability.reason).toBe('不在此地点');
  });

  it('takes 15 minutes to move and keeps the action count', () => {
    const state = newGame(1);
    const next = moveTo(state, 'practice_room');
    expect(next.locationId).toBe('practice_room');
    expect(next.actionsTaken).toBe(state.actionsTaken);
    expect(next.clock.absoluteMinutes - state.clock.absoluteMinutes).toBe(15);

    const back = moveTo(next, 'office');
    expect(back.locationId).toBe('office');
    expect(back.clock.absoluteMinutes - next.clock.absoluteMinutes).toBe(15);
  });

  it('looks around and triggers each location event', () => {
    const cases: Array<[string, string]> = [
      ['office', 'evt.office_desk'],
      ['practice_room', 'evt.practice_note'],
      ['studio', 'evt.studio_headphones'],
    ];

    for (const [locationId, eventId] of cases) {
      let state = moveTo(newGame(1), locationId);
      state = handleAction(state, 'look_around');
      expect(state.phase).toBe('activityResult');

      state = handleAction(state, 'continue');
      expect(state.phase).toBe('event');
      expect(state.pendingEventId).toBe(eventId);
    }
  });

  it('sleeps until 08:00 and restores stamina by hours slept', () => {
    let state = moveTo(newGame(1), 'home');
    state = advanceTime(state, 14 * 60);
    state.stats.stamina = 20;
    state.stats.stress = 50;

    const slept = applyActivity(state, 'sleep');
    expect(formatClock(slept.clock.absoluteMinutes)).toBe('08:00');
    expect(getDay(slept.clock.absoluteMinutes)).toBe(2);
    expect(slept.stats.stamina).toBe(100);
    expect(slept.stats.stress).toBeLessThan(50);
    expect(slept.phase).toBe('activityResult');
  });

  it('marks the mid exam pending when time crosses day 2 20:00', () => {
    const state = newGame(1);
    const midAt = (MID_EXAM_DAY - 1) * MINUTES_PER_DAY + MID_EXAM_MINUTE;
    const advanced = advanceTime(state, midAt - START_MINUTE + 1);
    expect(advanced.pendingExam).toBe('mid');
  });

  it('blocks training outside its time window', () => {
    const state = advanceTime(moveTo(newGame(1), 'practice_room'), 13 * 60);
    const activity = getActivity('vocal')!;
    const availability = activityAvailability(state, activity);
    expect(availability.ok).toBe(false);
    expect(availability.reason).toBe('现在不能做');
  });

  it('hides actions outside their time windows', () => {
    const state = advanceTime(moveTo(newGame(1), 'practice_room'), 13 * 60);
    const labels = buildScene(state).actions.map((action) => action.label);
    expect(labels).not.toContain('声乐课');
    expect(labels).toContain('自由时间');
    expect(labels).toContain('环顾四周');
  });

  it('blocks sleep during the day and allows it at night', () => {
    const state = moveTo(newGame(1), 'home');
    const sleep = getActivity('sleep')!;
    const blocked = activityAvailability(state, sleep);
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe('现在还不能睡');

    const evening = advanceTime(state, 12 * 60);
    expect(activityAvailability(evening, sleep).ok).toBe(true);
  });
});
