import type { StatKey } from './types';

export const STAT_LABELS: Record<StatKey, string> = {
  vocal: '歌唱',
  dance: '舞蹈',
  expression: '表现',
  stamina: '体力',
  stress: '压力',
  trust: '信任',
};

export const STAT_MAX: Record<StatKey, number> = {
  vocal: 100,
  dance: 100,
  expression: 100,
  stamina: 100,
  stress: 100,
  trust: 20,
};

export const STAT_SHORT: Record<StatKey, string> = {
  vocal: '歌',
  dance: '舞',
  expression: '表',
  stamina: '体',
  stress: '压',
  trust: '心',
};
