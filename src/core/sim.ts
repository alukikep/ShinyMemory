import {
  ACTOR_AFFINITY_MAX,
  CHAT_DAILY_LIMIT,
  CHAT_MINUTES,
  MINUTES_PER_DAY,
  SLEEP_UNTIL_MINUTE,
  START_MINUTE,
} from './config';
import { CONTENT_INDEX, createInitialActorStates, createInitialIdolStates } from './contentIndex';
import { walkEdge, walkPath } from './content/map';
import {
  DEFAULT_FAILURE_BY_GAP,
  DEFAULT_PRODUCER_MULTIPLIERS,
  DEFAULT_REWARD_MULTIPLIERS,
  EXP_TIER_VALUES,
  IDOL_STATUS_RANK,
  RANK_CURVE,
  nextRank,
  rankIndex,
  reduceExpTier,
  sameOrHigherRank,
} from './growth';
import { STAT_LABELS, STAT_MAX, attributeLabel, formatFans } from './labels';
import { createInitialProducerStats, staminaCapForRank, staminaCostMultiplierForRank, PRODUCER_STAT_KEYS } from './producer';
import { oddJobScale } from './oddJob';
import { Rng } from './rng';
import { getDay, formatCalendarDateFromDay, formatClock, getMinuteOfDay, getWeekdayFromDay, isMinuteInWindow } from './time';
import { describeCondition } from './conditionText';
import { emitGameEvent } from './gameEvents';
import { combineModifiers } from './modifiers';
import type { ModifierBreakdown, ModifierSource } from './modifiers';
import { canReplaceDay, getScheduleSlot } from './schedule';
import type {
  ActionCommand,
  ActivityDef,
  ActorDef,
  ActorScheduleOverride,
  ActorTopic,
  AttributeRef,
  AttributeRefInput,
  Availability,
  CheckContext,
  Condition,
  Cost,
  DialogueDef,
  DialogueNode,
  Effect,
  EquipDef,
  EquipSlot,
  EventContext,
  EventDef,
  ExpTier,
  GameState,
  IdolAttribute,
  IdolStatKey,
  JobAssignment,
  JobDef,
  IdolState,
  LogTone,
  Modifier,
  ModifierKey,
  Phase,
  Rank,
  SharedStatKey,
  StatKey,
  StoryChainDef,
  StoryChainStep,
  TriggerReport,
  WorkReward,
  WorkRisk,
} from './types';

function clone(state: GameState): GameState {
  return structuredClone(state);
}

/** 体力上限由制作人体能属性推导，不进存档。 */
export function maxStamina(state: GameState): number {
  return Math.round(
    staminaCapForRank(state.producer.stamina.rank) *
      resolveModifiers(state, 'staminaCap'),
  );
}

export function staminaCostMultiplier(state: GameState): number {
  return resolveModifiers(state, 'staminaCost');
}

type ModifierContext = { idolId?: string };

function modifierMatches(
  state: GameState,
  modifier: Modifier,
  ctx: ModifierContext,
): boolean {
  if (modifier.idolId && modifier.idolId !== ctx.idolId) return false;
  if (
    modifier.when &&
    !modifier.when.every((condition) =>
      checkCondition(condition, state, { idolId: ctx.idolId }),
    )
  ) {
    return false;
  }
  return true;
}

const DEFAULT_EQUIP_SLOTS: Record<EquipSlot, number> = { charm: 1 };

/** 某个槽位当前有几个位置；内容用 unlockSlot 往上加。 */
export function slotCount(state: GameState, slot: EquipSlot): number {
  return state.slots?.[slot] ?? DEFAULT_EQUIP_SLOTS[slot];
}

/** 槽位键：charm1、charm2…… */
export function slotKeys(state: GameState, slot: EquipSlot): string[] {
  return Array.from(
    { length: slotCount(state, slot) },
    (_, index) => `${slot}${index + 1}`,
  );
}

export function equippedEquips(state: GameState): EquipDef[] {
  const result: EquipDef[] = [];
  for (const id of Object.values(state.equipment ?? {})) {
    const def = CONTENT_INDEX.equips.get(id);
    if (def) result.push(def);
  }
  return result;
}

export function equipItem(state: GameState, equipId: string): GameState {
  const def = CONTENT_INDEX.equips.get(equipId);
  if (!def) return state;
  if (!(state.ownedEquips ?? []).includes(equipId)) return state;
  if (Object.values(state.equipment ?? {}).includes(equipId)) return state;

  const free = slotKeys(state, def.slot).find(
    (key) => !(state.equipment ?? {})[key],
  );
  if (!free) return state;

  const next = clone(state);
  next.equipment = { ...(next.equipment ?? {}), [free]: equipId };
  emitGameEvent({ kind: 'equipChanged', slot: free, equipId }, next);
  return next;
}

export function unequipSlot(state: GameState, slotKey: string): GameState {
  if (!(state.equipment ?? {})[slotKey]) return state;
  const next = clone(state);
  const equipment = { ...(next.equipment ?? {}) };
  delete equipment[slotKey];
  next.equipment = equipment;
  emitGameEvent({ kind: 'equipChanged', slot: slotKey }, next);
  return next;
}

/**
 * 当前生效的加成来源。制作人体能是第一来源，装备是第二来源；
 * 以后设施等级、临时增益都往这里加，所有计算自动生效。
 */
export function modifierSources(
  state: GameState,
  _ctx: ModifierContext = {},
): ModifierSource[] {
  return [
    {
      label: '体能',
      modifiers: [
        {
          key: 'staminaCost',
          value: staminaCostMultiplierForRank(state.producer.stamina.rank),
        },
      ],
    },
    ...equippedEquips(state).map((equip) => ({
      label: equip.name,
      modifiers: equip.modifiers,
    })),
  ];
}

/** 派生数字的唯一入口。同类相加、跨类相乘，不要在下游再取整。 */
export function resolveModifiers(
  state: GameState,
  key: ModifierKey,
  ctx: ModifierContext = {},
): number {
  return combineModifiers(
    modifierSources(state, ctx),
    key,
    (modifier) => modifierMatches(state, modifier, ctx),
  ).total;
}

/** 给界面解释"这个数是怎么来的"。 */
export function explainModifiers(
  state: GameState,
  key: ModifierKey,
  ctx: ModifierContext = {},
): ModifierBreakdown {
  return combineModifiers(
    modifierSources(state, ctx),
    key,
    (modifier) => modifierMatches(state, modifier, ctx),
  );
}

/** 行动实际消耗的体力：基础值 × 全部加成，向上取整且至少 1。 */
export function activityStaminaCost(
  state: GameState,
  activity: ActivityDef,
  idolId?: string,
): number {
  const base = activity.cost.stamina ?? 0;
  if (base <= 0) return 0;
  // 零工按制作人对应属性的熟练度再缩放一次（越熟练越省力）。
  const oddJob = oddJobScale(state, activity)?.stamina ?? 1;
  return Math.max(
    1,
    Math.ceil(base * oddJob * resolveModifiers(state, 'staminaCost', { idolId })),
  );
}

/** 行动的实际消耗。判定、扣除、界面预告都必须走这里。 */
export function activityCost(
  state: GameState,
  activity: ActivityDef,
  idolId?: string,
): Cost {
  return {
    money: activity.cost.money,
    stamina: activityStaminaCost(state, activity, idolId),
  };
}

/**
 * 行动实际占用的时间。结算与界面显示都必须走这里。
 * 将来训练设施/房间等级影响时长时，只改这个函数体。
 */
export function activityDuration(
  state: GameState,
  activity: ActivityDef,
): number {
  const oddJob = oddJobScale(state, activity)?.duration ?? 1;
  return Math.max(
    1,
    Math.round(
      activity.durationMinutes * oddJob * resolveModifiers(state, 'duration'),
    ),
  );
}

/**
 * 压力满 100 的后果：第二天必须休息。
 *
 * 这条只在行动结算后检查——不是"再也做不了任何事"，
 * 而是"今天剩下的时间只能休息或睡觉"。
 */
function updateForcedRest(state: GameState): void {
  if (state.shared.stress >= STAT_MAX.stress) {
    if (!state.flags.forced_rest) {
      state.flags.forced_rest = true;
      addLog(state, '她已经到极限了。今天剩下的时间只能休息。', 'bad');
    }
    return;
  }
  // 缓过来就解除
  if (state.flags.forced_rest && state.shared.stress < 70) {
    state.flags.forced_rest = false;
  }
}

function clampState(state: GameState): void {
  state.shared.stamina = Math.max(
    0,
    Math.min(maxStamina(state), state.shared.stamina),
  );
  state.shared.stress = Math.max(
    0,
    Math.min(STAT_MAX.stress, state.shared.stress),
  );
  for (const idol of Object.values(state.idols ?? {})) {
    for (const attribute of Object.values(idol.stats)) {
      attribute.exp = Math.max(0, attribute.exp);
    }
  }
  state.money = Math.max(0, state.money);
  for (const idol of Object.values(state.idols ?? {})) {
    idol.fans = Math.max(0, Math.round(idol.fans ?? 0));
  }
  for (const actor of Object.values(state.actors ?? {})) {
    actor.affinity = Math.max(
      0,
      Math.min(ACTOR_AFFINITY_MAX, actor.affinity),
    );
  }
}

export function getIdol(state: GameState, idolId: string): IdolState {
  const idol = state.idols[idolId];
  if (!idol) throw new Error(`unknown idol: ${idolId}`);
  return idol;
}

export function getSelectedIdol(state: GameState): IdolState {
  return getIdol(state, state.selectedIdolId);
}

/** 重点培养的偶像；老存档没有这个字段时退回 selectedIdolId。 */
export function getFocusIdolId(state: GameState): string {
  return state.focusIdolId ?? state.selectedIdolId;
}

export function getFocusIdol(state: GameState): IdolState {
  return getIdol(state, getFocusIdolId(state));
}

export function setFocusIdol(state: GameState, idolId: string): GameState {
  if (!isIdolRecruited(state, idolId)) return state;
  const actor = getActor(idolId);
  if (!actor || actor.role !== 'idol') return state;
  if (getFocusIdolId(state) === idolId) return state;

  const next = clone(state);
  next.focusIdolId = idolId;
  const name = CONTENT_INDEX.idols.get(idolId)?.name ?? '';
  addLog(next, `${name} 成为重点培养的对象。`, 'info');
  return next;
}

export function isIdolRecruited(
  state: GameState,
  idolId: string,
): boolean {
  return state.idols[idolId]?.status === 'recruited';
}

export function hasRecruitedIdol(state: GameState): boolean {
  return Object.values(state.idols).some((idol) => idol.status === 'recruited');
}

export function isSelectedIdolRecruited(state: GameState): boolean {
  return isIdolRecruited(state, state.selectedIdolId);
}

export function formatIdolText(
  text: string,
  idolId?: string,
): string {
  if (!idolId) return text;
  const name = CONTENT_INDEX.idols.get(idolId)?.name;
  if (!name) return text;
  return text.replace(/她(?!们)/g, name);
}

export function normalizeAttributeRef(ref: AttributeRefInput): AttributeRef {
  return typeof ref === 'string' ? { scope: 'idol', key: ref } : ref;
}

/**
 * 属性读取的唯一入口。偶像属性需要 `idolId`，制作人属性全局唯一。
 */
export function resolveAttribute(
  state: GameState,
  ref: AttributeRefInput,
  idolId?: string,
): IdolAttribute {
  const normalized = normalizeAttributeRef(ref);
  if (normalized.scope === 'producer') {
    const attribute = state.producer[normalized.key];
    if (!attribute) {
      throw new Error(`unknown producer attribute: ${normalized.key}`);
    }
    return attribute;
  }
  if (!idolId) {
    throw new Error(`idol attribute requires idolId: ${normalized.key}`);
  }
  return getIdol(state, idolId).stats[normalized.key];
}

export function getIdolAttribute(
  state: GameState,
  attribute: IdolStatKey,
  idolId: string,
): IdolAttribute {
  return resolveAttribute(state, attribute, idolId);
}

export function getRank(
  state: GameState,
  ref: AttributeRefInput,
  idolId?: string,
): Rank {
  return resolveAttribute(state, ref, idolId).rank;
}

export function applyAttributeExp(
  state: GameState,
  ref: AttributeRefInput,
  tier: ExpTier,
  direction: 'gain' | 'loss',
  idolId?: string,
  opts?: { training?: boolean },
): void {
  const normalized = normalizeAttributeRef(ref);
  const target = resolveAttribute(state, normalized, idolId);
  const base = EXP_TIER_VALUES[tier];
  const amount =
    direction === 'gain' && opts?.training
      ? Math.round(base * resolveModifiers(state, 'trainingExp', { idolId }))
      : base;

  if (direction === 'loss') {
    target.exp = Math.max(0, target.exp - amount);
    return;
  }

  if (target.rank === target.maxRank) return;

  target.exp += amount;
  let leveled = false;
  while (target.rank !== target.maxRank) {
    const needed = RANK_CURVE[target.rank];
    if (needed <= 0 || target.exp < needed) break;
    const next = nextRank(target.rank);
    if (!next) break;
    target.exp -= needed;
    target.rank = next;
    leveled = true;
  }
  if (target.rank === target.maxRank) target.exp = 0;

  if (leveled) {
    const who =
      normalized.scope === 'producer'
        ? '制作人'
        : (CONTENT_INDEX.idols.get(idolId ?? '')?.name ?? idolId ?? '');
    addLog(
      state,
      `${who} ${attributeLabel(normalized)}提升到 ${target.rank}。`,
      'good',
    );
    emitGameEvent(
      { kind: 'skillLevelUp', ref: normalized, rank: target.rank, idolId },
      state,
    );
  }
}

