import {
  ACTOR_AFFINITY_MAX,
  MINUTES_PER_DAY,
  MOVE_MINUTES,
  SLEEP_UNTIL_MINUTE,
  START_MINUTE,
} from './config';
import { EVENTS, ENDINGS } from './content';
import {
  CONTENT_INDEX,
  createInitialActorStates,
  createInitialIdolStates,
} from './contentIndex';
import { MID_EXAM } from './content/weeks';
import {
  EXP_TIER_VALUES,
  RANK_CURVE,
  nextRank,
  rankIndex,
  reduceExpTier,
  sameOrHigherRank,
} from './growth';
import { STAT_LABELS, STAT_MAX } from './labels';
import { Rng } from './rng';
import { getDay, getMinuteOfDay, isMinuteInWindow } from './time';
import type {
  ActionCommand,
  ActivityDef,
  ActorDef,
  ActorTopic,
  Availability,
  CheckContext,
  Condition,
  Cost,
  Effect,
  EndingDef,
  EventContext,
  EventDef,
  ExpTier,
  GameState,
  IdolAttribute,
  IdolStatKey,
  IdolState,
  LogTone,
  Rank,
  SharedStatKey,
  StatKey,
  TriggerReport,
} from './types';

function clone(state: GameState): GameState {
  return structuredClone(state);
}

function clampState(state: GameState): void {
  state.shared.stamina = Math.max(
    0,
    Math.min(STAT_MAX.stamina, state.shared.stamina),
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
  for (const actor of Object.values(state.actors ?? {})) {
    actor.affinity = Math.max(
      0,
      Math.min(ACTOR_AFFINITY_MAX, actor.affinity),
    );
  }
}

export function getIdol(
  state: GameState,
  idolId: string = state.activeIdolId,
): IdolState {
  const idol = state.idols[idolId] ?? Object.values(state.idols)[0];
  if (!idol) throw new Error('no idol state');
  return idol;
}

export function getActiveIdol(state: GameState): IdolState {
  return getIdol(state);
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

export function getIdolAttribute(
  state: GameState,
  attribute: IdolStatKey,
  idolId: string = state.activeIdolId,
): IdolAttribute {
  return getIdol(state, idolId).stats[attribute];
}

export function getRank(
  state: GameState,
  attribute: IdolStatKey,
  idolId: string = state.activeIdolId,
): Rank {
  return getIdolAttribute(state, attribute, idolId).rank;
}

export function applyIdolExp(
  state: GameState,
  attribute: IdolStatKey,
  tier: ExpTier,
  direction: 'gain' | 'loss' = 'gain',
  idolId: string = state.activeIdolId,
): void {
  const target = getIdolAttribute(state, attribute, idolId);
  const amount = EXP_TIER_VALUES[tier];

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
    const name = CONTENT_INDEX.idols.get(idolId)?.name ?? idolId;
    addLog(
      state,
      `${name} ${STAT_LABELS[attribute]}提升到 ${target.rank}。`,
      'good',
    );
  }
}

export function getStatValue(
  state: GameState,
  stat: StatKey,
  idolId: string = state.activeIdolId,
): number {
  if (stat === 'stamina' || stat === 'stress') {
    return state.shared[stat];
  }
  return rankIndex(getRank(state, stat, idolId));
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
    idols: createInitialIdolStates(),
    activeIdolId: CONTENT_INDEX.startingIdolId,
    money: 3000,
    flags: {},
    eventCooldowns: {},
    log: [],
    phase: 'plan',
    actionsTaken: 0,
    nextLogId: 1,
    rng: { seed: seed >>> 0, counter: 0 },
    midExamDone: false,
    finalExamDone: false,
  };
  addLog(state, '第 1 天。新的三天开始了。', 'info');
  return state;
}

export function getActivity(id: string): ActivityDef | undefined {
  return CONTENT_INDEX.activities.get(id);
}

export function getEvent(id: string): EventDef | undefined {
  return CONTENT_INDEX.events.get(id);
}

export function getEnding(id: string): EndingDef | undefined {
  return CONTENT_INDEX.endings.get(id);
}

export function getActor(id: string): ActorDef | undefined {
  return CONTENT_INDEX.actors.get(id);
}

export function getActorLocation(
  actor: ActorDef,
  absoluteMinutes: number,
): string | undefined {
  return actor.schedule.find((entry) =>
    isMinuteInWindow(absoluteMinutes, entry),
  )?.locationId;
}

