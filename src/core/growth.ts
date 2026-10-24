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