export function getStatValue(state: GameState, stat: SharedStatKey): number;
export function getStatValue(
  state: GameState,
  stat: IdolStatKey,
  idolId: string,
): number;
export function getStatValue(
  state: GameState,
  stat: StatKey,
  idolId?: string,
): number {
  if (stat === 'stamina' || stat === 'stress') {
    return state.shared[stat];
  }
  if (!idolId) throw new Error('idol attribute requires idolId');
  return rankIndex(getRank(state, stat, idolId));
}

export type WorkRewardPreview = {
  money: number;
  multiplier: number;
  combine: 'sum' | 'product';
  parts: {
    ref: AttributeRef;
    rank: Rank;
    weight: number;
    multiplier: number;
  }[];
};

function defaultMultiplierTable(scope: AttributeRef['scope']): Record<Rank, number> {
  return scope === 'producer'
    ? DEFAULT_PRODUCER_MULTIPLIERS
    : DEFAULT_REWARD_MULTIPLIERS;
}

export function workRewardPreview(
  state: GameState,
  reward: WorkReward,
  idolId?: string,
): WorkRewardPreview {
  const combine = reward.combine ?? 'sum';
  const parts = reward.terms.map((term) => {
    const ref = normalizeAttributeRef(term.ref);
    const rank = resolveAttribute(state, ref, idolId).rank;
    const table = {
      ...defaultMultiplierTable(ref.scope),
      ...term.multipliers,
    };
    return {
      ref,
      rank,
      weight: term.weight ?? 1,
      multiplier: table[rank],
    };
  });
  const raw =
    combine === 'product'
      ? parts.reduce((acc, part) => acc * part.multiplier, 1)
      : parts.reduce((sum, part) => sum + part.weight * part.multiplier, 0);
  const multiplier = parts.length === 0 ? 1 : raw;
  return {
    money: Math.round(reward.baseMoney * multiplier),
    multiplier,
    combine,
    parts,
  };
}

export function workRewardSummary(
  state: GameState,
  reward: WorkReward,
  idolId?: string,
): string {
  const preview = workRewardPreview(state, reward, idolId);
  const joiner = preview.combine === 'product' ? ' × ' : ' + ';
  const detail = preview.parts
    .map(
      (part) =>
        `${attributeLabel(part.ref)} ${part.rank} ×${part.multiplier}`,
    )
    .join(joiner);
  return `预计 ¥${preview.money} · ${detail}`;
}

export type WorkRiskPreview = {
  ref?: AttributeRef;
  rank: Rank;
  safeRank: Rank;
  minRank: Rank;
  gap: number;
  chance: number;
  eligible: boolean;
};

/**
 * 风险来源：`WorkRisk.ref` 显式指定，或退回 `workReward.terms`。
 * 多来源时取 gap 最大的一项（短板决定失败率），任一不达标即不可用。
 */
export function workRiskPreview(
  state: GameState,
  risk: WorkRisk,
  reward?: WorkReward,
  idolId?: string,
): WorkRiskPreview {
  const refs: AttributeRef[] = risk.ref
    ? [normalizeAttributeRef(risk.ref)]
    : (reward?.terms ?? []).map((term) => normalizeAttributeRef(term.ref));
  const minRank = risk.minRank ?? 'F';
  const table = {
    ...DEFAULT_FAILURE_BY_GAP,
    ...risk.failureByGap,
  };

  const evaluated = refs.map((ref) => {
    const rank = resolveAttribute(state, ref, idolId).rank;
    const gap = Math.max(0, rankIndex(risk.safeRank) - rankIndex(rank));
    return {
      ref,
      rank,
      gap,
      eligible: rankIndex(rank) >= rankIndex(minRank),
    };
  });

  const failing = evaluated.filter((entry) => !entry.eligible);
  const worst =
    failing.length > 0
      ? failing.reduce((a, b) => (rankIndex(a.rank) <= rankIndex(b.rank) ? a : b))
      : evaluated.reduce<typeof evaluated[number] | undefined>(
          (a, b) => (!a || b.gap > a.gap ? b : a),
          undefined,
        );

  const gap = worst?.gap ?? 0;
  return {
    ref: worst?.ref,
    rank: worst?.rank ?? risk.safeRank,
    safeRank: risk.safeRank,
    minRank,
    gap,
    chance: gap <= 0 ? 0 : (table[Math.min(gap, 4)] ?? 0.85),
    eligible: failing.length === 0,
  };
}

export function workRiskSummary(
  state: GameState,
  risk: WorkRisk,
  reward?: WorkReward,
  idolId?: string,
): string {
  const preview = workRiskPreview(state, risk, reward, idolId);
  const label = preview.ref ? attributeLabel(preview.ref) : '属性';
  if (!preview.eligible) {
    return `需要${label} ${preview.minRank}`;
  }
  if (preview.chance <= 0) return '稳定成功';
  return `成功率 ${Math.round((1 - preview.chance) * 100)}% · 推荐${label} ${
    preview.safeRank
  }`;
}

function addLog(state: GameState, text: string, tone: LogTone = 'info'): void {
  state.log.unshift({
    id: state.nextLogId,
    day: getDay(state.clock.absoluteMinutes),
    minuteOfDay: getMinuteOfDay(state.clock.absoluteMinutes),
    text,
    tone,
  });
  state.nextLogId += 1;
  if (state.log.length > 60) state.log.length = 60;
}

export function newGame(seed: number = Date.now()): GameState {
  const state: GameState = {
    clock: { absoluteMinutes: START_MINUTE },
    locationId: CONTENT_INDEX.startingLocationId,
    actors: createInitialActorStates(),
    shared: {
      stamina: 100,
      stress: 0,
    },
    producer: createInitialProducerStats(),
    idols: createInitialIdolStates(),
    selectedIdolId: CONTENT_INDEX.startingIdolId,
  focusIdolId: CONTENT_INDEX.startingIdolId,
    money: 3000,
    inventory: {},
    shopPurchases: {},
    storyChains: {},
    flags: {},
    jobs: [],
  jobCooldowns: {},
  chatCounts: {},
    eventCooldowns: {},
    log: [],
    phase: 'plan',
    actionsTaken: 0,
    nextLogId: 1,
    rng: { seed: seed >>> 0, counter: 0 },
  };
  const opening = CONTENT_INDEX.startingDialogueId
    ? getDialogue(CONTENT_INDEX.startingDialogueId)
    : undefined;
  if (opening) {
    state.pendingDialogueId = opening.id;
    state.dialogueNodeId = opening.startNodeId;
  }
  return state;
}

export function getActivity(id: string): ActivityDef | undefined {
  return CONTENT_INDEX.activities.get(id);
}

export function getEvent(id: string): EventDef | undefined {
  return CONTENT_INDEX.events.get(id);
}

export function getActor(id: string): ActorDef | undefined {
  return CONTENT_INDEX.actors.get(id);
}

export function getActorLocation(
  actor: ActorDef,
  absoluteMinutes: number,
  overrides: ActorScheduleOverride[] = [],
): string | undefined {
  return getScheduleSlot(actor, absoluteMinutes, overrides)?.locationId;
}

export function isActorPresent(state: GameState, actor: ActorDef): boolean {
  const actorState = state.actors[actor.id];
  const locationId = getActorLocation(
    actor,
    state.clock.absoluteMinutes,
    actorState?.scheduleOverrides,
  );
  return locationId === state.locationId;
}

export function acceptJob(
  state: GameState,
  jobId: string,
  day: number,
  idolId?: string,
): GameState {
  if (state.phase !== 'plan' || state.locationId !== 'office') {
    return state;
  }
  // 她已经到极限了，这时候接工作只会砸掉。
  if (state.flags.forced_rest) return state;

  const targetId = idolId ?? getFocusIdolId(state);
  const job = CONTENT_INDEX.jobs.get(jobId);
  const actor = getActor(targetId);
  const actorState = state.actors[targetId];
  if (!job || !actor || !actorState) return state;
  // 没招募的偶像不能接工作——工作是她去做的。
  if (!isIdolRecruited(state, actor.id)) return state;
  if (actor.role !== 'idol') return state;
  if (
    state.jobs.some(
      (entry) => entry.jobId === job.id && entry.idolId === actor.id,
    )
  ) {
    return state;
  }

  const currentDay = getDay(state.clock.absoluteMinutes);
  if (!Number.isInteger(day) || day <= currentDay) return state;

  // 一份工作同时只能派一个人；完成后进入冷却。
  if (state.jobs?.some((entry) => entry.jobId === job.id)) return state;
  const cooldownUntil =
    (state.jobCooldowns?.[job.id] ?? 0) + (job.cooldownDays ?? 0);
  if (currentDay < cooldownUntil) return state;

  const check = canReplaceDay(actor, day, actorState.scheduleOverrides);
  if (!check.ok) return state;

  const assignmentId = `job:${job.id}:${actor.id}:${day}`;
  const next = clone(state);
  const nextActor = next.actors[actor.id];
  if (!nextActor) return state;

  next.jobs = [
    ...(next.jobs ?? []),
    {
      id: assignmentId,
      jobId: job.id,
      idolId: actor.id,
      day,
      fromMinute: job.fromMinute,
      toMinute: job.toMinute,
      locationId: job.locationId,
    },
  ];

  nextActor.scheduleOverrides = [
    ...(nextActor.scheduleOverrides ?? []),
    {
      id: assignmentId,
      day,
      fromMinute: job.fromMinute,
      toMinute: job.toMinute,
      locationId: job.locationId,
      label: job.name,
      visibility: 'public',
      mode: 'replace-day',
    },
  ];

  // 指派本身要花时间：跑来跑去谈档期也得半小时。
  const afterAssign = advanceTime(next, 30);
  addLog(
    afterAssign,
    `接下了《${job.name}》。${formatCalendarDateFromDay(day, false)}，${formatClock(job.fromMinute)}–${formatClock(job.toMinute)}。`,
    'good',
  );

  return afterAssign;
}

/** 未到场：经验降一档，粉丝归零。 */
function previousExpTier(tier: ExpTier): ExpTier {
  if (tier >= 20) return 10;
  if (tier >= 10) return 5;
  if (tier >= 5) return 3;
  return 1;
}

function discountEffects(effects: Effect[]): Effect[] {
  return effects
    .filter((effect) => effect.kind !== 'fans')
    .map((effect) =>
      effect.kind === 'attributeExp'
        ? { ...effect, tier: previousExpTier(effect.tier) }
        : effect,
    );
}

type JobSettlement = {
  passed: boolean;
  pay: number;
  flavour: string;
};

/**
 * 结算一份工作：掷检定 → 算钱 → 上效果。
 *
 * attended = false 时按 20% 结算、不涨粉，属性成长降一档：
 * 她确实去上班了，只是没有制作人在旁边推。
 */
function settleJob(
  state: GameState,
  job: JobDef,
  assignment: JobAssignment,
  attended: boolean,
): JobSettlement {
  const rng = new Rng(state.rng.seed, state.rng.counter);
  const chance = jobCheckChance(state, job, assignment.idolId);
  const passed = chance === undefined ? true : rng.chance(chance);

  const attendanceRatio = attended ? 1 : 0.2;
  // 信任高的时候失败也没那么惨：底 0.4，B 级信任抬到 0.7。
  const failureBase = job.failurePayRatio ?? 0.5;
  const trustCushion = (trustJobBonus(state, assignment.idolId) / 0.06) * 0.3;
  const failureRatio = passed
    ? 1
    : Math.min(1, Math.max(0, failureBase + trustCushion));
  const pay = Math.round(job.pay * attendanceRatio * failureRatio);

  const base = (passed ? job.effects : job.failureEffects) ?? [];
  state.money += pay;
  applyEffects(state, attended ? base : discountEffects(base), {
    idolId: assignment.idolId,
  });

  const texts = passed ? job.resultTexts : job.failureTexts;
  const flavour = texts?.length ? rng.pick(texts) : '';
  state.rng.counter = rng.counter;
  return { passed, pay, flavour };
}

/**
 * 到点自动结算没去现场的工作。
 *
 * 读档、推进时间、调试跳天都会调用它，所以"关掉游戏"也算没到场。
 */
export function completeDueJobs(state: GameState): void {
  if (state.jobs.length === 0) return;
  const currentMinutes = state.clock.absoluteMinutes;

  const due = state.jobs.filter(
    (job) => currentMinutes >= (job.day - 1) * MINUTES_PER_DAY + job.toMinute,
  );
  if (due.length === 0) return;

  state.jobs = state.jobs.filter((job) => !due.includes(job));

  for (const assignment of due) {
    const job = CONTENT_INDEX.jobs.get(assignment.jobId);
    if (!job) continue;
    const { passed, pay } = settleJob(state, job, assignment, false);
    const day = assignment.day;
    state.jobCooldowns = { ...state.jobCooldowns, [job.id]: day };
    const idolName = CONTENT_INDEX.idols.get(assignment.idolId)?.name ?? '';
    addLog(
      state,
      `${idolName}一个人去做了《${job.name}》，你没能到场，只结算了 ¥${pay}。${passed ? '' : '这次没达到要求。'}`,
      passed ? 'info' : 'bad',
    );
  }
}

