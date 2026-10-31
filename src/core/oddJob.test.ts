import { describe, expect, it } from 'vitest';
import { newGame } from './sim';
import { ODD_JOB_SCALE_BY_RANK, isOddJob, oddJobScale } from './oddJob';
import { PRODUCTION_PACK } from './productionPack';
import type { Rank } from './types';

const activities = new Map(PRODUCTION_PACK.activities.map((a) => [a.id, a]));

describe('odd job scaling', () => {
  it('recognises the work activities that pay money', () => {
    expect(isOddJob(activities.get('activity.daily_errand')!)).toBe(true);
    expect(isOddJob(activities.get('activity.office_filing')!)).toBe(true);
    expect(isOddJob(activities.get('activity.carry_gear')!)).toBe(true);
    // 训练不是零工
    expect(isOddJob(activities.get('vocal')!)).toBe(false);
  });

  it('gets cheaper in time and stamina as the producer ranks up', () => {
    const ranks: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
    for (let i = 1; i < ranks.length; i += 1) {
      const previous = ODD_JOB_SCALE_BY_RANK[ranks[i - 1]!];
      const current = ODD_JOB_SCALE_BY_RANK[ranks[i]!];
      expect(current.duration).toBeLessThan(previous.duration);
      expect(current.stamina).toBeLessThan(previous.stamina);
      expect(current.pay).toBeGreaterThan(previous.pay);
    }
  });

  it('scales by the producer stat the job trains', () => {
    const state = newGame(1);
    const errand = activities.get('activity.daily_errand')!;
    // 发传单练交涉
    expect(oddJobScale({ ...state, producer: { ...state.producer, negotiation: { ...state.producer.negotiation, rank: 'F' } } }, errand)?.pay).toBeCloseTo(0.55);
    expect(oddJobScale({ ...state, producer: { ...state.producer, negotiation: { ...state.producer.negotiation, rank: 'A' } } }, errand)?.pay).toBeCloseTo(1.45);
  });
});
