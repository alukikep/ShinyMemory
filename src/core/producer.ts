import type { ProducerStatKey, ProducerStats, Rank } from './types';

export const PRODUCER_STAT_KEYS: ProducerStatKey[] = ['photography', 'stamina'];

const PRODUCER_GROWTH: Record<
  ProducerStatKey,
  { initial: Rank; max: Rank }
> = {
  photography: { initial: 'F', max: 'S' },
  stamina: { initial: 'F', max: 'S' },
};

/** 制作人体能属性决定体力上限。 */
export const STAMINA_CAP_BY_RANK: Record<Rank, number> = {
  F: 100,
  E: 125,
  D: 150,
  C: 175,
  B: 200,
  A: 225,
  S: 250,
};

/** 制作人体能属性决定行动体力消耗倍率。 */
export const STAMINA_COST_MULTIPLIER_BY_RANK: Record<Rank, number> = {
  F: 1,
  E: 1,
  D: 0.95,
  C: 0.95,
  B: 0.9,
  A: 0.85,
  S: 0.8,
};

export function staminaCapForRank(rank: Rank): number {
  return STAMINA_CAP_BY_RANK[rank];
}

export function staminaCostMultiplierForRank(rank: Rank): number {
  return STAMINA_COST_MULTIPLIER_BY_RANK[rank];
}

export function createInitialProducerStats(): ProducerStats {
  const stats = {} as ProducerStats;
  for (const key of PRODUCER_STAT_KEYS) {
    const growth = PRODUCER_GROWTH[key];
    stats[key] = { rank: growth.initial, exp: 0, maxRank: growth.max };
  }
  return stats;
}
