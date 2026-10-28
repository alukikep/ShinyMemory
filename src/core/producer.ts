import type { ProducerStatKey, ProducerStats, Rank } from './types';

export const PRODUCER_STAT_KEYS: ProducerStatKey[] = ['photography'];

const PRODUCER_GROWTH: Record<
  ProducerStatKey,
  { initial: Rank; max: Rank }
> = {
  photography: { initial: 'F', max: 'S' },
};

export function createInitialProducerStats(): ProducerStats {
  const stats = {} as ProducerStats;
  for (const key of PRODUCER_STAT_KEYS) {
    const growth = PRODUCER_GROWTH[key];
    stats[key] = { rank: growth.initial, exp: 0, maxRank: growth.max };
  }
  return stats;
}
