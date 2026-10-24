import { describe, expect, it } from 'vitest';
import {
  activityAvailability,
  getActivity,
  getStatValue,
  handleAction,
  isLocationOpen,
  newGame,
} from './sim';
import { getDay, getMinuteOfDay } from './time';
import type { GameState } from './types';

function run(seed: number): {
  state: GameState;
  actionsByDay: Map<number, number>;
  guard: number;
} {
  let state = newGame(seed);
  const actionsByDay = new Map<number, number>();
  let guard = 0;

  const count = (day: number) => {
    actionsByDay.set(day, (actionsByDay.get(day) ?? 0) + 1);
  };

  while (getDay(state.clock.absoluteMinutes) <= 7 && guard < 500) {
    guard += 1;

    if (state.phase === 'plan') {
      const day = getDay(state.clock.absoluteMinutes);
      const minute = getMinuteOfDay(state.clock.absoluteMinutes);
      const sleep = getActivity('sleep')!;

      if (activityAvailability(state, sleep).ok) {
        state = handleAction(state, 'sleep');
        continue;
      }

      if (minute >= 20 * 60) {
        if (state.locationId !== 'home') {
          state = handleAction(state, 'move:home');
          continue;
        }
        state = handleAction(state, 'look_around');
        count(day);
        continue;
      }

      if (state.flags.forced_rest) {
        if (state.locationId !== 'office') {
          state = handleAction(state, 'move:office');
          continue;
        }
        state = handleAction(state, 'rest');
        count(day);
        continue;
      }

      let target = 'vocal';
      if (getStatValue(state, 'stamina') < 35) target = 'rest';
      else if (state.money < 500) target = 'work';
      else target = ['vocal', 'dance', 'expression'][state.actionsTaken % 3]!;

      let activity = getActivity(target)!;
      const locationId = activity.locations?.[0];
      if (locationId && !isLocationOpen(state, locationId)) {
        const wait = ['look_around', 'free']
          .map((id) => getActivity(id))
          .find((item) => item && activityAvailability(state, item).ok);
        if (wait) {
          state = handleAction(state, wait.id);
          count(day);
          continue;
        }
      }

      if (locationId && state.locationId !== locationId) {
        state = handleAction(state, `move:${locationId}`);
        continue;
      }

      if (!activityAvailability(state, activity).ok) {
        target = 'rest';
        activity = getActivity(target)!;
        const restLocation = activity.locations?.[0];
        if (restLocation && state.locationId !== restLocation) {
          state = handleAction(state, `move:${restLocation}`);
          continue;
        }
      }

      state = handleAction(state, target);
      count(day);
      continue;
    }

    if (state.phase === 'event') {
      state = handleAction(state, 'choice:0');
      continue;
    }

    state = handleAction(state, 'continue');
  }

  return { state, actionsByDay, guard };
}

describe('time balance audit', () => {
  it('reports actions per day across an open week', () => {
    const runs = 20;
    const dayTotals = new Map<number, number>();
    let totalActions = 0;
    let totalTrust = 0;
    let totalStress = 0;
    let totalDay = 0;

    for (let seed = 1; seed <= runs; seed += 1) {
      const result = run(seed);
      totalDay += getDay(result.state.clock.absoluteMinutes);
      totalTrust += getStatValue(result.state, 'trust');
      totalStress += getStatValue(result.state, 'stress');

      for (const [day, count] of result.actionsByDay) {
        dayTotals.set(day, (dayTotals.get(day) ?? 0) + count);
        totalActions += count;
      }
    }

    const averages = Object.fromEntries(
      [...dayTotals.entries()].map(([day, count]) => [
        `day${day}`,
        Number((count / runs).toFixed(1)),
      ]),
    );

    console.log('avg day', (totalDay / runs).toFixed(1));
    console.log('avg actions per day', averages);
    console.log('avg actions total', (totalActions / runs).toFixed(1));
    console.log('avg trust', (totalTrust / runs).toFixed(1));
    console.log('avg stress', (totalStress / runs).toFixed(1));

    expect(totalDay / runs).toBeGreaterThan(7);
    expect(totalActions / runs).toBeGreaterThan(8);
  });
});
