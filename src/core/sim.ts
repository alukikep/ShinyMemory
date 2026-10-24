import {
  FINAL_EXAM_DAY,
  FINAL_EXAM_MINUTE,
  MID_EXAM_DAY,
  MID_EXAM_MINUTE,
  MINUTES_PER_DAY,
  MOVE_MINUTES,
  SLEEP_UNTIL_MINUTE,
  START_MINUTE,
} from './config';
import { EVENTS, ENDINGS } from './content';
import { CONTENT_INDEX } from './contentIndex';
import { MID_EXAM } from './content/weeks';
import { STAT_LABELS, STAT_MAX } from './labels';
import { Rng } from './rng';
import { getDay, getMinuteOfDay, isMinuteInWindow } from './time';
import type {
  ActivityDef,
  Condition,
  Cost,
  Effect,
  EndingDef,
  EventContext,
  EventDef,
  GameState,
  LogTone,
  StatKey,
  TriggerReport,
} from './types';

function clone(state: GameState): GameState {
  return structuredClone(state);
}

function clampState(state: GameState): void {
  for (const key of Object.keys(state.stats) as StatKey[]) {
    state.stats[key] = Math.max(0, Math.min(STAT_MAX[key], state.stats[key]));
  }
  state.money = Math.max(0, state.money);
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
    stats: {
      vocal: 20,
      dance: 20,
      expression: 20,
      stamina: 100,
      stress: 0,
      trust: 5,
    },
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

export function checkCondition(condition: Condition, state: GameState): boolean {
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
    case 'statAtLeast':
      return state.stats[condition.stat] >= condition.value;
    case 'statAtMost':
      return state.stats[condition.stat] <= condition.value;
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
      return condition.of.every((child) => checkCondition(child, state));
    case 'any':
      return condition.of.some((child) => checkCondition(child, state));
    case 'not':
      return !checkCondition(condition.of, state);
    default:
      return false;
  }
}

function applyEffects(
  state: GameState,
  effects: Effect[],
  options?: { training?: boolean; stressed?: boolean },
): void {
  for (const effect of effects) {
    switch (effect.kind) {
      case 'stat': {
        let delta = effect.delta;
        const isPerformanceStat =
          effect.stat === 'vocal' ||
          effect.stat === 'dance' ||
          effect.stat === 'expression';
        if (options?.training && options.stressed && isPerformanceStat && delta > 0) {
          delta = Math.max(1, Math.floor(delta / 2));
        }
        state.stats[effect.stat] += delta;
        break;
      }
      case 'money':
        state.money += effect.delta;
        break;
      case 'flag':
        state.flags[effect.key] = effect.value;
        break;
      case 'log':
        addLog(state, effect.text, effect.tone ?? 'info');
        break;
    }
  }
}

export function effectSummary(effects: Effect[], cost?: Cost): string {
  const stats: Partial<Record<StatKey, number>> = {
    stamina: -(cost?.stamina ?? 0),
  };
  let money = -(cost?.money ?? 0);

  for (const effect of effects) {
    if (effect.kind === 'stat') {
      stats[effect.stat] = (stats[effect.stat] ?? 0) + effect.delta;
    } else if (effect.kind === 'money') {
      money += effect.delta;
    }
  }

  const parts: string[] = [];
  if (money !== 0) {
    parts.push(`金钱 ${money > 0 ? '+' : ''}${money}`);
  }
  const order: StatKey[] = [
    'vocal',
    'dance',
    'expression',
    'stamina',
    'stress',
    'trust',
  ];
  for (const stat of order) {
    const delta = stats[stat] ?? 0;
    if (delta !== 0) {
      parts.push(`${STAT_LABELS[stat]} ${delta > 0 ? '+' : ''}${delta}`);
    }
  }
  return parts.join(' · ');
}

export function activityAvailability(
  state: GameState,
  activity: ActivityDef,
): { ok: boolean; reason?: string } {
  if (
    state.flags.forced_rest &&
    activity.kind !== 'rest' &&
    activity.kind !== 'sleep'
  ) {
    return { ok: false, reason: '她需要休息' };
  }
  if (activity.locations && !activity.locations.includes(state.locationId)) {
    return { ok: false, reason: '不在此地点' };
  }
  if (
    activity.timeWindows &&
    !activity.timeWindows.some((window) =>
      isMinuteInWindow(state.clock.absoluteMinutes, window),
    )
  ) {
    return {
      ok: false,
      reason: activity.kind === 'sleep' ? '现在还不能睡' : '现在不能做',
    };
  }
  if (activity.cost.money && state.money < activity.cost.money) {
    return { ok: false, reason: '金钱不足' };
  }
  if (activity.cost.stamina && state.stats.stamina < activity.cost.stamina) {
    return { ok: false, reason: '体力不足' };
  }
  if (activity.requires && !activity.requires.every((c) => checkCondition(c, state))) {
    return {
      ok: false,
      reason: activity.kind === 'sleep' ? '现在还不想睡' : '条件未满足',
    };
  }
  return { ok: true };
}

