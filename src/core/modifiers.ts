import { MODIFIER_LABELS } from './labels';
import type { Modifier, ModifierKey } from './types';

export type ModifierSource = {
  /** 展示用标签，同时用于分解面板 */
  label: string;
  modifiers: Modifier[];
};

export type ModifierBreakdown = {
  total: number;
  parts: { label: string; value: number }[];
};

/**
 * 把一组来源合成一个倍率：add 部分求和，mul 部分连乘，
 * 结果 = product × (1 + sum)。纯函数，不读 state——
 * 过滤（when / idolId）由调用方负责。
 */
export function combineModifiers(
  sources: ModifierSource[],
  key: ModifierKey,
  matches: (modifier: Modifier) => boolean = () => true,
): ModifierBreakdown {
  let product = 1;
  let sum = 0;
  const parts: ModifierBreakdown['parts'] = [];

  for (const source of sources) {
    for (const modifier of source.modifiers) {
      if (modifier.key !== key) continue;
      if (!matches(modifier)) continue;
      if ((modifier.op ?? 'mul') === 'add') {
        sum += modifier.value;
      } else {
        product *= modifier.value;
      }
      parts.push({ label: source.label, value: modifier.value });
    }
  }

  return { total: product * (1 + sum), parts };
}

/** 一条加成的人话：「体力消耗 ×0.90」「训练 EXP +20%」。 */
export function describeModifier(modifier: Modifier): string {
  const label = MODIFIER_LABELS[modifier.key];
  if ((modifier.op ?? 'mul') === 'add') {
    const sign = modifier.value > 0 ? '+' : '';
    return `${label} ${sign}${Math.round(modifier.value * 100)}%`;
  }
  return `${label} ×${modifier.value.toFixed(2)}`;
}
