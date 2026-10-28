import type { ExpTier, Rank } from './types';

export const RANK_ORDER: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export const RANK_CURVE: Record<Rank, number> = {
  F: 20,
  E: 40,
  D: 60,
  C: 90,
  B: 130,
  A: 160,
  S: 0,
};

export const EXP_TIER_VALUES: Record<ExpTier, number> = {
  1: 1,
  3: 3,
  5: 5,
  10: 10,
  20: 20,
};

export const DEFAULT_REWARD_MULTIPLIERS: Record<Rank, number> = {
  F: 0.8,
  E: 0.9,
  D: 1,
  C: 1.15,
  B: 1.3,
  A: 1.5,
  S: 1.8,
};

export const DEFAULT_FAILURE_BY_GAP: Record<number, number> = {
  1: 0.25,
  2: 0.5,
  3: 0.7,
  4: 0.85,
};

/** 制作人属性只加不减：F 起就是 1.0，S 到 1.5。 */
export const DEFAULT_PRODUCER_MULTIPLIERS: Record<Rank, number> = {
  F: 1,
  E: 1.1,
  D: 1.2,
  C: 1.3,
  B: 1.4,
  A: 1.45,
  S: 1.5,
};

export function nextRank(rank: Rank): Rank | undefined {
  const index = RANK_ORDER.indexOf(rank);
  return index >= 0 && index < RANK_ORDER.length - 1
    ? RANK_ORDER[index + 1]
    : undefined;
}

export function rankIndex(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

export function sameOrHigherRank(a: Rank, b: Rank): boolean {
  return rankIndex(a) >= rankIndex(b);
}

export function reduceExpTier(tier: ExpTier): ExpTier {
  if (tier === 20) return 10;
  if (tier === 10) return 5;
  if (tier === 5) return 3;
  return 1;
}