export function moveTo(state: GameState, locationId: string): GameState {
  if (state.phase !== 'plan') return state;
  const location = CONTENT_INDEX.locations.get(locationId);
  if (!location || state.locationId === locationId) return state;

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

const MID_EXAM_AT =
  (MID_EXAM_DAY - 1) * MINUTES_PER_DAY + MID_EXAM_MINUTE;
const FINAL_EXAM_AT =
  (FINAL_EXAM_DAY - 1) * MINUTES_PER_DAY + FINAL_EXAM_MINUTE;

export function advanceTime(state: GameState, minutes: number): GameState {
  const next = clone(state);
  const from = next.clock.absoluteMinutes;
  const to = from + Math.max(0, minutes);
  next.clock.absoluteMinutes = to;

  if (!next.midExamDone && from <= MID_EXAM_AT && to >= MID_EXAM_AT) {
    next.pendingExam = 'mid';
  }
  if (!next.finalExamDone && from <= FINAL_EXAM_AT && to >= FINAL_EXAM_AT) {
    next.pendingExam = 'final';
  }

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

export function applyActivity(state: GameState, activityId: string): GameState {
  const activity = getActivity(activityId);
  if (!activity) return state;
  if (!activityAvailability(state, activity).ok) return state;

  const next = clone(state);
  const rng = new Rng(next.rng.seed, next.rng.counter);
  const stressed = next.stats.stress >= 70;

  if (activity.kind === 'sleep') {
    const current = next.clock.absoluteMinutes;
    const dayStart = Math.floor(current / MINUTES_PER_DAY) * MINUTES_PER_DAY;
    let target = dayStart + SLEEP_UNTIL_MINUTE;
    if (target <= current) target += MINUTES_PER_DAY;

    const minutes = target - current;
    const hours = minutes / 60;
    const staminaGain = Math.min(
      STAT_MAX.stamina - next.stats.stamina,
      Math.round(hours * 10),
    );

    next.stats.stamina += staminaGain;
    next.stats.stress = Math.max(
      0,
      next.stats.stress - Math.round(hours * 2),
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
  next.stats.stamina -= activity.cost.stamina ?? 0;
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
  if (!event.when.every((condition) => checkCondition(condition, state))) {
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

export function getTriggerReport(
  state: GameState,
  ctx: EventContext = {},
): TriggerReport[] {
  return EVENTS.map((event) => {
    if (!matchesAfter(event.after, ctx)) {
      return { eventId: event.id, eligible: false, reason: 'after' };
    }
    if (!event.when.every((condition) => checkCondition(condition, state))) {
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
  if (choice.requires && !choice.requires.every((c) => checkCondition(c, state))) {
    return state;
  }

  const next = clone(state);
  applyEffects(next, choice.effects);
  clampState(next);
  next.phase = 'eventResult';
  next.lastResult = choice.result;
  addLog(next, choice.result, 'info');
  return next;
}

export type ScorePart = { label: string; value: number };
export type ScoreBreakdown = { total: number; parts: ScorePart[] };

function buildTotal(parts: ScorePart[]): number {
  return Math.max(0, Math.round(parts.reduce((sum, part) => sum + part.value, 0)));
}

export function midScore(state: GameState): ScoreBreakdown {
  const performance =
    (state.stats.vocal + state.stats.dance + state.stats.expression) / 3;
  const parts: ScorePart[] = [
    { label: '能力均值 ×0.65', value: performance * 0.65 },
    { label: '信任 ×1', value: state.stats.trust },
    { label: '压力余量 ×0.15', value: (100 - state.stats.stress) * 0.15 },
  ];
  return { total: buildTotal(parts), parts };
}

export function finalScore(state: GameState): ScoreBreakdown {
  const performance =
    (state.stats.vocal + state.stats.dance + state.stats.expression) / 3;
  const parts: ScorePart[] = [
    { label: '能力均值 ×0.75', value: performance * 0.75 },
    { label: '信任 ×1', value: state.stats.trust },
    { label: '压力余量 ×0.05', value: (100 - state.stats.stress) * 0.05 },
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
    next.stats.trust += 2;
    next.flags.mid_passed = true;
    addLog(next, `中期试镜通过（${score.total} 分）。`, 'good');
  } else {
    next.stats.stress += 10;
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
  });
  if (result.event) return result.state;

  next.phase = 'plan';
  return next;
}

function continueFromEvent(state: GameState): GameState {
  const next = clone(state);
  next.pendingEventId = undefined;
  next.pendingActivityId = undefined;

  if (next.pendingExam) return beginPendingExam(next);

  next.phase = 'plan';
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

export function handleAction(state: GameState, actionId: string): GameState {
  switch (state.phase) {
    case 'plan':
      if (actionId.startsWith('move:')) {
        return moveTo(state, actionId.slice('move:'.length));
      }
      return applyActivity(state, actionId);
    case 'activityResult':
      return actionId === 'continue' ? continueFromActivity(state) : state;
    case 'event': {
      if (!actionId.startsWith('choice:')) return state;
      const index = Number(actionId.slice('choice:'.length));
      return applyEventChoice(state, index);
    }
    case 'eventResult':
      return actionId === 'continue' ? continueFromEvent(state) : state;
    case 'examMid':
    case 'examFinal':
      return actionId === 'continue' ? continueFromExam(state) : state;
    case 'ending':
      return state;
    default:
      return state;
  }
}