export function activeJobFor(state: GameState): JobAssignment | undefined {
  const minute = getMinuteOfDay(state.clock.absoluteMinutes);
  const day = getDay(state.clock.absoluteMinutes);
  return state.jobs.find(
    (job) =>
      job.idolId === getFocusIdolId(state) &&
      job.day === day &&
      job.locationId === state.locationId &&
      minute >= job.fromMinute &&
      minute < job.toMinute,
  );
}

export function attendJob(state: GameState, jobId: string): GameState {
  if (state.phase !== 'plan') return state;
  // 强制休息那天到不了场：工作会按"没去"结算（只拿 20%）。
  if (state.flags.forced_rest) return state;
  const assignment = state.jobs.find((job) => job.id === jobId);
  if (!assignment) return state;
  if (assignment.locationId !== state.locationId) return state;
  // 工作是她去做的：她还没出道就不能替她完成。
  if (!isIdolRecruited(state, assignment.idolId)) return state;

  const minute = getMinuteOfDay(state.clock.absoluteMinutes);
  if (
    assignment.day !== getDay(state.clock.absoluteMinutes) ||
    minute < assignment.fromMinute ||
    minute >= assignment.toMinute
  ) {
    return state;
  }

  const job = CONTENT_INDEX.jobs.get(assignment.jobId);
  if (!job) return state;

  const next = clone(state);
  next.selectedIdolId = assignment.idolId;
  next.focusIdolId = assignment.idolId;

  const chance = jobCheckChance(next, job, assignment.idolId);
  const { passed, pay, flavour } = settleJob(
    next,
    job,
    assignment,
    true,
  );

  next.clock.absoluteMinutes = Math.max(
    next.clock.absoluteMinutes,
    (assignment.day - 1) * MINUTES_PER_DAY + assignment.toMinute,
  );
  next.jobs = next.jobs.filter((entry) => entry.id !== jobId);
  next.jobCooldowns = { ...next.jobCooldowns, [job.id]: assignment.day };

  const idolName = CONTENT_INDEX.idols.get(assignment.idolId)?.name ?? '';
  const head = chance === undefined || passed
    ? `《${job.name}》结束`
    : `《${job.name}》没有达到要求`;
  next.lastResult = `${flavour || job.description} 收入 ¥${pay}。`;
  next.pendingResults = undefined;
  next.pendingActivityId = undefined;
  next.pendingActivityPassed = undefined;
  next.phase = 'activityResult';

  addLog(
    next,
    `${head}，收入 ¥${pay}。${passed ? '' : `${idolName}在回程的路上没有说话。`}`.trim(),
    passed ? 'good' : 'bad',
  );

  return next;
}

/** 命令没有产生任何变化时给玩家一句反馈，避免"点了没反应"。 */
export function noteNoEffect(state: GameState, reason = '现在做不了这个。'): GameState {
  const next = clone(state);
  addLog(next, reason, 'bad');
  return next;
}
export function buyItem(state: GameState, itemId: string): GameState {
  if (state.phase !== 'plan') return state;
  const item = CONTENT_INDEX.items.get(itemId);
  if (!item) return state;

  const shop = CONTENT_INDEX.shopsByLocation
    .get(state.locationId)
    ?.find((entry) => entry.itemIds.includes(itemId));
  if (!shop) return state;

  const purchased = state.shopPurchases[itemId] ?? 0;
  if (item.maxPurchases !== undefined && purchased >= item.maxPurchases) {
    return state;
  }
  if (state.money < item.price) return state;

  const next = clone(state);
  next.money -= item.price;
  next.inventory[itemId] = (next.inventory[itemId] ?? 0) + 1;
  next.shopPurchases[itemId] = purchased + 1;
  addLog(next, `你在${shop.name}买了${item.name}。`, 'info');
  return next;
}

export function giveGift(
  state: GameState,
  itemId: string,
  idolId: string,
): GameState {
  if (state.phase !== 'plan') return state;
  const item = CONTENT_INDEX.items.get(itemId);
  if (!item?.gift) return state;
  if ((state.inventory[itemId] ?? 0) <= 0) return state;
  if (!state.idols[idolId]) return state;
  if (!isIdolRecruited(state, idolId)) return state;

  const idol = CONTENT_INDEX.idols.get(idolId);
  if (!idol) return state;

  const preference = item.gift.preferences?.find(
    (entry) => entry.idolId === idolId,
  );
  const tier = preference?.trustTier ?? item.gift.defaultTrustTier;
  const reaction =
    preference?.reaction ?? `${idol.name}收下了${item.name}，向你道了谢。`;

  const next = clone(state);
  const remaining = (next.inventory[itemId] ?? 0) - 1;
  if (remaining <= 0) {
    delete next.inventory[itemId];
  } else {
    next.inventory[itemId] = remaining;
  }
  applyAttributeExp(next, 'trust', tier, 'gain', idolId);
  addLog(next, `你把${item.name}送给了${idol.name}。${reaction}`, 'good');
  return next;
}

export function getDialogue(id: string): DialogueDef | undefined {
  return CONTENT_INDEX.dialogues.get(id);
}

export function getDialogueNode(state: GameState): DialogueNode | undefined {
  if (!state.pendingDialogueId || !state.dialogueNodeId) return undefined;
  return getDialogue(state.pendingDialogueId)?.nodes[state.dialogueNodeId];
}

export function getDialogueText(
  state: GameState,
  node: DialogueNode,
): string {
  const variant = node.textVariants?.find((entry) =>
    entry.when.every((condition) =>
      checkCondition(condition, state, {
        idolId: state.dialogueTargetIdolId,
      }),
    ),
  );
  return formatCastText(
    variant?.text ?? node.text,
    state.pendingDialogueCast ?? [],
  );
}

function applyCastEffects(
  state: GameState,
  effects: Effect[],
  cast: string[],
  fallbackIdolId?: string,
): void {
  if (cast.length === 0) {
    applyEffects(state, effects, { idolId: fallbackIdolId });
    return;
  }
  if (cast.length === 1) {
    applyEffects(state, effects, { idolId: cast[0] });
    return;
  }
  // 多人：偶像属性各一份，其余一次。
  const perIdol = effects.filter(isPerIdolEffect);
  const shared = effects.filter((effect) => !isPerIdolEffect(effect));
  for (const idolId of cast) {
    applyEffects(state, perIdol, { idolId });
  }
  if (shared.length > 0) applyEffects(state, shared, { idolId: fallbackIdolId });
}

/**
 * 打开一段对话。事件、行动、剧情链都走这个入口。
 * 缺省结束后回到 plan；传入 returnTo 可以回到任意阶段。
 */
export function openDialogue(
  state: GameState,
  invocation: {
    dialogueId: string;
    idolId?: string;
    cast?: string[];
    returnTo?: { phase: Phase; result?: string };
  },
): GameState {
  const dialogue = getDialogue(invocation.dialogueId);
  if (!dialogue) return state;

  const cast = invocation.cast ?? dialogue.participantIds ?? [];
  const next = clone(state);
  next.pendingDialogueId = dialogue.id;
  next.dialogueNodeId = dialogue.startNodeId;
  next.dialogueTargetIdolId =
    invocation.idolId ?? cast[0] ?? dialogue.idolId ?? next.selectedIdolId;
  next.pendingDialogueCast = cast.length > 0 ? cast : undefined;
  next.dialogueReturnPhase = invocation.returnTo?.phase;
  next.dialogueReturnResult = invocation.returnTo?.result;

  const node = dialogue.nodes[dialogue.startNodeId];
  if (node) applyCastEffects(next, node.effects ?? [], cast, next.dialogueTargetIdolId);
  return next;
}

function clearDialogueState(next: GameState): void {
  next.pendingDialogueId = undefined;
  next.dialogueChainId = undefined;
  next.dialogueNodeId = undefined;
  next.dialogueTargetIdolId = undefined;
  next.pendingDialogueCast = undefined;
}

function finishDialogue(state: GameState): GameState {
  const next = clone(state);
  const chainId = next.dialogueChainId;
  const chain = chainId ? CONTENT_INDEX.storyChains.get(chainId) : undefined;
  if (!chain) {
    const returnPhase = next.dialogueReturnPhase;
    const returnResult = next.dialogueReturnResult;
    clearDialogueState(next);
    next.dialogueReturnPhase = undefined;
    next.dialogueReturnResult = undefined;
    if (returnPhase) {
      if (returnResult) {
      next.lastResult = returnResult;
      addLog(next, returnResult, 'info');
    }
      next.phase = returnPhase;
      return next;
    }
    next.phase = 'plan';
    return next;
  }

  const chainState = next.storyChains[chain.id] ?? {
    chainId: chain.id,
    stepIndex: 0,
  };
  const step = chain.steps[chainState.stepIndex];
  const day = getDay(next.clock.absoluteMinutes);

  if (step?.complete?.status && next.idols[chain.idolId]) {
    const idol = next.idols[chain.idolId];
    idol.status = step.complete.status;
    if (step.complete.status === 'known') {
      idol.knownAt = idol.knownAt ?? day;
    }
    if (step.complete.status === 'recruited') {
      idol.knownAt = idol.knownAt ?? day;
      idol.recruitedAt = day;
      // 刚招进来的人自动成为重点偶像——但已经有人在带的时候不抢。
      if (!isIdolRecruited(next, getFocusIdolId(next))) {
        next.focusIdolId = chain.idolId;
        next.selectedIdolId = chain.idolId;
      }
    }
    addLog(
      next,
      step.complete.status === 'recruited'
        ? `${CONTENT_INDEX.idols.get(chain.idolId)?.name ?? chain.idolId} 加入了制作名单。`
        : `你认识了${CONTENT_INDEX.idols.get(chain.idolId)?.name ?? chain.idolId}。`,
      'good',
    );
  }

  if (step?.effects?.length) {
    applyEffects(next, step.effects, { idolId: chain.idolId });
  }

  const stepIndex = chainState.stepIndex + 1;
  if (stepIndex >= chain.steps.length) {
    next.storyChains[chain.id] = {
      ...chainState,
      stepIndex,
      completed: true,
    };
    emitGameEvent({ kind: 'storyCompleted', chainId: chain.id }, next);
  } else {
    next.storyChains[chain.id] = {
      ...chainState,
      stepIndex,
      nextEligibleDay: day + (step?.complete?.nextStepDelayDays ?? 0),
      lastStepDay: day,
    };
  }

  // 可选的"结束时把玩家放到剧情收尾的地点"。不写就不搬。
  if (step?.endLocationId && next.locationId !== step.endLocationId) {
    next.locationId = step.endLocationId;
  }

  clearDialogueState(next);
  const returnPhase = next.dialogueReturnPhase;
  const returnResult = next.dialogueReturnResult;
  next.dialogueReturnPhase = undefined;
  next.dialogueReturnResult = undefined;
  if (returnPhase) {
    if (returnResult) {
      next.lastResult = returnResult;
      addLog(next, returnResult, 'info');
    }
    next.phase = returnPhase;
    return next;
  }
  next.phase = 'plan';
  return next;
}

export type StoryChainEntry = {
  chain: StoryChainDef;
  step: StoryChainStep;
  stepIndex: number;
};

/** 一条链当前卡在哪；地点页、手册、调试面板都读同一份判定。 */
export type StoryStepBlock =
  | { kind: 'completed' }
  | { kind: 'busy' }
  | { kind: 'not-revealed' }
  | { kind: 'waiting'; earliestDay: number }
  | { kind: 'location'; expected: string; actual: string }
  | { kind: 'off-hours'; fromMinute: number; toMinute: number }
  | { kind: 'conditions'; failed: Condition[] };

export type StoryStepEvaluation = {
  chain: StoryChainDef;
  step?: StoryChainStep;
  stepIndex: number;
  revealed: boolean;
  /** 只差地点也算可触发——玩家走过去就行。 */
  eligible: boolean;
  nextEligibleDay?: number;
  blocks: StoryStepBlock[];
};

export function evaluateStoryChain(
  state: GameState,
  chain: StoryChainDef,
): StoryStepEvaluation {
  const chainState = state.storyChains[chain.id] ?? {
    chainId: chain.id,
    stepIndex: 0,
  };
  const stepIndex = chainState.stepIndex;
  const step = chain.steps[stepIndex];
  const day = getDay(state.clock.absoluteMinutes);
  const minute = getMinuteOfDay(state.clock.absoluteMinutes);
  const ctx = { idolId: chain.idolId };

  // revealWhen 只决定"手册里说不说"，不决定能不能触发。
  const revealed =
    Boolean(state.storyChains[chain.id]) ||
    Boolean(
      chain.revealWhen?.every((condition) =>
        checkCondition(condition, state, ctx),
      ) ?? false,
    );

  const blocks: StoryStepBlock[] = [];
  if (!step || chainState.completed) {
    blocks.push({ kind: 'completed' });
  }
  if (state.pendingDialogueId || state.flags.forced_rest) {
    blocks.push({ kind: 'busy' });
  }
  if (!revealed) {
    blocks.push({ kind: 'not-revealed' });
  }
  if (chainState.nextEligibleDay && day < chainState.nextEligibleDay) {
    blocks.push({ kind: 'waiting', earliestDay: chainState.nextEligibleDay });
  }
  // 节奏：已开始的链只在"剧情日"那天能推进，其余日子等下一个剧情日。
  if (state.storyChains[chain.id] && !chainState.completed) {
    const storyDay = storyDayFor(state, chain);
    if (storyDay !== undefined && day < storyDay) {
      blocks.push({ kind: 'waiting', earliestDay: storyDay });
    }
  }

  if (step) {
    const failed = (step.when ?? []).filter(
      (condition) => !checkCondition(condition, state, ctx),
    );
    if (failed.length > 0) blocks.push({ kind: 'conditions', failed });
    if (
      step.timeWindow &&
      (minute < step.timeWindow.fromMinute ||
        minute > step.timeWindow.toMinute)
    ) {
      blocks.push({
        kind: 'off-hours',
        fromMinute: step.timeWindow.fromMinute,
        toMinute: step.timeWindow.toMinute,
      });
    }
    if (step.locationId !== state.locationId) {
      blocks.push({
        kind: 'location',
        expected: step.locationId,
        actual: state.locationId,
      });
    }
  }

  return {
    chain,
    step,
    stepIndex,
    revealed,
    eligible: !blocks.some((block) => block.kind !== 'not-revealed'),
    nextEligibleDay: chainState.nextEligibleDay,
    blocks,
  };
}

