import { describe, expect, it } from 'vitest';
import { activityAvailability, getActivity, handleAction, newGame } from './sim';
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
  lazy: (state) => (state.stats.stress > 20 ? 'rest' : 'free'),
};

function run(strategy: Strategy, seed: number): GameState {
  let state = newGame(seed);
  let guard = 0;
  while (state.phase !== 'ending' && guard < 300) {
    guard += 1;
    if (state.phase === 'plan') {
      let action = state.flags.forced_rest ? 'rest' : strategy(state);
      const activity = getActivity(action);
      if (!activity || !activityAvailability(state, activity).ok) {
        action = 'rest';
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
  it('reports ending distribution', () => {
    const allEndings = new Set<string>();
    for (const [name, strategy] of Object.entries(strategies)) {
      const endings = new Map<string, number>();
      let scoreTotal = 0;
      let stressTotal = 0;
      let trustTotal = 0;
      const runs = 30;
      for (let seed = 1; seed <= runs; seed += 1) {
        const state = run(strategy, seed);
        const ending = state.endingId ?? 'none';
        expect(ending).not.toBe('none');
        allEndings.add(ending);
        endings.set(ending, (endings.get(ending) ?? 0) + 1);
        scoreTotal += state.examScore ?? 0;
        stressTotal += state.stats.stress;
        trustTotal += state.stats.trust;
      }
      console.log(
        name,
        Object.fromEntries(endings),
        'avg score',
        Math.round(scoreTotal / runs),
        'avg stress',
        Math.round(stressTotal / runs),
        'avg trust',
        Math.round(trustTotal / runs),
      );
    }
    expect(allEndings.has('end.true')).toBe(true);
    expect(allEndings.has('end.normal')).toBe(true);
    expect(allEndings.has('end.bad')).toBe(true);
  });
});
