import { describe, expect, it } from 'vitest';
import {
  activityAvailability,
  getActivity,
  getStatValue,
  handleAction,
  isLocationOpen,
  newGame,
} from './sim';
import type { GameState } from './types';
import { getDay } from './time';

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
    if (trust < 10 && state.actionsTaken % 5 === 0) return 'free';
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
  vocalOnly: (state) => {
    if (
      state.money < 500 ||
      getStatValue(state, 'stamina') < 15
    ) {
      return 'rest';
    }
    return 'vocal';
  },
  stressBuild: (state) => {
    if (getStatValue(state, 'stamina') < 20) return 'rest';
    if (state.money < 500) return 'work';
    return 'dance';
  },
  grind: (state) => {
    if (getStatValue(state, 'stamina') < 20) return 'rest';
    return 'work';
  },
};

function run(strategy: Strategy, seed: number) {
  let state = newGame(seed);
  let maxStress = 0;
  const events = new Map<string, number>();
  let guard = 0;

  const findFallback = () => {
    for (const id of ['rest', 'sleep', 'look_around', 'free']) {
      const item = getActivity(id);
      if (!item) continue;
      const target = item.locations?.[0] ?? state.locationId;
      if (!isLocationOpen(state, target)) continue;
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
    if (state.phase === 'event') {
      maxStress = Math.max(maxStress, getStatValue(state, 'stress'));
      const id = state.pendingEventId ?? 'unknown';
      events.set(id, (events.get(id) ?? 0) + 1);
      state = handleAction(state, 'choice:0');
    } else if (state.phase === 'plan') {
      let action = state.flags.forced_rest ? 'rest' : strategy(state);
      let activity = getActivity(action) ?? getActivity('rest')!;
      action = activity.id;

      const target = activity.locations?.[0] ?? state.locationId;
      if (!isLocationOpen(state, target)) {
        const fallback = findFallback();
        if (!fallback) break;
        if (fallback.target !== state.locationId) {
          state = handleAction(state, `move:${fallback.target}`);
          continue;
        }
        action = fallback.activity.id;
      } else if (target !== state.locationId) {
        state = handleAction(state, `move:${target}`);
        continue;
      } else if (!activityAvailability(state, activity).ok) {
        const fallback = findFallback();
        if (!fallback) break;
        if (fallback.target !== state.locationId) {
          state = handleAction(state, `move:${fallback.target}`);
          continue;
        }
        action = fallback.activity.id;
      }

      state = handleAction(state, action);
    } else {
      state = handleAction(state, 'continue');
    }
    maxStress = Math.max(maxStress, getStatValue(state, 'stress'));
  }
  return { state, maxStress, events };
}

describe('trigger audit', () => {
  it('reports stress and event frequencies', () => {
    const globalEvents = new Set<string>();
    for (const [name, strategy] of Object.entries(strategies)) {
      const all = new Map<string, number>();
      let maxStressTotal = 0;
      let stressEvents = 0;
      const runs = 30;
      for (let seed = 1; seed <= runs; seed += 1) {
        const result = run(strategy, seed);
        maxStressTotal += result.maxStress;
        for (const [id, count] of result.events) {
          all.set(id, (all.get(id) ?? 0) + count);
          globalEvents.add(id);
          if ([
            'evt.night_practice',
            'evt.insomnia',
            'evt.collapse',
            'evt.escape',
            'evt.online_comment',
            'evt.vocal_strain',
          ].includes(id)) {
            stressEvents += count;
          }
        }
      }
      console.log(
        name,
        'avg max stress',
        Math.round(maxStressTotal / runs),
        'stress events',
        stressEvents,
        'events',
        Object.fromEntries(all),
      );
      expect(stressEvents).toBeGreaterThan(0);
    }

    expect(globalEvents.has('evt.night_practice')).toBe(true);
    // evt.insomnia is night-only (00:00–05:00); daytime strategies don't reach it.
    expect(globalEvents.has('evt.vocal_strain')).toBe(true);
    expect(globalEvents.has('evt.collapse')).toBe(true);
  });
});