/** 所有链的判定，按 priority 降序。 */
export function evaluateStorySteps(state: GameState): StoryStepEvaluation[] {
  return [...CONTENT_INDEX.storyChains.values()]
    .map((chain) => evaluateStoryChain(state, chain))
    .sort((a, b) => (b.chain.priority ?? 0) - (a.chain.priority ?? 0));
}

/**
 * 当前地点、时间窗、最早天数、步骤条件都满足的剧情链，按 priority 降序。
 * 同一地点可以同时有多条，全部返回；只取一条会让后加的链静默消失。
 */
export function getEligibleStories(state: GameState): StoryChainEntry[] {
  const found: StoryChainEntry[] = [];
  for (const evaluation of evaluateStorySteps(state)) {
    if (!evaluation.eligible || !evaluation.step) continue;
    found.push({
      chain: evaluation.chain,
      step: evaluation.step,
      stepIndex: evaluation.stepIndex,
    });
  }
  return found;
}

export function getEligibleStory(
  state: GameState,
): StoryChainEntry | undefined {
  return getEligibleStories(state)[0];
}

export type StoryTriggerReport = {
  chainId: string;
  title: string;
  stepId: string;
  stepLabel: string;
  stepIndex: number;
  totalSteps: number;
  revealed: boolean;
  eligible: boolean;
  reason: string;
};

/** 调试面板一次只显示一个阻碍，按"最该先处理"的顺序取第一个。 */
const STORY_BLOCK_ORDER: StoryStepBlock['kind'][] = [
  'completed',
  'busy',
  'waiting',
  'conditions',
  'location',
  'off-hours',
];

function storyBlockText(
  block: StoryStepBlock,
  evaluation: StoryStepEvaluation,
  state: GameState,
): string {
  const ctx = { idolId: evaluation.chain.idolId };
  switch (block.kind) {
    case 'completed':
      return '已完成';
    case 'busy':
      return '当前有对话或强制休息';
    case 'waiting': {
      const day = getDay(state.clock.absoluteMinutes);
      return `还有 ${Math.max(0, block.earliestDay - day)} 天（最早第 ${block.earliestDay} 天）`;
    }
    case 'conditions': {
      const phrases = block.failed
        .map((condition) => describeCondition(condition, state, ctx))
        .filter((text): text is string => Boolean(text));
      return phrases.length > 0
        ? `条件未满足：${phrases.slice(0, 2).join('、')}`
        : '条件未满足';
    }
    case 'off-hours':
      return `不在时间窗（${formatClock(block.fromMinute)}–${formatClock(block.toMinute)}）`;
    case 'location': {
      const expected =
        CONTENT_INDEX.locations.get(block.expected)?.name ?? block.expected;
      const actual =
        CONTENT_INDEX.locations.get(block.actual)?.name ?? block.actual;
      return `地点不对：要在${expected}（现在在${actual}）`;
    }
    default:
      return '可以触发';
  }
}


/**
 * 这条链的"剧情日"——下一次该演它的那一天。
 *
 * 规则（与 cadenceDays 有关）：
 *   - 未开始（没有 storyChains 记录）或已完成 → undefined，不占用任何东西
 *   - 第一次候选 = 上一步完成日 + max(nextStepDelayDays, cadenceDays)
 *   - 已经过了候选日 → 按 cadenceDays 往后顺延，**不是明天**
 *
 * 纯函数：不写状态，所以"提前订了未来的工作"不会把剧情日挤走。
 */
export function storyDayFor(
  state: GameState,
  chain: StoryChainDef,
): number | undefined {
  const chainState = state.storyChains[chain.id];
  if (!chainState || chainState.completed) return undefined;

  // cadence 只在显式设成 >1 时才作为"间隔"；默认 1 不改变原有同日推进的链。
  const cadence = Math.max(1, chain.cadenceDays ?? 1);
  const spacing = cadence > 1 ? cadence : 0;
  const step = chain.steps[chainState.stepIndex];
  if (!step) return undefined;

  const anchor = chainState.lastStepDay ?? getDay(state.clock.absoluteMinutes);
  const delay = Math.max(chainState.nextEligibleDay ? chainState.nextEligibleDay - anchor : 0, 0);
  let day = anchor + Math.max(delay, spacing);

  const today = getDay(state.clock.absoluteMinutes);
  if (today > day) {
    day += cadence * Math.ceil((today - day) / cadence);
  }
  return day;
}


/**
 * 这个偶像在 day 这天能不能被派去工作。
 *
 * 两种占用：
 *   - workPolicy 'blocked'：整章进行期间都不能接
 *   - 其他：只挡剧情日那一天
 */
export function storyWorkBlock(
  state: GameState,
  idolId: string,
  day?: number,
): { blocked: boolean; reason?: string } {
  return storyWorkBlockFor(CONTENT_INDEX.storyChains.values(), state, idolId, day);
}

/** 纯函数版本，便于测试注入自己的链。 */
export function storyWorkBlockFor(
  chains: Iterable<StoryChainDef>,
  state: GameState,
  idolId: string,
  day?: number,
): { blocked: boolean; reason?: string } {
  for (const chain of chains) {
    if (chain.idolId !== idolId) continue;
    const chainState = state.storyChains[chain.id];
    if (!chainState || chainState.completed) continue;
    if (chain.workPolicy === 'blocked') {
      return { blocked: true, reason: '剧情进行中，暂不接新工作' };
    }
    if (day !== undefined && storyDayFor(state, chain) === day) {
      return { blocked: true, reason: '那天有剧情' };
    }
  }
  return { blocked: false };
}

/**
 * 每条剧情链当前卡在哪。给调试面板用——链条的失败模式是静默的，
 * 没有这个就只能靠读代码猜。
 */
export function getStoryTriggerReport(state: GameState): StoryTriggerReport[] {
  return evaluateStorySteps(state).map((evaluation) => {
    const idolName =
      CONTENT_INDEX.idols.get(evaluation.chain.idolId)?.name ??
      evaluation.chain.idolId;
    const blocked = STORY_BLOCK_ORDER.map((kind) =>
      evaluation.blocks.find((block) => block.kind === kind),
    ).find((block): block is StoryStepBlock => Boolean(block));

    const reason = !blocked
      ? evaluation.revealed
        ? '可以触发'
        : '可以触发（手册里还没显示）'
      : storyBlockText(blocked, evaluation, state);

    return {
      chainId: evaluation.chain.id,
      title:
        evaluation.chain.title ??
        `${idolName} · ${evaluation.chain.steps[0]?.actionLabel ?? ''}`,
      stepId: evaluation.step?.id ?? '',
      stepLabel: evaluation.step?.actionLabel ?? '',
      stepIndex: evaluation.stepIndex,
      totalSteps: evaluation.chain.steps.length,
      revealed: evaluation.revealed,
      eligible: evaluation.eligible,
      reason,
    };
  });
}

export function startStory(state: GameState, chainId: string): GameState {
  if (state.phase !== 'plan' || state.pendingDialogueId) return state;
  const eligible = getEligibleStories(state).find(
    (entry) => entry.chain.id === chainId,
  );
  if (!eligible) return state;
  const dialogue = getDialogue(eligible.step.dialogueId);
  if (!dialogue) return state;

  const next = openDialogue(state, { dialogueId: dialogue.id });
  if (next === state) return state;
  next.dialogueChainId = eligible.chain.id;
  return next;
}

export function advanceDialogue(state: GameState): GameState {
  if (!state.pendingDialogueId || !state.dialogueNodeId) return state;
  const dialogue = getDialogue(state.pendingDialogueId);
  const node = dialogue?.nodes[state.dialogueNodeId];
  if (!dialogue || !node) return state;
  if (node.choices?.length) return state;

  if (!node.nextNodeId) return finishDialogue(state);
  const nextNode = dialogue.nodes[node.nextNodeId];
  if (!nextNode) return state;

  const next = clone(state);
  next.dialogueNodeId = nextNode.id;
  applyCastEffects(
    next,
    nextNode.effects ?? [],
    next.pendingDialogueCast ?? [],
    next.dialogueTargetIdolId,
  );
  return next;
}

export function chooseDialogue(state: GameState, index: number): GameState {
  if (!state.pendingDialogueId || !state.dialogueNodeId) return state;
  const dialogue = getDialogue(state.pendingDialogueId);
  const node = dialogue?.nodes[state.dialogueNodeId];
  const choice = node?.choices?.[index];
  if (!dialogue || !node || !choice) return state;
  if (
    choice.requires &&
    !choice.requires.every((condition) =>
      checkCondition(condition, state, {
        idolId: state.dialogueTargetIdolId,
      }),
    )
  ) {
    return state;
  }
  const nextNode = dialogue.nodes[choice.nextNodeId];
  if (!nextNode) return state;

  const next = clone(state);
  applyCastEffects(
    next,
    choice.effects ?? [],
    next.pendingDialogueCast ?? [],
    next.dialogueTargetIdolId ?? next.selectedIdolId,
  );
  next.dialogueNodeId = nextNode.id;
  applyCastEffects(
    next,
    nextNode.effects ?? [],
    next.pendingDialogueCast ?? [],
    next.dialogueTargetIdolId,
  );
  return next;
}

export function presentActors(state: GameState): ActorDef[] {
  return [...CONTENT_INDEX.actors.values()].filter((actor) => {
    if (actor.role === 'idol' && !isIdolRecruited(state, actor.id)) {
      return false;
    }
    return isActorPresent(state, actor);
  });
}

export type TopicAvailability =
  | { ok: true }
  | { ok: false; reason: string };

export function topicAvailability(
  state: GameState,
  actor: ActorDef,
  topic: ActorTopic,
): TopicAvailability {
  const actorState = state.actors[actor.id];
  if (!actorState) return { ok: false, reason: '还不认识' };

  if (topic.once && actorState.flags[`seen:${topic.id}`]) {
    return { ok: false, reason: '已经聊过了' };
  }

  if (topic.cooldownMinutes) {
    const last = actorState.topicCooldowns[topic.id];
    if (
      last !== undefined &&
      state.clock.absoluteMinutes - last < topic.cooldownMinutes
    ) {
      return { ok: false, reason: '还需要等一会儿' };
    }
  }

  if (topic.when && !topic.when.every((condition) => checkCondition(condition, state))) {
    return { ok: false, reason: '条件未满足' };
  }

  return { ok: true };
}

/** 通用数值变量；未写过读作 0。 */
export function getVar(state: GameState, key: string): number {
  return state.vars?.[key] ?? 0;
}

/** 粉丝数。`idolId` 省略时取当前偶像。未知偶像读作 0。 */
export function getFans(state: GameState, idolId?: string): number {
  const id = idolId ?? state.selectedIdolId;
  return state.idols[id]?.fans ?? 0;
}

