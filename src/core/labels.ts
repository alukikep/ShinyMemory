import type {
  AttributeRefInput,
  ProducerStatKey,
  SharedStatKey,
  StatKey,
} from './types';

export const STAT_LABELS: Record<StatKey, string> = {
  vocal: '歌唱',
  dance: '舞蹈',
  expression: '表现',
  stamina: '体力',
  stress: '压力',
  trust: '信任',
};

export const PRODUCER_STAT_LABELS: Record<ProducerStatKey, string> = {
  photography: '摄影',
};

export const STAT_MAX: Record<SharedStatKey, number> = {
  stamina: 100,
  stress: 100,
};

export const STAT_SHORT: Record<StatKey, string> = {
  vocal: '歌',
  dance: '舞',
  expression: '表',
  stamina: '体',
  stress: '压',
  trust: '心',
};

export function attributeLabel(ref: AttributeRefInput): string {
  if (typeof ref === 'string') return STAT_LABELS[ref];
  return ref.scope === 'idol'
    ? STAT_LABELS[ref.key]
    : PRODUCER_STAT_LABELS[ref.key];
}
