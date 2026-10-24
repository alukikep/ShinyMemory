import { describe, expect, it } from 'vitest';
import { handleAction, newGame } from './sim';
import type { GameState } from './types';

type Strategy = (state: GameState) => string;

const cycle = (state: GameState, ids: string[]) =>
  ids[state.actionsTaken % ids.length]!;

const strategies: Record<string, Strategy> = {
  balanced: (state) => {
    const { stamina, stress, trust } = state.stats;
    if (state.money < 500) return 'work';
    if (stamina < 35 || stress > 65) return 'rest';
    if (trust < 10 && state.actionsTaken % 5 === 0) return 'free';
    return cycle(state, ['vocal', 'dance', 'expression']);
  },
  training: (state) => {
    const { stamina, stress } = state.stats;
    if (state.money < 500) return 'work';
    if (stamina < 25 || stress > 75) return 'rest';
    return cycle(state, ['vocal', 'dance', 'expression']);
  },
  work: (state) => {
    if (state.stats.stamina < 30) return 'rest';
    return 'work';
  },
  vocalOnly: (state) => {
    if (state.money < 500 || state.stats.stamina < 15) return 'rest';
    return 'vocal';
  },
  stressBuild: (state) => {
    if (state.stats.stamina < 20) return 'rest';
    if (state.money < 500) return 'work';
    return 'dance';
  },
  grind: (state) => {
    if (state.stats.stamina < 20) return 'rest';
    return 'work';
  },
};

function run(strategy: Strategy, seed: number) {
  let state = newGame(seed);
  let maxStress = 0;
  const events = new Map<string, number>();
  let guard = 0;
  while (state.phase !== 'ending' && guard < 400) {
    guard += 1;
    if (state.phase === 'event') {
      maxStress = Math.max(maxStress, state.stats.stress);
      const id = state.pendingEventId ?? 'unknown';
      events.set(id, (events.get(id) ?? 0) + 1);
      state = handleAction(state, 'choice:0');
    } else if (state.phase === 'plan') {
      state = handleAction(state, strategy(state));
    } else {
      state = handleAction(state, 'continue');
    }
    maxStress = Math.max(maxStress, state.stats.stress);
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
    expect(globalEvents.has('evt.insomnia')).toBe(true);
    expect(globalEvents.has('evt.vocal_strain')).toBe(true);
    expect(globalEvents.has('evt.collapse')).toBe(true);
  });
});