export function checkCondition(
  condition: Condition,
  state: GameState,
  ctx: CheckContext = {},
): boolean {
  const day = getDay(state.clock.absoluteMinutes);
  const minuteOfDay = getMinuteOfDay(state.clock.absoluteMinutes);

  switch (condition.kind) {
    case 'dayAtLeast':
      return day >= condition.day;
    case 'weekAtLeast':
      return Math.floor((day - 1) / 7) + 1 >= condition.week;
    case 'timeWindow': {
      const { fromMinute, toMinute } = condition;
      if (fromMinute === toMinute) return true;
      return fromMinute < toMinute
        ? minuteOfDay >= fromMinute && minuteOfDay < toMinute
        : minuteOfDay >= fromMinute || minuteOfDay < toMinute;
    }
    case 'sharedStatAtLeast':
      return state.shared[condition.stat] >= condition.value;
    case 'sharedStatAtMost':
      return state.shared[condition.stat] <= condition.value;
    case 'attributeAtLeast': {
      const ref = normalizeAttributeRef(condition.ref);
      if (ref.scope === 'idol' && !ctx.idolId) return false;
      return sameOrHigherRank(
        resolveAttribute(state, ref, ctx.idolId).rank,
        condition.rank,
      );
    }
    case 'attributeAtMost': {
      const ref = normalizeAttributeRef(condition.ref);
      if (ref.scope === 'idol' && !ctx.idolId) return false;
      return (
        rankIndex(resolveAttribute(state, ref, ctx.idolId).rank) <=
        rankIndex(condition.rank)
      );
    }
    case 'castPresent':
      return condition.idolIds.every((id) => {
        const actor = getActor(id);
        return (
          !!actor &&
          actor.role === 'idol' &&
          isIdolRecruited(state, id) &&
          isActorPresent(state, actor)
        );
      });
    case 'npcAffinityAtLeast':
      return (state.actors[condition.actorId]?.affinity ?? 0) >= condition.value;
    case 'npcAffinityAtMost':
      return (state.actors[condition.actorId]?.affinity ?? 0) <= condition.value;
    case 'moneyAtMost':
      return state.money <= condition.value;
    case 'moneyAtLeast':
      return state.money >= condition.value;
    case 'hasItem':
      return (state.inventory[condition.itemId] ?? 0) >= (condition.count ?? 1);
    case 'idolStatus': {
      const idolId = condition.idolId ?? ctx.idolId ?? state.selectedIdolId;
      const current = state.idols[idolId]?.status;
      if (!current) return false;
      return IDOL_STATUS_RANK[current] >= IDOL_STATUS_RANK[condition.status];
    }
    case 'atLocation':
      return state.locationId === condition.locationId;
    case 'flag':
      return (state.flags[condition.key] ?? false) === (condition.value ?? true);
    case 'varAtLeast':
      return getVar(state, condition.key) >= condition.value;
    case 'varAtMost':
      return getVar(state, condition.key) <= condition.value;
    case 'fansAtLeast':
      return (
        getFans(state, condition.idolId ?? ctx.idolId) >= condition.value
      );
    case 'fansAtMost':
      return (
        getFans(state, condition.idolId ?? ctx.idolId) <= condition.value
      );
    case 'all':
      return condition.of.every((child) => checkCondition(child, state, ctx));
    case 'any':
      return condition.of.some((child) => checkCondition(child, state, ctx));
    case 'not':
      return !checkCondition(condition.of, state, ctx);
    default:
      return false;
  }
}

function applyEffects(
  state: GameState,
  effects: Effect[],
  options?: { training?: boolean; stressed?: boolean; idolId?: string },
): void {
  for (const effect of effects) {
    switch (effect.kind) {
      case 'sharedStat':
        state.shared[effect.stat] += effect.delta;
        break;
      case 'attributeExp': {
        const ref = normalizeAttributeRef(effect.ref);
        if (ref.scope === 'idol' && !options?.idolId) {
          throw new Error(
            `attributeExp effect requires an idol context: ${ref.key}`,
          );
        }
        const isPerformance =
          ref.scope === 'idol' &&
          (ref.key === 'vocal' ||
            ref.key === 'dance' ||
            ref.key === 'expression');
        const tier =
          options?.training &&
          options?.stressed &&
          isPerformance &&
          (effect.direction ?? 'gain') === 'gain'
            ? reduceExpTier(effect.tier)
            : effect.tier;
        applyAttributeExp(
          state,
          ref,
          tier,
          effect.direction ?? 'gain',
          options?.idolId,
          { training: options?.training },
        );
        break;
      }
      case 'money':
        state.money += effect.delta;
        break;
      case 'flag':
        state.flags[effect.key] = effect.value;
        break;
      case 'var': {
        const current = getVar(state, effect.key);
        state.vars = { ...(state.vars ?? {}) };
        state.vars[effect.key] =
          (effect.op ?? 'add') === 'set' ? effect.value : current + effect.value;
        break;
      }
      case 'fans': {
        const idolId = effect.idolId ?? options?.idolId;
        if (!idolId) {
          throw new Error('fans effect requires an idol context');
        }
        const idol = state.idols[idolId];
        if (!idol) throw new Error(`unknown idol: ${idolId}`);
        idol.fans =
          (effect.op ?? 'add') === 'set'
            ? effect.value
            : idol.fans + effect.value;
        break;
      }
      case 'scheduleEvent': {
        const day =
          getDay(state.clock.absoluteMinutes) + Math.max(0, effect.inDays);
        state.pendingEvents = [
          ...(state.pendingEvents ?? []),
          { eventId: effect.eventId, day },
        ];
        break;
      }
      case 'unlockSlot': {
        const base = state.slots?.[effect.slot] ?? DEFAULT_EQUIP_SLOTS[effect.slot];
        state.slots = {
          ...(state.slots ?? {}),
          [effect.slot]: base + (effect.amount ?? 1),
        };
        break;
      }
      case 'grantEquip': {
        if (!CONTENT_INDEX.equips.has(effect.equipId)) break;
        const owned = state.ownedEquips ?? [];
        if (owned.includes(effect.equipId)) break;
        state.ownedEquips = [...owned, effect.equipId];
        break;
      }
      case 'actorAffinity': {
        const actor = state.actors[effect.actorId];
        if (actor) actor.affinity += effect.delta;
        break;
      }
      case 'scheduleOverride': {
        const actor = state.actors[effect.actorId];
        if (!actor) break;
        const today = getDay(state.clock.absoluteMinutes);
        const start = today + (effect.dayOffset ?? 0);
        const days = Math.max(1, effect.days ?? 1);
        const added = Array.from({ length: days }, (_, offset) => ({
          id: `effect:${effect.actorId}:${effect.id ?? 'default'}:${start + offset}`,
          day: start + offset,
          locationId: effect.locationId,
          fromMinute: effect.fromMinute ?? 0,
          toMinute: effect.toMinute ?? 24 * 60,
          label: effect.label,
          visibility: 'public' as const,
          mode: effect.mode ?? 'replace-day',
        }));
        const ids = new Set(added.map((entry) => entry.id));
        actor.scheduleOverrides = [
          ...(actor.scheduleOverrides ?? []).filter(
            (entry) => !ids.has(entry.id ?? ''),
          ),
          ...added,
        ];
        break;
      }
      case 'log':
        addLog(state, effect.text, effect.tone ?? 'info');
        break;
    }
  }
}

export function effectSummary(effects: Effect[], cost?: Cost): string {
  const shared: Partial<Record<SharedStatKey, number>> = {
    stamina: -(cost?.stamina ?? 0),
  };
  const exp = new Map<string, { label: string; value: number }>();
  let money = -(cost?.money ?? 0);
  let fans = 0;

  for (const effect of effects) {
    if (effect.kind === 'sharedStat') {
      shared[effect.stat] = (shared[effect.stat] ?? 0) + effect.delta;
    } else if (effect.kind === 'attributeExp') {
      const ref = normalizeAttributeRef(effect.ref);
      const key = ref.scope === 'idol' ? ref.key : `producer:${ref.key}`;
      const value =
        EXP_TIER_VALUES[effect.tier] *
        (effect.direction === 'loss' ? -1 : 1);
      const current = exp.get(key) ?? { label: attributeLabel(ref), value: 0 };
      exp.set(key, { label: current.label, value: current.value + value });
    } else if (effect.kind === 'money') {
      money += effect.delta;
    } else if (effect.kind === 'fans') {
      // set 是绝对量，摘要里没法表达「设成多少」，只标一下。
      if ((effect.op ?? 'add') === 'set') fans = NaN;
      else fans += effect.value;
    }
  }

  const parts: string[] = [];
  if (money !== 0) {
    parts.push(`金钱 ${money > 0 ? '+' : ''}${money}`);
  }
  if (Number.isNaN(fans)) {
    parts.push('粉丝变动');
  } else if (fans !== 0) {
    parts.push(`粉丝 ${fans > 0 ? '+' : ''}${formatFans(fans)}`);
  }

  const expOrder = [
    'vocal',
    'dance',
    'expression',
    'trust',
    ...PRODUCER_STAT_KEYS.map((key) => `producer:${key}`),
  ];
  for (const key of expOrder) {
    const entry = exp.get(key);
    if (entry && entry.value !== 0) {
      parts.push(
        `${entry.label} EXP ${entry.value > 0 ? '+' : ''}${entry.value}`,
      );
    }
  }

  const sharedOrder: SharedStatKey[] = ['stamina', 'stress'];
  for (const stat of sharedOrder) {
    const delta = shared[stat] ?? 0;
    if (delta !== 0) {
      parts.push(`${STAT_LABELS[stat]} ${delta > 0 ? '+' : ''}${delta}`);
    }
  }
  return parts.join(' · ');
}

export function presentIdolIds(state: GameState): string[] {
  return presentActors(state)
    .filter((actor) => actor.role === 'idol')
    .map((actor) => actor.id);
}

export function activityTargets(
  state: GameState,
  activity: ActivityDef,
  idolId?: string,
): string[] {
  const owned = (ids: string[]) =>
    activity.idolIds
      ? ids.filter((id) => activity.idolIds!.includes(id))
      : ids;

  if (activity.target === 'all-present-idols') {
    return owned(presentIdolIds(state));
  }
  if (activity.target === 'present-idol') {
    return idolId && owned([idolId]).length > 0 ? [idolId] : [];
  }
  return [];
}

export function activityAvailability(
  state: GameState,
  activity: ActivityDef,
  idolId?: string,
): Availability {
  if (
    state.flags.forced_rest &&
    activity.kind !== 'rest' &&
    activity.kind !== 'sleep'
  ) {
    return { ok: false, display: 'hide', reason: '她需要休息' };
  }
  if (activity.locations && !activity.locations.includes(state.locationId)) {
    return { ok: false, display: 'hide', reason: '不在此地点' };
  }
  // 专属行动：不属于当前目标时整条消失，而不是灰掉。
  if (activity.idolIds && (!idolId || !activity.idolIds.includes(idolId))) {
    return { ok: false, display: 'hide', reason: '专属行动' };
  }
  if (
    activity.timeWindows &&
    !activity.timeWindows.some((window) =>
      isMinuteInWindow(state.clock.absoluteMinutes, window),
    )
  ) {
    return { ok: false, display: 'hide', reason: '现在不能做' };
  }
  if (activity.target === 'present-idol') {
    const actor = idolId ? getActor(idolId) : undefined;
    if (
      !actor ||
      actor.role !== 'idol' ||
      !isIdolRecruited(state, idolId!) ||
      !isActorPresent(state, actor)
    ) {
      return {
        ok: false,
        display: 'hide',
        reason: '她不在这里',
      };
    }
  }
  if (activity.target === 'all-present-idols') {
    if (activityTargets(state, activity).length === 0) {
      return {
        ok: false,
        display: 'hide',
        reason: '这里没有偶像',
      };
    }
    if (activity.workReward || activity.workRisk) {
      return {
        ok: false,
        display: 'hide',
        reason: '多目标行动不能带工作结算',
      };
    }
  }

  const staminaCost = activityStaminaCost(state, activity);
  const reasons: string[] = [];
  if (activity.cost.money && state.money < activity.cost.money) {
    reasons.push(`金钱不足（需要 ¥${activity.cost.money}）`);
  }
  if (staminaCost > 0 && state.shared.stamina < staminaCost) {
    reasons.push(`体力不足（需要 ${staminaCost}）`);
  }
  if (reasons.length > 0) {
    return { ok: false, display: 'disable', reason: reasons.join('；') };
  }

  if (
    activity.requires &&
    !activity.requires.every((c) =>
      checkCondition(c, state, { idolId }),
    )
  ) {
    return { ok: false, display: 'disable', reason: '条件未满足' };
  }

  if (activity.workRisk && idolId) {
    const risk = workRiskPreview(
      state,
      activity.workRisk,
      activity.workReward,
      idolId,
    );
    if (!risk.eligible) {
      return {
        ok: false,
        display: 'disable',
        reason: `需要${risk.ref ? attributeLabel(risk.ref) : '属性'} ${risk.minRank}`,
      };
    }
  }
  return { ok: true };
}

/** 移动实际占用的时间。步行与交通都走这里。 */
export function travelMinutes(state: GameState, base: number): number {
  return Math.max(1, Math.round(base * resolveModifiers(state, 'travel')));
}

/**
 * 到达之后的检查：先看到达事件，再看已到期的延迟事件与定时事件。
 * 移动会让时间走一段，所以「到点」的戏在这里补结算，不必等下一个行动。
 */
function afterArrival(state: GameState): GameState {
  const result = checkForEvent(
    state,
    { locationId: state.locationId },
    { pool: 'arrival' },
  );
  return result.event ? result.state : state;
}

export function moveTo(state: GameState, locationId: string): GameState {
  if (state.phase !== 'plan') return state;
  const location = CONTENT_INDEX.locations.get(locationId);
  if (!location || state.locationId === locationId) return state;
  const edge = walkEdge(state.locationId, locationId);
  if (!edge) return state;

  const next = clone(state);
  next.locationId = locationId;
  next.pendingActivityId = undefined;
  next.pendingEventId = undefined;
  addLog(next, `移动到了${location.name}。`, 'info');

  const advanced = advanceTime(next, travelMinutes(next, edge.minutes));
  advanced.phase = 'plan';
  return afterArrival(advanced);
}

export function travelTo(state: GameState, locationId: string): GameState {
  const path = walkPath(state.locationId, locationId);
  if (path.length === 0) return state;
  let current = state;
  for (const step of path.slice(1)) {
    // 上一跳触发了事件：停在这里，等事件结算完再继续。
    if (current.phase !== 'plan') return current;
    const moved = moveTo(current, step);
    if (moved.locationId !== step) return current;
    current = moved;
  }
  return current;
}