export function isActorPresent(state: GameState, actor: ActorDef): boolean {
  const locationId = getActorLocation(actor, state.clock.absoluteMinutes);
  return (
    locationId === state.locationId &&
    isLocationOpen(state, state.locationId)
  );
}

export function presentActors(state: GameState): ActorDef[] {
  return [...CONTENT_INDEX.actors.values()].filter((actor) =>
    isActorPresent(state, actor),
  );
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
    case 'rankAtLeast':
      return sameOrHigherRank(
        getRank(state, condition.attribute, ctx.idolId),
        condition.rank,
      );
    case 'rankAtMost':
      return (
        rankIndex(getRank(state, condition.attribute, ctx.idolId)) <=
        rankIndex(condition.rank)
      );
    case 'npcAffinityAtLeast':
      return (state.actors[condition.actorId]?.affinity ?? 0) >= condition.value;
    case 'npcAffinityAtMost':
      return (state.actors[condition.actorId]?.affinity ?? 0) <= condition.value;
    case 'moneyAtMost':
      return state.money <= condition.value;
    case 'atLocation':
      return state.locationId === condition.locationId;
    case 'flag':
      return (state.flags[condition.key] ?? false) === (condition.value ?? true);
    case 'scoreAtLeast':
      return (state.examScore ?? 0) >= condition.value;
    case 'scoreAtMost':
      return (state.examScore ?? 0) <= condition.value;
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
      case 'idolExp': {
        const isPerformance =
          effect.attribute === 'vocal' ||
          effect.attribute === 'dance' ||
          effect.attribute === 'expression';
        const tier =
          options?.training &&
          options.stressed &&
          isPerformance &&
          (effect.direction ?? 'gain') === 'gain'
            ? reduceExpTier(effect.tier)
            : effect.tier;
        applyIdolExp(
          state,
          effect.attribute,
          tier,
          effect.direction ?? 'gain',
          options?.idolId,
        );
        break;
      }
      case 'money':
        state.money += effect.delta;
        break;
      case 'flag':
        state.flags[effect.key] = effect.value;
        break;
      case 'actorAffinity': {
        const actor = state.actors[effect.actorId];
        if (actor) actor.affinity += effect.delta;
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
  const exp: Partial<Record<IdolStatKey, number>> = {};
  let money = -(cost?.money ?? 0);

  for (const effect of effects) {
    if (effect.kind === 'sharedStat') {
      shared[effect.stat] = (shared[effect.stat] ?? 0) + effect.delta;
    } else if (effect.kind === 'idolExp') {
      const value =
        EXP_TIER_VALUES[effect.tier] *
        (effect.direction === 'loss' ? -1 : 1);
      exp[effect.attribute] = (exp[effect.attribute] ?? 0) + value;
    } else if (effect.kind === 'money') {
      money += effect.delta;
    }
  }

  const parts: string[] = [];
  if (money !== 0) {
    parts.push(`金钱 ${money > 0 ? '+' : ''}${money}`);
  }

  const expOrder: IdolStatKey[] = [
    'vocal',
    'dance',
    'expression',
    'trust',
  ];
  for (const attribute of expOrder) {
    const delta = exp[attribute] ?? 0;
    if (delta !== 0) {
      parts.push(
        `${STAT_LABELS[attribute]} EXP ${delta > 0 ? '+' : ''}${delta}`,
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

export function isLocationOpen(
  state: GameState,
  locationId: string,
): boolean {
  const location = CONTENT_INDEX.locations.get(locationId);
  if (!location) return false;
  if (!location.openHours || location.openHours.length === 0) return true;
  return location.openHours.some((window) =>
    isMinuteInWindow(state.clock.absoluteMinutes, window),
  );
}

export function activityAvailability(
  state: GameState,
  activity: ActivityDef,
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
  if (!isLocationOpen(state, state.locationId)) {
    return { ok: false, display: 'hide', reason: '地点已关门' };
  }
  if (
    activity.timeWindows &&
    !activity.timeWindows.some((window) =>
      isMinuteInWindow(state.clock.absoluteMinutes, window),
    )
  ) {
    return { ok: false, display: 'hide', reason: '现在不能做' };
  }

  const reasons: string[] = [];
  if (activity.cost.money && state.money < activity.cost.money) {
    reasons.push(`金钱不足（需要 ¥${activity.cost.money}）`);
  }
  if (activity.cost.stamina && state.shared.stamina < activity.cost.stamina) {
    reasons.push(`体力不足（需要 ${activity.cost.stamina}）`);
  }
  if (reasons.length > 0) {
    return { ok: false, display: 'disable', reason: reasons.join('；') };
  }

  if (activity.requires && !activity.requires.every((c) => checkCondition(c, state))) {
    return { ok: false, display: 'disable', reason: '条件未满足' };
  }
  return { ok: true };
}

export function moveTo(state: GameState, locationId: string): GameState {
  if (state.phase !== 'plan') return state;
  const location = CONTENT_INDEX.locations.get(locationId);
  if (!location || state.locationId === locationId) return state;
  if (!isLocationOpen(state, locationId)) return state;

  const next = clone(state);
  next.locationId = locationId;
  next.pendingActivityId = undefined;
  next.pendingEventId = undefined;
  addLog(next, `移动到了${location.name}。`, 'info');

  const advanced = advanceTime(next, MOVE_MINUTES);
  if (advanced.pendingExam) return beginPendingExam(advanced);
  advanced.phase = 'plan';
  return advanced;
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
  const actor = getActor(idolId);
  if (!actor || actor.role !== 'idol' || !isActorPresent(state, actor)) {
    return state;
  }

  const next = clone(state);
  next.phase = 'idol';
  next.activeIdolId = idolId;
  next.pendingIdolId = idolId;
  next.pendingActorId = undefined;
  next.pendingTopicId = undefined;
  next.pendingActivityId = undefined;
  next.lastResult = undefined;
  return next;
}

export function leaveIdol(state: GameState): GameState {
  if (state.phase !== 'idol') return state;
  const next = clone(state);
  next.pendingIdolId = undefined;
  next.pendingActivityId = undefined;
  next.phase = 'plan';
  return next;
}

export function train(
  state: GameState,
  idolId: string,
  activityId: string,
): GameState {
  if (state.phase !== 'idol' || state.pendingIdolId !== idolId) return state;

  const actor = getActor(idolId);
  const activity = getActivity(activityId);
  if (
    !actor ||
    actor.role !== 'idol' ||
    !isActorPresent(state, actor) ||
    !activity ||
    activity.kind !== 'training' ||
    !activityAvailability(state, activity).ok
  ) {
    return state;
  }

  const next = applyActivity(state, activityId, idolId);
  if (next.phase !== 'activityResult') return state;
  next.pendingIdolId = idolId;
  return next;
}

export function work(
  state: GameState,
  idolId: string,
  activityId: string,
): GameState {
  if (state.phase !== 'idol' || state.pendingIdolId !== idolId) return state;

  const actor = getActor(idolId);
  const activity = getActivity(activityId);
  if (
    !actor ||
    actor.role !== 'idol' ||
    !isActorPresent(state, actor) ||
    !activity ||
    activity.kind !== 'work' ||
    !activityAvailability(state, activity).ok
  ) {
    return state;
  }

  const next = applyActivity(state, activityId, idolId);
  if (next.phase !== 'activityResult') return state;
  next.pendingIdolId = idolId;
  return next;
}

export function talkTo(
  state: GameState,
  actorId: string,
  topicId: string,
): GameState {
  if (state.phase !== 'npc' || state.pendingActorId !== actorId) return state;
  const actor = getActor(actorId);
  if (!actor || !isActorPresent(state, actor)) return state;

  const topic = actor.topics.find((item) => item.id === topicId);
  if (!topic || !topicAvailability(state, actor, topic).ok) return state;

  const next = clone(state);
  applyEffects(next, topic.effects);
  clampState(next);

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
  next.clock.absoluteMinutes += Math.max(0, minutes);
  return next;
}

function pickActivityResult(
  state: GameState,
  activity: ActivityDef,
  rng: Rng,
): string {
  const variant = activity.resultVariants?.find((entry) =>
    entry.when.every((condition) => checkCondition(condition, state)),
  );
  return variant?.text ?? rng.pick(activity.resultTexts);
}

export function applyActivity(
  state: GameState,
  activityId: string,
  idolId: string = state.activeIdolId,
): GameState {
  const activity = getActivity(activityId);
  if (!activity) return state;
  if (!activityAvailability(state, activity).ok) return state;

  const next = clone(state);
  next.activeIdolId = idolId;
  const rng = new Rng(next.rng.seed, next.rng.counter);
  const stressed = next.shared.stress >= 70;

  if (activity.kind === 'sleep') {
    const current = next.clock.absoluteMinutes;
    const dayStart = Math.floor(current / MINUTES_PER_DAY) * MINUTES_PER_DAY;
    let target = dayStart + SLEEP_UNTIL_MINUTE;
    if (target <= current) target += MINUTES_PER_DAY;

    const minutes = target - current;
    const hours = minutes / 60;
    const staminaGain = Math.min(
      STAT_MAX.stamina - next.shared.stamina,
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

  next.money -= activity.cost.money ?? 0;
  next.shared.stamina -= activity.cost.stamina ?? 0;
  applyEffects(next, activity.effects, {
    training: activity.kind === 'training',
    stressed,
  });
  clampState(next);

  next.actionsTaken += 1;
  next.pendingActivityId = activity.id;
  next.phase = 'activityResult';

  const advanced = advanceTime(next, activity.durationMinutes);
  advanced.lastResult = pickActivityResult(advanced, activity, rng);
  advanced.rng.counter = rng.counter;

  const tone: LogTone =
    activity.kind === 'rest' ||
    activity.kind === 'bond' ||
    activity.kind === 'explore'
      ? 'good'
      : 'info';
  addLog(advanced, `${activity.name}：${advanced.lastResult}`, tone);

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

function isEligible(
  event: EventDef,
  state: GameState,
  ctx: EventContext,
): boolean {
  if (!matchesAfter(event.after, ctx)) return false;
  if (!matchesAfterNpc(event.afterNpc, ctx)) return false;
  if (!matchesAfterIdol(event.afterIdol, ctx)) return false;
  if (!event.when.every((condition) => checkCondition(condition, state, ctx))) {
    return false;
  }
  if (event.once && state.flags[`seen:${event.id}`]) return false;
  if (!cooldownReady(event, state)) return false;
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

  return [...pool];
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

  next.rng.counter = rng.counter;
  if (picked.once) next.flags[`seen:${picked.id}`] = true;
  next.eventCooldowns[picked.id] = next.actionsTaken;
  next.pendingEventId = picked.id;
  next.pendingEventIdolId = ctx.idolId;
  next.phase = 'event';
  addLog(next, `事件：${picked.title}`, 'info');
  return { state: next, event: picked };
}

export function checkForEvent(
  state: GameState,
  ctx: EventContext = {},
): EventCheckResult {
  const context: EventContext = {
    ...ctx,
    locationId: ctx.locationId ?? state.locationId,
  };
  return checkEventCandidates(state, buildPool(context), context);
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
  return EVENTS.map((event) => {
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
  applyEffects(next, choice.effects, {
    idolId: state.pendingEventIdolId,
  });
  clampState(next);

  const advanced =
    choice.durationMinutes && choice.durationMinutes > 0
      ? advanceTime(next, choice.durationMinutes)
      : next;
  advanced.phase = 'eventResult';
  advanced.lastResult = formatIdolText(
    choice.result,
    state.pendingEventIdolId,
  );
  addLog(advanced, advanced.lastResult, 'info');
  return advanced;
}

export type ScorePart = { label: string; value: number };
export type ScoreBreakdown = { total: number; parts: ScorePart[] };

function buildTotal(parts: ScorePart[]): number {
  return Math.max(0, Math.round(parts.reduce((sum, part) => sum + part.value, 0)));
}

export function midScore(state: GameState): ScoreBreakdown {
  const idol = getActiveIdol(state);
  const performance =
    (rankIndex(idol.stats.vocal.rank) +
      rankIndex(idol.stats.dance.rank) +
      rankIndex(idol.stats.expression.rank)) /
    3;
  const parts: ScorePart[] = [
    { label: '能力均值 ×0.65', value: performance * 10 },
    { label: '信任 ×1', value: rankIndex(idol.stats.trust.rank) * 2 },
    { label: '压力余量 ×0.15', value: (100 - state.shared.stress) * 0.15 },
  ];
  return { total: buildTotal(parts), parts };
}

export function finalScore(state: GameState): ScoreBreakdown {
  const idol = getActiveIdol(state);
  const performance =
    (rankIndex(idol.stats.vocal.rank) +
      rankIndex(idol.stats.dance.rank) +
      rankIndex(idol.stats.expression.rank)) /
    3;
  const parts: ScorePart[] = [
    { label: '能力均值 ×0.75', value: performance * 10 },
    { label: '信任 ×1', value: rankIndex(idol.stats.trust.rank) * 2 },
    { label: '压力余量 ×0.05', value: (100 - state.shared.stress) * 0.05 },
  ];
  return { total: buildTotal(parts), parts };
}

function resolveMidExam(state: GameState): GameState {
  const next = clone(state);
  next.pendingExam = undefined;
  const score = midScore(next);
  next.examScore = score.total;
  next.examParts = score.parts;
  next.examPassed = score.total >= MID_EXAM.passLine;
  next.midExamDone = true;
  next.phase = 'examMid';

  if (next.examPassed) {
    next.money += 1000;
    applyIdolExp(next, 'trust', 3);
    next.flags.mid_passed = true;
    addLog(next, `中期试镜通过（${score.total} 分）。`, 'good');
  } else {
    next.shared.stress += 10;
    next.flags.failed_mid = true;
    addLog(next, `中期试镜未通过（${score.total} 分）。`, 'bad');
  }
  clampState(next);
  return next;
}

function resolveFinalExam(state: GameState): GameState {
  const next = clone(state);
  next.pendingExam = undefined;
  const score = finalScore(next);
  next.examScore = score.total;
  next.examParts = score.parts;
  next.finalExamDone = true;
  next.phase = 'examFinal';

  const ending =
    ENDINGS.find((entry) =>
      entry.when.every((condition) => checkCondition(condition, next)),
    ) ?? ENDINGS[ENDINGS.length - 1]!;
  next.endingId = ending.id;
  addLog(next, `最终 Live 得分：${score.total}。`, 'info');
  return next;
}

function beginPendingExam(state: GameState): GameState {
  const pending = state.pendingExam;
  const next = clone(state);
  next.pendingExam = undefined;

  if (pending === 'mid') return resolveMidExam(next);
  if (pending === 'final') return resolveFinalExam(next);
  return next;
}

function continueFromActivity(state: GameState): GameState {
  const activityId = state.pendingActivityId;
  const activityKind = activityId ? getActivity(activityId)?.kind : undefined;
  const next = clone(state);
  next.pendingActivityId = undefined;

  if (next.pendingExam) return beginPendingExam(next);

  const result = checkForEvent(next, {
    lastActivityId: activityId,
    lastActivityKind: activityKind,
    locationId: next.locationId,
    idolId: next.pendingIdolId,
  });
  if (result.event) return result.state;

  if (next.pendingIdolId) {
    const idolActor = getActor(next.pendingIdolId);
    if (idolActor && isActorPresent(next, idolActor)) {
      next.phase = 'idol';
      return next;
    }
    next.pendingIdolId = undefined;
  }

  next.phase = 'plan';
  return next;
}

function continueFromEvent(state: GameState): GameState {
  const next = clone(state);
  next.pendingEventId = undefined;
  next.pendingEventIdolId = undefined;
  next.pendingActivityId = undefined;
  next.pendingTopicId = undefined;

  if (next.pendingExam) return beginPendingExam(next);

  if (next.pendingIdolId) {
    const idolActor = getActor(next.pendingIdolId);
    if (idolActor && isActorPresent(next, idolActor)) {
      next.phase = 'idol';
      return next;
    }
    next.pendingIdolId = undefined;
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

  next.phase = 'npc';
  return next;
}

function continueFromExam(state: GameState): GameState {
  const next = clone(state);
  next.pendingExam = undefined;
  if (next.phase === 'examMid') {
    next.phase = 'plan';
  } else if (next.phase === 'examFinal') {
    next.phase = 'ending';
  }
  return next;
}

export function handleCommand(
  state: GameState,
  command: ActionCommand,
): GameState {
  switch (state.phase) {
    case 'plan':
      if (command.type === 'move') return moveTo(state, command.locationId);
      if (command.type === 'enterNpc') return enterNpc(state, command.actorId);
      if (command.type === 'enterIdol') return enterIdol(state, command.idolId);
      if (command.type === 'activity') return applyActivity(state, command.activityId);
      return state;

    case 'npc':
      if (command.type === 'leaveNpc') return leaveNpc(state);
      if (command.type === 'talk') {
        return talkTo(state, command.actorId, command.topicId);
      }
      return state;

    case 'idol':
      if (command.type === 'leaveIdol') return leaveIdol(state);
      if (command.type === 'train') {
        return train(state, command.idolId, command.activityId);
      }
      if (command.type === 'work') {
        return work(state, command.idolId, command.activityId);
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

    case 'examMid':
    case 'examFinal':
      return command.type === 'continue' ? continueFromExam(state) : state;

    case 'ending':
      return state;

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
      } else {
        command = { type: 'activity', activityId: actionId };
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
    case 'examMid':
    case 'examFinal':
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

    case 'ending':
      break;
  }

  return command ? handleCommand(state, command) : state;
}
