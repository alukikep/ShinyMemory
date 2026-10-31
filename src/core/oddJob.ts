import type { ActivityDef, GameState, ProducerStatKey, Rank } from './types';

/**
 * 制作人零工的成长倍率。
 *
 * 同一个行动，制作人越熟练，**越快、越赚、越省力**：
 * 刚出道发传单要站很久才拿到一点钱；交涉到 A 以后一小时就能拿到以前两倍。
 *
 * 为什么用一张表而不是每个行动写梯度：
 * 三个零工考的是三条不同的制作人属性（交涉 / 企划 / 体能），
 * 每一条都单独写梯度，改一次平衡要改三处，迟早漂移。
 *
 * 界面上的时长、体力、报酬都必须经过这里——见 activityDuration /
 * activityStaminaCost / applyActivityDef。
 */
export type OddJobScale = {
  /** 时长倍率 */
  duration: number;
  /** 报酬倍率 */
  pay: number;
  /** 体力倍率 */
  stamina: number;
  /** 压力倍率 */
  stress: number;
};

export const ODD_JOB_SCALE_BY_RANK: Record<Rank, OddJobScale> = {
  F: { duration: 1.6, pay: 0.55, stamina: 1.4, stress: 1.3 },
  E: { duration: 1.4, pay: 0.7, stamina: 1.25, stress: 1.2 },
  D: { duration: 1.2, pay: 0.85, stamina: 1.1, stress: 1.1 },
  C: { duration: 1.0, pay: 1.0, stamina: 1.0, stress: 1.0 },
  B: { duration: 0.85, pay: 1.2, stamina: 0.9, stress: 0.9 },
  A: { duration: 0.7, pay: 1.45, stamina: 0.8, stress: 0.8 },
  S: { duration: 0.6, pay: 1.75, stamina: 0.7, stress: 0.7 },
};

const RANK_ORDER: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export function rankIndexOf(rank: Rank): number {
  const index = RANK_ORDER.indexOf(rank);
  return index === -1 ? 0 : index;
}

/**
 * 这是一份"制作人零工"吗？
 *
 * 判据：工作是 kind === 'work'，并且直接给钱。
 * 这样以后加新的零工不用登记——写上 money 效果就自动吃倍率。
 */
export function isOddJob(activity: ActivityDef): boolean {
  return (
    activity.kind === 'work' &&
    (activity.effects ?? []).some((effect) => effect.kind === 'money')
  );
}

/**
 * 这份零工考哪条制作人属性。
 *
 * 零工都会给某条制作人属性经验（发传单→交涉、整理资料→企划、搬器材→体能），
 * 就用那条：练什么，什么就让这份工变轻松。
 */
export function oddJobStatKey(activity: ActivityDef): ProducerStatKey {
  for (const effect of activity.effects ?? []) {
    if (effect.kind !== 'attributeExp') continue;
    const ref = effect.ref;
    if (typeof ref === 'object' && ref.scope === 'producer') {
      return ref.key as ProducerStatKey;
    }
  }
  return 'stamina';
}

export function oddJobRank(state: GameState, activity: ActivityDef): Rank {
  const key = oddJobStatKey(activity);
  return state.producer[key]?.rank ?? 'F';
}

export function oddJobScale(
  state: GameState,
  activity: ActivityDef,
): OddJobScale | undefined {
  if (!isOddJob(activity)) return undefined;
  return ODD_JOB_SCALE_BY_RANK[oddJobRank(state, activity)];
}