export function takeTransit(state: GameState, routeId: string): GameState {
  if (state.phase !== 'plan') return state;
  const route = CONTENT_INDEX.transitRoutes.get(routeId);
  if (!route || route.from !== state.locationId) return state;
  if (state.money < route.fare) return state;

  const destination = CONTENT_INDEX.locations.get(route.to);
  if (!destination) return state;

  const next = clone(state);
  next.money -= route.fare;
  next.locationId = route.to;
  next.pendingActivityId = undefined;
  next.pendingEventId = undefined;
  addLog(
    next,
    `乘坐公交前往${destination.name}，车费 ¥${route.fare}。`,
    'info',
  );

  const advanced = advanceTime(next, travelMinutes(next, route.minutes));
  advanced.phase = 'plan';
  return afterArrival(advanced);
}

export function enterNpc(state: GameState, actorId: string): GameState {
  if (state.phase !== 'plan') return state;
  const actor = getActor(actorId);
  if (!actor || !isActorPresent(state, actor)) return state;

  const next = clone(state);
  next.phase = 'npc';
  next.pendingActorId = actor.id;
  next.pendingTopicId = undefined;
  next.lastResult = undefined;
  return next;
}

export function leaveNpc(state: GameState): GameState {
  if (state.phase !== 'npc') return state;
  const next = clone(state);
  next.pendingActorId = undefined;
  next.pendingTopicId = undefined;
  next.phase = 'plan';
  return next;
}

export function enterIdol(state: GameState, idolId: string): GameState {
  if (state.phase !== 'plan') return state;
  if (!isIdolRecruited(state, idolId)) return state;
  const actor = getActor(idolId);
  if (!actor || actor.role !== 'idol' || !isActorPresent(state, actor)) {
    return state;
  }

  const next = clone(state);
  next.phase = 'idol';
  next.selectedIdolId = idolId;
  next.pendingActorId = undefined;
  next.pendingTopicId = undefined;
  next.pendingActivityId = undefined;
  next.lastResult = undefined;
  return next;
}

export function leaveIdol(state: GameState): GameState {
  if (state.phase !== 'idol') return state;
  const next = clone(state);
  next.pendingActivityId = undefined;
  next.phase = 'plan';
  return next;
}

export function train(
  state: GameState,
  idolId: string,
  activityId: string,
): GameState {
  if (state.phase !== 'idol' || state.selectedIdolId !== idolId) return state;
  if (!isIdolRecruited(state, idolId)) return state;

  const actor = getActor(idolId);
  const activity = getActivity(activityId);
  if (
    !actor ||
    actor.role !== 'idol' ||
    !isActorPresent(state, actor) ||
    !activity ||
    activity.kind !== 'training' ||
    !activityAvailability(state, activity, idolId).ok
  ) {
    return state;
  }

  const next = applyActivity(state, activityId, idolId);
  if (next.phase !== 'activityResult' && next.phase !== 'event') return state;
  next.pendingIdolReturnId = idolId;
  return next;
}

export function work(
  state: GameState,
  idolId: string,
  activityId: string,
): GameState {
  if (state.phase !== 'idol' || state.selectedIdolId !== idolId) return state;
  if (!isIdolRecruited(state, idolId)) return state;

  const actor = getActor(idolId);
  const activity = getActivity(activityId);
  if (
    !actor ||
    actor.role !== 'idol' ||
    !isActorPresent(state, actor) ||
    !activity ||
    activity.kind !== 'work' ||
    !activityAvailability(state, activity, idolId).ok
  ) {
    return state;
  }

  const next = applyActivity(state, activityId, idolId);
  if (next.phase !== 'activityResult' && next.phase !== 'event') return state;
  next.pendingIdolReturnId = idolId;
  return next;
}

/** 今天还能和这个角色聊几次。 */
export function chatRemainingToday(
  state: GameState,
  actorId: string,
): number {
  const key = `${getDay(state.clock.absoluteMinutes)}:${actorId}`;
  const used = state.chatCounts?.[key] ?? 0;
  return Math.max(0, CHAT_DAILY_LIMIT - used);
}

/**
 * 从可用话题里随机挑一条来聊，偶像页只暴露这一个入口。
 *
 * 每次花 `CHAT_MINUTES` 分钟，每天最多 `CHAT_DAILY_LIMIT` 次。
 */
export function chatWith(state: GameState, actorId: string): GameState {
  const fromIdolPage =
    state.phase === 'idol' && state.selectedIdolId === actorId;
  if (!fromIdolPage && state.phase !== 'npc') return state;
  const actor = getActor(actorId);
  if (!actor || !isActorPresent(state, actor)) return state;
  if (chatRemainingToday(state, actorId) <= 0) return state;

  const available = actor.topics.filter(
    (topic) => topicAvailability(state, actor, topic).ok,
  );
  if (available.length === 0) return state;

  const rng = new Rng(state.rng.seed, state.rng.counter);
  const chosen = rng.pick(available);

  // 从偶像页发起时，聊完要回到偶像页，而不是 NPC 的话题列表。
  const seeded = clone(state);
  seeded.rng.counter = rng.counter;
  if (fromIdolPage) seeded.pendingIdolReturnId = actorId;

  const talked = talkTo(seeded, actorId, chosen.id);
  const key = `${getDay(talked.clock.absoluteMinutes)}:${actorId}`;
  talked.chatCounts = {
    ...talked.chatCounts,
    [key]: (talked.chatCounts?.[key] ?? 0) + 1,
  };

  // 聊两句也花时间。
  return advanceTime(talked, CHAT_MINUTES);
}

export function talkTo(
  state: GameState,
  actorId: string,
  topicId: string,
): GameState {
  // 偶像页也能发起话题：她就在眼前，没必要先绕到 NPC 页。
  const fromIdolPage =
    state.phase === 'idol' && state.selectedIdolId === actorId;
  if (!fromIdolPage && (state.phase !== 'npc' || state.pendingActorId !== actorId)) {
    return state;
  }
  const actor = getActor(actorId);
  if (!actor || !isActorPresent(state, actor)) return state;

  const topic = actor.topics.find((item) => item.id === topicId);
  if (!topic || !topicAvailability(state, actor, topic).ok) return state;

  const next = clone(state);
  if (fromIdolPage) {
    next.phase = 'npc';
    next.pendingActorId = actor.id;
  }
  applyEffects(next, topic.effects, { idolId: next.selectedIdolId });
  clampState(next);
  updateForcedRest(next);

  const actorState = next.actors[actor.id]!;
  if (topic.once) actorState.flags[`seen:${topic.id}`] = true;
  if (topic.cooldownMinutes) {
    actorState.topicCooldowns[topic.id] = next.clock.absoluteMinutes;
  }

  next.pendingActorId = actor.id;
  next.pendingTopicId = topic.id;
  next.phase = 'npcResult';
  next.lastResult = topic.text;
  addLog(next, `${actor.name}：${topic.text}`, 'info');
  return next;
}

export function advanceTime(state: GameState, minutes: number): GameState {
  const next = clone(state);
  const beforeDay = getDay(next.clock.absoluteMinutes);
  next.clock.absoluteMinutes += Math.max(0, minutes);
  pruneScheduleOverrides(next);
  completeDueJobs(next);
  const afterDay = getDay(next.clock.absoluteMinutes);
  if (afterDay !== beforeDay) {
    emitGameEvent({ kind: 'dayStarted', day: afterDay }, next);
  }
  return next;
}

export function pruneScheduleOverrides(state: GameState): void {
  const currentDay = getDay(state.clock.absoluteMinutes);
  for (const actorState of Object.values(state.actors)) {
    if (!actorState.scheduleOverrides) continue;
    actorState.scheduleOverrides = actorState.scheduleOverrides.filter(
      (entry) => entry.day >= currentDay,
    );
  }
}

/**
 * 检定的成功率。同等级 50%，每差一级 ±15%，再按内容给的 shift 微调，
 * 夹在 5%–95%。界面只显示档位，不显示这个数。
 */
/** 检定成功率的统一公式：等级差 ×15%，再叠加 shift，夹在 5%–95%。 */
function checkChance(
  state: GameState,
  check: { ref: AttributeRefInput; difficulty: Rank; shift?: number },
  idolId?: string,
): number {
  const targetId = idolId ?? state.selectedIdolId;
  const actual = resolveAttribute(state, check.ref, targetId).rank;
  const raw =
    0.5 +
    (rankIndex(actual) - rankIndex(check.difficulty)) * 0.15 +
    (check.shift ?? 0) / 100;
  return Math.min(0.95, Math.max(0.05, raw));
}

export function activityCheckChance(
  state: GameState,
  activity: ActivityDef,
  idolId?: string,
): number | undefined {
  const check = activity.check;
  return check ? checkChance(state, check, idolId) : undefined;
}

/**
 * 工作检定成功率。
 *
 * 压力 ≥ 70 时再 −15%：她已经绷到头了，这时候还要她上节目，
 * 出错是必然的。训练不受这条影响（训练有它自己的降档惩罚）。
 */
/**
 * 信任给工作的加成。
 *
 * 信 E 起算，每高一级 +2%，B 级封顶 +6%。
 * 幅度刻意压得很小：专业属性差一级就是 15%，信任不该盖过"她练了什么"。
 * 只作用于工作检定，训练不吃这条。
 */
export function trustJobBonus(state: GameState, idolId?: string): number {
  const targetId = idolId ?? state.selectedIdolId;
  const trust = resolveAttribute(state, { scope: 'idol', key: 'trust' }, targetId).rank;
  const levels = Math.max(0, rankIndex(trust) - rankIndex('E'));
  return Math.min(0.06, levels * 0.02);
}

export function jobCheckChance(
  state: GameState,
  job: JobDef,
  idolId?: string,
): number | undefined {
  if (!job.check) return undefined;
  let chance = checkChance(state, job.check, idolId) + trustJobBonus(state, idolId);
  // 压力 ≥ 70：她已经绷到头了，再扣 15%。
  if (state.shared.stress >= 70) chance -= 0.15;
  return Math.min(0.95, Math.max(0.05, chance));
}

/** 界面用档位；不暴露精确概率。 */
export function activityCheckLabel(chance: number): string {
  if (chance >= 0.75) return '有把握';
  if (chance >= 0.45) return '五五开';
  return '很勉强';
}

function pickActivityResult(
  state: GameState,
  activity: ActivityDef,
  rng: Rng,
  idolId?: string,
  passed?: boolean,
): string {
  if (passed === false) {
    const texts =
      activity.failureTexts?.length
        ? activity.failureTexts
        : activity.resultTexts;
    return rng.pick(texts);
  }
  const variant = activity.resultVariants?.find((entry) =>
    entry.when.every((condition) =>
      checkCondition(condition, state, { idolId }),
    ),
  );
  return variant?.text ?? rng.pick(activity.resultTexts);
}

/** 挂在单个偶像身上的效果按目标各结算一份；其余效果一次行动只算一次。 */
function isPerIdolEffect(effect: Effect): boolean {
  // 显式写了 idolId 的粉丝效果只作用于那一个人，不该跟着目标循环翻倍。
  if (effect.kind === 'fans') return !effect.idolId;
  return (
    effect.kind === 'attributeExp' &&
    normalizeAttributeRef(effect.ref).scope === 'idol'
  );
}

export function formatCastText(text: string, cast: string[]): string {
  if (cast.length === 0) return text;
  const names = cast.map(
    (idolId) => CONTENT_INDEX.idols.get(idolId)?.name ?? idolId,
  );
  return text
    .replace(/\{a\}/g, names[0] ?? '')
    .replace(/\{b\}/g, names[1] ?? names[0] ?? '');
}

export function applyActivity(
  state: GameState,
  activityId: string,
  idolId?: string,
): GameState {
  const activity = getActivity(activityId);
  if (!activity) return state;
  const next = applyActivityDef(state, activity, idolId);
  if (next !== state) {
    emitGameEvent(
      { kind: 'activityDone', activityId, passed: next.pendingActivityPassed },
      next,
    );
  }
  return next;
}

