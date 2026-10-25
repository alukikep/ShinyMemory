import { describe, it } from 'vitest';
import {
  activityAvailability,
  getActivity,
  getStatValue,
  handleAction,
  newGame,
  travelTo,
} from './sim';
import type { GameState } from './types';
import { getDay, getMinuteOfDay } from './time';

type Strategy = (state: GameState) => string;

const cycle = (state: GameState, ids: string[]) =>
  ids[state.actionsTaken % ids.length]!;

const strategies: Record<string, Strategy> = {
  balanced: (state) => {
    const stamina = getStatValue(state, 'stamina');
    const stress = getStatValue(state, 'stress');
    const trust = getStatValue(state, 'trust');
    if (stamina < 35 || stress > 65) return 'rest';
    if (state.money < 500) return 'work';
    if (trust < 3 && state.actionsTaken % 5 === 0) return 'free';
    return cycle(state, ['vocal', 'dance', 'expression']);
  },
  training: (state) => {
    const stamina = getStatValue(state, 'stamina');
    const stress = getStatValue(state, 'stress');
    if (stamina < 25 || stress > 75) return 'rest';
    if (state.money < 500) return 'work';
    return cycle(state, ['vocal', 'dance', 'expression']);
  },
  work: (state) => {
    if (getStatValue(state, 'stamina') < 30) return 'rest';
    return 'work';
  },
  singleStat: (state) => {
    if (
      getStatValue(state, 'stamina') < 30 ||
      getStatValue(state, 'stress') > 70
    ) {
      return 'rest';
    }
    if (state.money < 500) return 'work';
    return 'vocal';
  },
  lazy: (state) =>
    getStatValue(state, 'stress') > 20 ? 'rest' : 'free',
};

function run(strategy: Strategy, seed: number): GameState {
  let state = newGame(seed);
  let guard = 0;

  const findFallback = () => {
    for (const id of ['rest', 'sleep', 'look_around', 'free']) {
      const item = getActivity(id);
      if (!item) continue;
      const target = item.locations?.[0] ?? state.locationId;
      if (
        activityAvailability({ ...state, locationId: target }, item).ok
      ) {
        return { activity: item, target };
      }
    }
    return null;
  };

  while (getDay(state.clock.absoluteMinutes) <= 7 && guard < 600) {
    guard += 1;
    if (state.phase === 'plan') {
      const minute = getMinuteOfDay(state.clock.absoluteMinutes);
      if (minute >= 20 * 60 || minute < 8 * 60) {
        if (state.locationId !== 'home') {
          state = travelTo(state, 'home');
          continue;
        }
        state = handleAction(state, 'sleep');
        continue;
      }

      let action = state.flags.forced_rest ? 'rest' : strategy(state);
      let activity = getActivity(action) ?? getActivity('rest')!;
      action = activity.id;

      const target = activity.locations?.[0] ?? state.locationId;
      if (target !== state.locationId) {
        const moved = travelTo(state, target);
        if (moved.locationId !== target) break;
        state = moved;
        continue;
      } else if (!activityAvailability(state, activity).ok) {
        const fallback = findFallback();
        if (!fallback) break;
        if (fallback.target !== state.locationId) {
          const moved = travelTo(state, fallback.target);
          if (moved.locationId !== fallback.target) break;
          state = moved;
          continue;
        }
        action = fallback.activity.id;
      }

      state = handleAction(state, action);
    } else if (state.phase === 'event') {
      state = handleAction(state, 'choice:0');
    } else {
      state = handleAction(state, 'continue');
    }
  }
  return state;
}

describe('balance smoke', () => {
  it('reports open-ended progression', () => {
    for (const [name, strategy] of Object.entries(strategies)) {
      let dayTotal = 0;
      let stressTotal = 0;
      let trustTotal = 0;
      const runs = 30;
      for (let seed = 1; seed <= runs; seed += 1) {
        const state = run(strategy, seed);
        dayTotal += getDay(state.clock.absoluteMinutes);
        stressTotal += getStatValue(state, 'stress');
        trustTotal += getStatValue(state, 'trust');
      }
      console.log(
        name,
        'avg day',
        Math.round(dayTotal / runs),
        'avg stress',
        Math.round(stressTotal / runs),
        'avg trust',
        Math.round(trustTotal / runs),
      );
    }
  });
});
