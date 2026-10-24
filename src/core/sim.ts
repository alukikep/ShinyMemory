import { ACTIVITIES } from './content/activities';
import { EVENTS } from './content/events';
import { ENDINGS } from './content/endings';
import { MID_EXAM } from './content/weeks';
import { STAT_LABELS, STAT_MAX } from './labels';
import { Rng } from './rng';
import type {
  ActivityDef,
  Condition,
  Cost,
  Effect,
  EndingDef,
  EventDef,
  GameState,
  LogTone,
  StatKey,
} from './types';

const MAX_WEEKS = 12;

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
    week: state.week,
    slot: state.slot,
    text,
    tone,
  });
  state.nextLogId += 1;
  if (state.log.length > 60) state.log.length = 60;
}

export function newGame(seed: number = Date.now()): GameState {
  const state: GameState = {
    week: 1,
    slot: 0,
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
    log: [],
    phase: 'plan',
    actionsTaken: 0,
    nextLogId: 1,
    rng: { seed: seed >>> 0, counter: 0 },
    midExamDone: false,
    finalExamDone: false,
  };
  addLog(state, '第 1 周。练习室的镜子擦得很干净，她站在中间，等你开口。', 'info');
  return state;
}

export function getActivity(id: string): ActivityDef | undefined {
  return ACTIVITIES.find((activity) => activity.id === id);
}

export function getEvent(id: string): EventDef | undefined {
  return EVENTS.find((event) => event.id === id);
}

export function getEnding(id: string): EndingDef | undefined {
  return ENDINGS.find((ending) => ending.id === id);
}

export function checkCondition(condition: Condition, state: GameState): boolean {
  switch (condition.kind) {
    case 'weekAtLeast':
      return state.week >= condition.week;
    case 'statAtLeast':
      return state.stats[condition.stat] >= condition.value;
    case 'statAtMost':
      return state.stats[condition.stat] <= condition.value;
    case 'moneyAtMost':
      return state.money <= condition.value;
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
  if (state.flags.forced_rest && activity.kind !== 'rest') {
    return { ok: false, reason: '她需要休息' };
  }
  if (activity.cost.money && state.money < activity.cost.money) {
    return { ok: false, reason: '金钱不足' };
  }
  if (activity.cost.stamina && state.stats.stamina < activity.cost.stamina) {
    return { ok: false, reason: '体力不足' };
  }
  if (activity.requires && !activity.requires.every((c) => checkCondition(c, state))) {
    return { ok: false, reason: '条件未满足' };
  }
  return { ok: true };
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
  next.lastResult = pickActivityResult(next, activity, rng);
  next.rng.counter = rng.counter;

  const tone: LogTone =
    activity.kind === 'rest' || activity.kind === 'bond' ? 'good' : 'info';
  addLog(next, `${activity.name}：${next.lastResult}`, tone);

  return next;
}

function checkForEvent(state: GameState): GameState | null {
  const candidates = EVENTS.filter(
    (event) =>
      event.when.every((condition) => checkCondition(condition, state)) &&
      !(event.once && state.flags[`seen:${event.id}`]),
  );
  if (candidates.length === 0) return null;

  const next = clone(state);
  const rng = new Rng(next.rng.seed, next.rng.counter);
  const totalWeight = candidates.reduce(
    (sum, event) => sum + (event.weight ?? 1),
    0,
  );
  let roll = rng.next() * totalWeight;
  let picked = candidates[candidates.length - 1]!;
  for (const event of candidates) {
    roll -= event.weight ?? 1;
    if (roll <= 0) {
      picked = event;
      break;
    }
  }

  if (picked.once) next.flags[`seen:${picked.id}`] = true;
  next.pendingEventId = picked.id;
  next.phase = 'event';
  next.rng.counter = rng.counter;
  addLog(next, `事件：${picked.title}`, 'info');
  return next;
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

function addWeeklyReport(state: GameState): void {
  const { vocal, dance, expression, stress } = state.stats;
  addLog(
    state,
    `第 ${state.week} 周：歌唱 ${Math.round(vocal)} / 舞蹈 ${Math.round(dance)} / 表现 ${Math.round(expression)}；压力 ${Math.round(stress)}。`,
    'info',
  );
}

export function advanceSlot(state: GameState): GameState {
  const next = clone(state);
  next.pendingActivityId = undefined;
  next.pendingEventId = undefined;

  if (next.slot === 0) {
    next.slot = 1;
    next.phase = 'plan';
    return next;
  }

  if (next.week === MAX_WEEKS) {
    return resolveFinalExam(next);
  }

  next.slot = 0;
  next.week += 1;

  if (next.week === 6 && !next.midExamDone) {
    return resolveMidExam(next);
  }

  next.phase = 'plan';
  addWeeklyReport(next);
  return next;
}

function continueFromActivity(state: GameState): GameState {
  const next = clone(state);
  next.pendingActivityId = undefined;
  const eventState = checkForEvent(next);
  if (eventState) return eventState;
  return advanceSlot(next);
}

function continueFromEvent(state: GameState): GameState {
  const next = clone(state);
  next.pendingEventId = undefined;
  next.pendingActivityId = undefined;
  return advanceSlot(next);
}

function continueFromExam(state: GameState): GameState {
  const next = clone(state);
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