export function applyActivityDef(
  state: GameState,
  activity: ActivityDef,
  idolId?: string,
): GameState {
  if (!activityAvailability(state, activity, idolId).ok) return state;

  const next = clone(state);
  const rng = new Rng(next.rng.seed, next.rng.counter);
  const stressed = next.shared.stress >= 70;
  next.pendingResults = undefined;

  const checkChance = activityCheckChance(state, activity, idolId);
  const passed = checkChance === undefined ? undefined : rng.chance(checkChance);
  const rawEffects =
    passed === false ? (activity.failureEffects ?? []) : activity.effects;
  // 零工的报酬与压力跟着熟练度走：同一个行动，老手拿得多、也更不累。
  const oddJob = oddJobScale(state, activity);
  const activeEffects = oddJob
    ? rawEffects.map((effect) => {
        if (effect.kind === 'money') {
          return { ...effect, delta: Math.round(effect.delta * oddJob.pay) };
        }
        if (effect.kind === 'sharedStat' && effect.stat === 'stress') {
          return { ...effect, delta: Math.round(effect.delta * oddJob.stress) };
        }
        return effect;
      })
    : rawEffects;

  if (activity.kind === 'sleep') {
    const current = next.clock.absoluteMinutes;
    const dayStart = Math.floor(current / MINUTES_PER_DAY) * MINUTES_PER_DAY;
    let target = dayStart + SLEEP_UNTIL_MINUTE;
    if (target <= current) target += MINUTES_PER_DAY;

    const minutes = target - current;
    const hours = minutes / 60;
    const staminaGain = Math.min(
      maxStamina(next) - next.shared.stamina,
      Math.round(hours * 10),
    );

    next.shared.stamina += staminaGain;
    next.shared.stress = Math.max(
      0,
      next.shared.stress - Math.round(hours * 2),
    );
    next.flags.forced_rest = false;
    next.actionsTaken += 1;
    next.pendingActivityId = activity.id;
    next.phase = 'activityResult';
    next.lastResult =
      staminaGain > 0
        ? `你睡到早上 8 点，恢复了 ${staminaGain} 点体力。`
        : '你睡到早上 8 点。体力已经是满的。';

    const slept = advanceTime(next, minutes);
    addLog(slept, `${activity.name}：${slept.lastResult}`, 'good');
    return slept;
  }

  // 多目标行动解析成一份偶像列表；其余行动只结算显式传入的偶像。
  const resolvedTargets: Array<string | undefined> =
    activity.target === 'all-present-idols'
      ? activityTargets(state, activity)
      : [idolId];

  const cost = activityCost(state, activity, idolId);
  next.money -= cost.money ?? 0;
  next.shared.stamina -= cost.stamina ?? 0;

  // 多目标：偶像属性按人各一份；制作人属性、sharedStat、金钱、flag 等只结算一次。
  const isMultiTarget = resolvedTargets.length > 1;
  const perTargetEffects = isMultiTarget
    ? activeEffects.filter(isPerIdolEffect)
    : activeEffects;
  const sharedEffects = isMultiTarget
    ? activeEffects.filter((effect) => !isPerIdolEffect(effect))
    : [];

  const outcomes = resolvedTargets.map((targetId) => {
    const risk =
      passed !== false && activity.workRisk && targetId
        ? workRiskPreview(next, activity.workRisk, activity.workReward, targetId)
        : undefined;
    const failed = !!risk && risk.chance > 0 && rng.next() < risk.chance;
    applyEffects(next, perTargetEffects, {
      training: activity.kind === 'training',
      stressed,
      idolId: targetId,
    });
    const reward =
      !failed && activity.workReward && targetId
        ? workRewardPreview(next, activity.workReward, targetId)
        : undefined;
    if (reward) next.money += reward.money;
    return {
      idolId: targetId,
      failed,
      rewardMoney: reward ? reward.money : undefined,
    };
  });
  if (sharedEffects.length > 0) applyEffects(next, sharedEffects, {});
  clampState(next);
  updateForcedRest(next);

  next.actionsTaken += 1;
  next.pendingActivityId = activity.id;
  next.pendingActivityPassed = passed;
  next.phase = 'activityResult';

  const advanced = advanceTime(next, activityDuration(next, activity));
  advanced.rng.counter = rng.counter;

  const single = outcomes.length === 1 ? outcomes[0] : undefined;

  if (single?.failed) {
    advanced.pendingActivityId = undefined;
    advanced.pendingEventIdolId = single.idolId;
    const failureEventId = activity.workRisk?.failureEventId;
    if (failureEventId) {
      advanced.pendingEventId = failureEventId;
      advanced.pendingEventIdolId = single.idolId;
      advanced.phase = 'event';
      advanced.lastResult = undefined;
      addLog(advanced, `${activity.name}：工作失败。`, 'bad');
      return advanced;
    }
    advanced.phase = 'activityResult';
    advanced.lastResult = '工作失败了。';
    addLog(advanced, `${activity.name}：工作失败。`, 'bad');
    return advanced;
  }

  if (single) {
    const successEventId = activity.workRisk?.successEventId;
    if (successEventId && getEvent(successEventId)) {
      advanced.pendingActivityId = undefined;
      advanced.pendingEventId = successEventId;
      advanced.pendingEventIdolId = single.idolId;
      advanced.phase = 'event';
      advanced.lastResult = undefined;
      addLog(advanced, `${activity.name}：工作成功。`, 'good');
      return advanced;
    }
  }

  const results = outcomes.map((outcome) => ({
    idolId: outcome.idolId,
    text: pickActivityResult(advanced, activity, rng, outcome.idolId, passed),
    passed,
  }));
  advanced.rng.counter = rng.counter;

  const tone: LogTone =
    passed === false
      ? 'bad'
      : activity.kind === 'rest' ||
          activity.kind === 'bond' ||
          activity.kind === 'explore'
        ? 'good'
        : 'info';

  if (single) {
    const result = results[0]?.text ?? '';
    advanced.lastResult =
      single.rewardMoney !== undefined
        ? `${result} 收入 ¥${single.rewardMoney}。`
        : result;
    addLog(advanced, `${activity.name}：${advanced.lastResult}`, tone);
    return advanced;
  }

  advanced.pendingResults = results.map((entry) => ({
    idolId: entry.idolId ?? '',
    text: entry.text,
    passed: entry.passed,
  }));
  const names = results.map(
    (entry) =>
      CONTENT_INDEX.idols.get(entry.idolId ?? '')?.name ?? entry.idolId ?? '',
  );
  advanced.lastResult = results
    .map((entry, index) => `${names[index]}：${entry.text}`)
    .join('\n');
  addLog(advanced, `${activity.name}：${names.join('、')}`, tone);

  return advanced;
}

function matchesAfter(
  selector: EventDef['after'],
  ctx: EventContext,
): boolean {
  if (!selector) return true;
  if ('ids' in selector) {
    return !!ctx.lastActivityId && selector.ids.includes(ctx.lastActivityId);
  }
  return !!ctx.lastActivityKind && selector.kinds.includes(ctx.lastActivityKind);
}

function matchesAfterNpc(
  selector: EventDef['afterNpc'],
  ctx: EventContext,
): boolean {
  if (!selector) return true;
  return !!ctx.npcId && selector.ids.includes(ctx.npcId);
}

function matchesAfterIdol(
  selector: EventDef['afterIdol'],
  ctx: EventContext,
): boolean {
  if (!selector) return true;
  return !!ctx.idolId && selector.ids.includes(ctx.idolId);
}

function cooldownReady(event: EventDef, state: GameState): boolean {
  const cooldown = event.cooldownActions ?? 0;
  if (cooldown <= 0) return true;
  const last = state.eventCooldowns[event.id];
  if (last === undefined) return true;
  return state.actionsTaken - last >= cooldown;
}

function isPresentIdol(state: GameState, idolId: string): boolean {
  const actor = getActor(idolId);
  return (
    !!actor &&
    actor.role === 'idol' &&
    isIdolRecruited(state, idolId) &&
    isActorPresent(state, actor)
  );
}

function pairCooldownKey(eventId: string, cast: string[]): string {
  return `${eventId}#${[...cast].sort().join('+')}`;
}

function castCooldownReady(event: EventDef, state: GameState): boolean {
  const cooldown = event.pairCooldownActions ?? 0;
  if (cooldown <= 0 || !event.cast) return true;
  const last = state.eventCooldowns[pairCooldownKey(event.id, event.cast)];
  if (last === undefined) return true;
  return state.actionsTaken - last >= cooldown;
}

/** 解析这场戏的参与者：显式 cast 优先，否则从在场偶像里随机挑 castSize 人。 */
function resolveEventCast(
  state: GameState,
  event: EventDef,
  rng: Rng,
): string[] {
  if (event.cast && event.cast.length > 0) return [...event.cast];
  if (event.castSize && event.castSize >= 2) {
    const pool = presentIdolIds(state);
    if (pool.length < event.castSize) return [];
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng.next() * (i + 1));
      const left = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = left;
    }
    return shuffled.slice(0, event.castSize);
  }
  return [];
}

function isEligible(
  event: EventDef,
  state: GameState,
  ctx: EventContext,
): boolean {
  if (!matchesAfter(event.after, ctx)) return false;
  if (!matchesAfterNpc(event.afterNpc, ctx)) return false;
  if (!matchesAfterIdol(event.afterIdol, ctx)) return false;
  if (
    event.cast &&
    !event.cast.every((idolId) => isPresentIdol(state, idolId))
  ) {
    return false;
  }
  if (event.castSize && presentIdolIds(state).length < event.castSize) {
    return false;
  }
  if (!event.when.every((condition) => checkCondition(condition, state, ctx))) {
    return false;
  }
  if (event.once && state.flags[`seen:${event.id}`]) return false;
  if (!cooldownReady(event, state)) return false;
  if (!castCooldownReady(event, state)) return false;
  return true;
}

function buildPool(ctx: EventContext): EventDef[] {
  const pool = new Set<EventDef>(CONTENT_INDEX.globalEvents);

  if (ctx.lastActivityId) {
    for (const event of CONTENT_INDEX.eventsByActivityId.get(ctx.lastActivityId) ?? []) {
      pool.add(event);
    }
  }
  if (ctx.lastActivityKind) {
    for (const event of CONTENT_INDEX.eventsByKind.get(ctx.lastActivityKind) ?? []) {
      pool.add(event);
    }
  }
  if (ctx.locationId) {
    for (const event of CONTENT_INDEX.eventsByLocation.get(ctx.locationId) ?? []) {
      pool.add(event);
    }
  }
  if (ctx.idolId) {
    for (const event of CONTENT_INDEX.eventsByIdolId.get(ctx.idolId) ?? []) {
      pool.add(event);
    }
  }

  return [...pool].filter(
    (event) => !event.trigger && event.entry?.kind !== 'arrival',
  );
}

/**
 * 到达某地时可以考虑的事件。只看显式写了 `entry.kind = 'arrival'` 的，
 * 不碰行动后随机池 —— 否则所有「做完某事」的戏都会变成「走进来就中」。
 */
function buildArrivalPool(): EventDef[] {
  return [...CONTENT_INDEX.events.values()].filter(
    (event) => event.entry?.kind === 'arrival' && !event.trigger,
  );
}

/** 到点的定时事件：周期、时间、当日去重、when 条件。 */
function buildScheduledPool(state: GameState): EventDef[] {
  const day = getDay(state.clock.absoluteMinutes);
  const minute = getMinuteOfDay(state.clock.absoluteMinutes);

  return [...CONTENT_INDEX.events.values()].filter((event) => {
    const trigger = event.trigger;
    if (!trigger) return false;
    if (state.scheduledDays?.[event.id] === day) return false;
    if (minute < trigger.atMinute) return false;
    if (trigger.weekday !== undefined) {
      if (getWeekdayFromDay(day) !== trigger.weekday) return false;
    } else if (trigger.everyDays && trigger.everyDays > 0) {
      if ((day - 1) % trigger.everyDays !== 0) return false;
    } else {
      return false;
    }
    return event.when.every((condition) => checkCondition(condition, state));
  });
}

/** 把事件推到待选择状态；调用方负责清理自己的队列。 */
function enterEvent(state: GameState, picked: EventDef): GameState {
  const next = clone(state);
  next.pendingEventId = picked.id;
  next.pendingEventCast = undefined;
  next.pendingEventIdolId = picked.cast?.[0] ?? state.selectedIdolId;
  next.pendingChainEventId = undefined;
  next.phase = 'event';
  addLog(next, `事件：${picked.title}`, 'info');
  return next;
}

function fireScheduled(
  state: GameState,
  picked: EventDef,
): EventCheckResult {
  const next = enterEvent(state, picked);
  next.scheduledDays = {
    ...(next.scheduledDays ?? {}),
    [picked.id]: getDay(next.clock.absoluteMinutes),
  };
  return { state: next, event: picked };
}

function weightedPick(events: EventDef[], rng: Rng): EventDef {
  const total = events.reduce((sum, event) => sum + (event.weight ?? 1), 0);
  let roll = rng.next() * total;
  let picked = events[events.length - 1]!;
  for (const event of events) {
    roll -= event.weight ?? 1;
    if (roll <= 0) {
      picked = event;
      break;
    }
  }
  return picked;
}

export type EventCheckResult = {
  state: GameState;
  event: EventDef | null;
};

export function checkEventCandidates(
  state: GameState,
  candidates: EventDef[],
  ctx: EventContext = {},
): EventCheckResult {
  const eligible = candidates.filter((event) => isEligible(event, state, ctx));
  if (eligible.length === 0) {
    return { state, event: null };
  }

  const next = clone(state);
  const rng = new Rng(next.rng.seed, next.rng.counter);
  const passed = eligible.filter((event) => {
    if (event.chance === undefined) return true;
    return rng.next() < event.chance;
  });

  if (passed.length === 0) {
    next.rng.counter = rng.counter;
    return { state: next, event: null };
  }

  const topPriority = Math.max(...passed.map((event) => event.priority ?? 0));
  const top = passed.filter((event) => (event.priority ?? 0) === topPriority);
  const picked = weightedPick(top, rng);
  const cast = resolveEventCast(next, picked, rng);

  next.rng.counter = rng.counter;
  if (picked.once) next.flags[`seen:${picked.id}`] = true;
  next.eventCooldowns[picked.id] = next.actionsTaken;
  if (cast.length > 1) {
    next.eventCooldowns[pairCooldownKey(picked.id, cast)] = next.actionsTaken;
  }
  next.pendingEventId = picked.id;
  next.pendingEventCast = cast.length > 1 ? cast : undefined;
  next.pendingEventIdolId = cast[0] ?? ctx.idolId;
  next.pendingChainEventId = undefined;
  next.phase = 'event';
  addLog(next, `事件：${picked.title}`, 'info');
  return { state: next, event: picked };
}

