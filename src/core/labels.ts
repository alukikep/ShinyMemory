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
  stamina: '体能',
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

import type { ModifierKey } from './types';

export const MODIFIER_LABELS: Record<ModifierKey, string> = {
  staminaCost: '体力消耗',
  staminaCap: '体力上限',
  duration: '行动时长',
  travel: '移动耗时',
  trainingExp: '训练 EXP',
  workMoney: '工作报酬',
};

export function attributeLabel(ref: AttributeRefInput): string {
  if (typeof ref === 'string') return STAT_LABELS[ref];
  return ref.scope === 'idol'
    ? STAT_LABELS[ref.key]
    : PRODUCER_STAT_LABELS[ref.key];
}
