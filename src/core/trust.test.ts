import { describe, expect, it } from 'vitest';
import { jobCheckChance, newGame, trustJobBonus } from './sim';
import { PRODUCTION_PACK } from './productionPack';

const job = PRODUCTION_PACK.jobs.find((entry) => entry.id === 'job.studio_shoot')!;

function withTrust(rank: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S') {
  const state = newGame(1);
  if (state.idols.mano) state.idols.mano.stats.trust.rank = rank;
  state.selectedIdolId = 'mano';
  state.focusIdolId = 'mano';
  return state;
}

describe('trust', () => {
  it('adds up to 6% to job checks, capped at B', () => {
    expect(trustJobBonus(withTrust('E'), 'mano')).toBeCloseTo(0);
    expect(trustJobBonus(withTrust('D'), 'mano')).toBeCloseTo(0.02);
    expect(trustJobBonus(withTrust('C'), 'mano')).toBeCloseTo(0.04);
    expect(trustJobBonus(withTrust('B'), 'mano')).toBeCloseTo(0.06);
    // 封顶：A 和 S 不再增长
    expect(trustJobBonus(withTrust('A'), 'mano')).toBeCloseTo(0.06);
    expect(trustJobBonus(withTrust('S'), 'mano')).toBeCloseTo(0.06);
  });

  it('shows up in the job success chance', () => {
    const low = jobCheckChance(withTrust('E'), job, 'mano')!;
    const high = jobCheckChance(withTrust('B'), job, 'mano')!;
    expect(high - low).toBeCloseTo(0.06, 5);
  });

  it('does not overpower the trained attribute', () => {
    // 专业属性差一级是 15%，信任封顶只有 6%
    const state = withTrust('S');
    if (state.idols.mano) state.idols.mano.stats.expression.rank = 'D';
    const weak = jobCheckChance(state, job, 'mano')!;
    if (state.idols.mano) state.idols.mano.stats.expression.rank = 'C';
    const strong = jobCheckChance(state, job, 'mano')!;
    expect(strong - weak).toBeGreaterThan(0.14);
  });
});
