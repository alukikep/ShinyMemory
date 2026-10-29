import type { Condition, Effect } from './types';

/**
 * 内容里允许出现的条件与效果。**这是唯一的运行时白名单**：
 * 引擎的 `checkCondition` / `applyEffects` 和内容体检都读这一份，
 * 不要再在别处手抄一遍（审查台以前就是这么漂移的）。
 *
 * 下面两行是编译期保证：`types.ts` 加了新种类却没加进这里，tsc 会直接报错。
 */

export const EFFECT_KINDS = [
  'sharedStat',
  'attributeExp',
  'money',
  'flag',
  'var',
  'fans',
  'scheduleEvent',
  'unlockSlot',
  'grantEquip',
  'scheduleOverride',
  'actorAffinity',
  'log',
] as const;

export type EffectKind = (typeof EFFECT_KINDS)[number];

export const CONDITION_KINDS = [
  'dayAtLeast',
  'weekAtLeast',
  'timeWindow',
  'sharedStatAtLeast',
  'sharedStatAtMost',
  'attributeAtLeast',
  'attributeAtMost',
  'castPresent',
  'npcAffinityAtLeast',
  'npcAffinityAtMost',
  'moneyAtMost',
  'moneyAtLeast',
  'hasItem',
  'idolStatus',
  'atLocation',
  'flag',
  'varAtLeast',
  'varAtMost',
  'fansAtLeast',
  'fansAtMost',
  'all',
  'any',
  'not',
] as const;

export type ConditionKind = (typeof CONDITION_KINDS)[number];

type AssertNever<T extends never> = T;
export type _EffectKindsComplete = AssertNever<
  Exclude<Effect['kind'], EffectKind>
>;
export type _ConditionKindsComplete = AssertNever<
  Exclude<Condition['kind'], ConditionKind>
>;

const EFFECT_KIND_SET: ReadonlySet<string> = new Set(EFFECT_KINDS);
const CONDITION_KIND_SET: ReadonlySet<string> = new Set(CONDITION_KINDS);

export function isKnownEffectKind(kind: string): boolean {
  return EFFECT_KIND_SET.has(kind);
}

export function isKnownConditionKind(kind: string): boolean {
  return CONDITION_KIND_SET.has(kind);
}