/** 到点的定时事件；没有则返回 event: null，不改 state。 */
export function checkScheduledEvent(state: GameState): EventCheckResult {
  const due = buildScheduledPool(state);
  if (due.length === 0) return { state, event: null };

  const picked = [...due].sort(
    (a, b) =>
      (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id),
  )[0]!;
  return fireScheduled(state, picked);
}

/** 到期的延迟事件；一次只处理一条，其余留在队列里。 */
export function checkPendingEvents(state: GameState): EventCheckResult {
  const queue = state.pendingEvents ?? [];
  if (queue.length === 0) return { state, event: null };

  const today = getDay(state.clock.absoluteMinutes);
  const due = queue
    .map((entry, index) => ({
      entry,
      index,
      event: CONTENT_INDEX.events.get(entry.eventId),
    }))
    .filter(
      (item): item is { entry: { eventId: string; day: number }; index: number; event: EventDef } =>
        item.entry.day <= today && Boolean(item.event),
    );

  if (due.length === 0) return { state, event: null };

  due.sort(
    (a, b) =>
      (b.event.priority ?? 0) - (a.event.priority ?? 0) ||
      a.entry.eventId.localeCompare(b.entry.eventId),
  );
  const picked = due[0]!;
  const next = enterEvent(state, picked.event);
  next.pendingEvents = queue.filter((_, index) => index !== picked.index);
  return { state: next, event: picked.event };
}

export type EventCheckOptions = {
  /** 用哪个池子挑第一个候选；默认 `action`（行动后随机池）。 */
  pool?: 'action' | 'arrival';
};

export function checkForEvent(
  state: GameState,
  ctx: EventContext = {},
  options: EventCheckOptions = {},
): EventCheckResult {
  const context: EventContext = {
    ...ctx,
    locationId: ctx.locationId ?? state.locationId,
  };
  const candidates =
    options.pool === 'arrival' ? buildArrivalPool() : buildPool(context);
  const random = checkEventCandidates(state, candidates, context);
  if (random.event) return random;

  const pending = checkPendingEvents(random.state);
  if (pending.event) return pending;

  return checkScheduledEvent(pending.state);
}

export function checkNpcEvent(
  state: GameState,
  npcId: string,
  topicId: string,
): EventCheckResult {
  const candidates = CONTENT_INDEX.eventsByNpcId.get(npcId) ?? [];
  return checkEventCandidates(state, candidates, {
    npcId,
    topicId,
    locationId: state.locationId,
  });
}

export function getTriggerReport(
  state: GameState,
  ctx: EventContext = {},
): TriggerReport[] {
  return [...CONTENT_INDEX.events.values()].map((event) => {
    if (!matchesAfter(event.after, ctx)) {
      return { eventId: event.id, eligible: false, reason: 'after' };
    }
    if (!matchesAfterNpc(event.afterNpc, ctx)) {
      return { eventId: event.id, eligible: false, reason: 'after' };
    }
    if (!matchesAfterIdol(event.afterIdol, ctx)) {
      return { eventId: event.id, eligible: false, reason: 'after' };
    }
    if (!event.when.every((condition) => checkCondition(condition, state, ctx))) {
      return { eventId: event.id, eligible: false, reason: 'condition' };
    }
    if (event.once && state.flags[`seen:${event.id}`]) {
      return { eventId: event.id, eligible: false, reason: 'once' };
    }
    if (!cooldownReady(event, state)) {
      return { eventId: event.id, eligible: false, reason: 'cooldown' };
    }
    return {
      eventId: event.id,
      eligible: true,
      priority: event.priority ?? 0,
    };
  });
}

export function applyEventChoice(state: GameState, index: number): GameState {
  if (!state.pendingEventId) return state;
  const event = getEvent(state.pendingEventId);
  if (!event) return state;
  const choice = event.choices[index];
  if (!choice) return state;
  if (
    choice.requires &&
    !choice.requires.every((c) =>
      checkCondition(c, state, { idolId: state.pendingEventIdolId }),
    )
  ) {
    return state;
  }

  const next = clone(state);
  // 事件没有显式目标偶像时，效果作用于当前选中的偶像。
  const effectIdolId = state.pendingEventIdolId ?? state.selectedIdolId;
  const cast = state.pendingEventCast ?? [];

  applyCastEffects(next, choice.effects, cast, effectIdolId);
  clampState(next);
  updateForcedRest(next);

  const advanced =
    choice.durationMinutes && choice.durationMinutes > 0
      ? advanceTime(next, choice.durationMinutes)
      : next;
  advanced.pendingChainEventId =
    choice.nextEventId ?? event.nextEventId;

  const resultText =
    cast.length > 0
      ? formatCastText(choice.result, cast)
      : formatIdolText(choice.result, state.pendingEventIdolId);

  // 选择后进入对话：对话结束回到事件结果，并沿用这次选择的结果文本。
  if (choice.dialogueId) {
    return openDialogue(advanced, {
      dialogueId: choice.dialogueId,
      idolId: effectIdolId,
      cast,
      returnTo: { phase: 'eventResult', result: resultText },
    });
  }

  advanced.phase = 'eventResult';
  advanced.lastResult = resultText;
  addLog(advanced, advanced.lastResult, 'info');
  return advanced;
}

function continueFromActivity(state: GameState): GameState {
  const activityId = state.pendingActivityId;
  const activityKind = activityId ? getActivity(activityId)?.kind : undefined;
  const next = clone(state);
  next.pendingActivityId = undefined;
  next.pendingActivityPassed = undefined;

  const result = checkForEvent(next, {
    lastActivityId: activityId,
    lastActivityKind: activityKind,
    locationId: next.locationId,
    idolId: next.pendingIdolReturnId,
  });
  if (result.event) return result.state;

  if (next.pendingIdolReturnId) {
    const idolActor = getActor(next.pendingIdolReturnId);
    if (idolActor && isActorPresent(next, idolActor)) {
      next.phase = 'idol';
      return next;
    }
    next.pendingIdolReturnId = undefined;
  }

  next.phase = 'plan';
  return next;
}

function continueFromEvent(state: GameState): GameState {
  const next = clone(state);
  const chainEventId = next.pendingChainEventId;
  next.pendingChainEventId = undefined;
  next.pendingActivityId = undefined;
  next.pendingTopicId = undefined;

  if (chainEventId && getEvent(chainEventId)) {
    next.pendingEventId = chainEventId;
    next.phase = 'event';
    next.lastResult = undefined;
    return next;
  }

  next.pendingEventId = undefined;
  next.pendingEventIdolId = undefined;

  if (next.pendingIdolReturnId) {
    const idolActor = getActor(next.pendingIdolReturnId);
    if (idolActor && isActorPresent(next, idolActor)) {
      next.phase = 'idol';
      return next;
    }
    next.pendingIdolReturnId = undefined;
  }

  const actor = next.pendingActorId ? getActor(next.pendingActorId) : undefined;
  if (actor && isActorPresent(next, actor)) {
    next.phase = 'npc';
    return next;
  }

  next.pendingActorId = undefined;
  next.phase = 'plan';
  return next;
}

function continueFromNpc(state: GameState): GameState {
  const next = clone(state);
  const actorId = next.pendingActorId;
  const topicId = next.pendingTopicId;
  next.pendingTopicId = undefined;

  const actor = actorId ? getActor(actorId) : undefined;
  if (!actor || !isActorPresent(next, actor)) {
    next.pendingActorId = undefined;
    next.phase = 'plan';
    return next;
  }

  const result = checkNpcEvent(next, actor.id, topicId ?? '');
  if (result.event) return result.state;

  // 从偶像页来的：回到她的页面，别再把她的话题铺一遍。
  if (next.pendingIdolReturnId === actor.id) {
    next.pendingIdolReturnId = undefined;
    next.pendingActorId = undefined;
    next.selectedIdolId = actor.id;
    next.phase = 'idol';
    return next;
  }

  next.phase = 'npc';
  return next;
}

export function handleCommand(
  state: GameState,
  command: ActionCommand,
): GameState {
  if (state.pendingDialogueId) {
    if (command.type === 'dialogueAdvance') return advanceDialogue(state);
    if (command.type === 'dialogueChoice') {
      return chooseDialogue(state, command.index);
    }
    return state;
  }

  // 装备是界面操作，不占时间，也不依赖当前阶段。
  if (command.type === 'equip') return equipItem(state, command.equipId);
  if (command.type === 'unequip') return unequipSlot(state, command.slotKey);

  switch (state.phase) {
    case 'plan':
      if (command.type === 'startStory') {
        return startStory(state, command.chainId);
      }
      if (command.type === 'move') return moveTo(state, command.locationId);
      if (command.type === 'transit') {
        return takeTransit(state, command.routeId);
      }
      // 打开工作面板是纯 UI 动作，不改变游戏状态。
      if (command.type === 'openJobBoard') return state;
      if (command.type === 'enterNpc') return enterNpc(state, command.actorId);
      if (command.type === 'enterIdol') return enterIdol(state, command.idolId);
      if (command.type === 'acceptJob') {
        return acceptJob(state, command.jobId, command.day, command.idolId);
      }
      if (command.type === 'setFocusIdol') {
        return setFocusIdol(state, command.idolId);
      }
      if (command.type === 'attendJob') {
        return attendJob(state, command.jobId);
      }
      if (command.type === 'buyItem') {
        return buyItem(state, command.itemId);
      }
      if (command.type === 'giveGift') {
        return giveGift(state, command.itemId, command.idolId);
      }
      if (command.type === 'activity') {
        return applyActivity(state, command.activityId, command.idolId);
      }
      return state;

    case 'npc':
      if (command.type === 'leaveNpc') return leaveNpc(state);
      if (command.type === 'talk') {
        return talkTo(state, command.actorId, command.topicId);
      }
      return state;

    case 'idol':
      if (command.type === 'leaveIdol') return leaveIdol(state);
      if (command.type === 'chat') return chatWith(state, command.actorId);
      if (command.type === 'talk') {
        return talkTo(state, command.actorId, command.topicId);
      }
      if (command.type === 'train') {
        return train(state, command.idolId, command.activityId);
      }
      if (command.type === 'work') {
        return work(state, command.idolId, command.activityId);
      }
      if (command.type === 'activity') {
        if (!command.idolId) return state;
        const next = applyActivity(state, command.activityId, command.idolId);
        if (
          next !== state &&
          (next.phase === 'activityResult' || next.phase === 'event')
        ) {
          next.pendingIdolReturnId = command.idolId;
        }
        return next;
      }
      return state;

    case 'activityResult':
      return command.type === 'continue' ? continueFromActivity(state) : state;

    case 'event':
      return command.type === 'eventChoice'
        ? applyEventChoice(state, command.index)
        : state;

    case 'eventResult':
      return command.type === 'continue' ? continueFromEvent(state) : state;

    case 'npcResult':
      return command.type === 'continue' ? continueFromNpc(state) : state;

    default:
      return state;
  }
}

export function handleAction(state: GameState, actionId: string): GameState {
  let command: ActionCommand | null = null;

  switch (state.phase) {
    case 'plan':
      if (actionId.startsWith('move:')) {
        command = { type: 'move', locationId: actionId.slice('move:'.length) };
      } else if (actionId.startsWith('transit:')) {
        command = {
          type: 'transit',
          routeId: actionId.slice('transit:'.length),
        };
      } else if (actionId.startsWith('enter:')) {
        command = {
          type: 'enterNpc',
          actorId: actionId.slice('enter:'.length),
        };
      } else if (actionId.startsWith('idol:')) {
        command = {
          type: 'enterIdol',
          idolId: actionId.slice('idol:'.length),
        };
      } else if (actionId.startsWith('job:')) {
        const [, jobId, dayText] = actionId.split(':');
        const day = Number(dayText);
        if (jobId && Number.isFinite(day)) {
          command = { type: 'acceptJob', jobId, day };
        }
      } else {
        const activity = getActivity(actionId);
        const needsIdol =
          !!activity &&
          (activity.target === 'present-idol' ||
            activity.kind === 'training' ||
            activity.kind === 'work');
        command = {
          type: 'activity',
          activityId: actionId,
          ...(needsIdol ? { idolId: state.selectedIdolId } : {}),
        };
      }
      break;

    case 'npc':
      if (actionId === 'leave_npc') {
        command = { type: 'leaveNpc' };
      } else if (actionId.startsWith('talk:')) {
        const [, actorId, topicId] = actionId.split(':');
        if (actorId && topicId) {
          command = { type: 'talk', actorId, topicId };
        }
      }
      break;

    case 'idol':
      if (actionId === 'leave_idol') {
        command = { type: 'leaveIdol' };
      } else if (actionId.startsWith('train:')) {
        const [, idolId, activityId] = actionId.split(':');
        if (idolId && activityId) {
          command = { type: 'train', idolId, activityId };
        }
      } else if (actionId.startsWith('work:')) {
        const [, idolId, activityId] = actionId.split(':');
        if (idolId && activityId) {
          command = { type: 'work', idolId, activityId };
        }
      }
      break;

    case 'activityResult':
    case 'eventResult':
    case 'npcResult':
      if (actionId === 'continue') command = { type: 'continue' };
      break;

    case 'event':
      if (actionId.startsWith('choice:')) {
        const index = Number(actionId.slice('choice:'.length));
        if (Number.isFinite(index)) {
          command = { type: 'eventChoice', index };
        }
      }
      break;
  }

  return command ? handleCommand(state, command) : state;
}
