import { describeCondition } from './conditionText';
import { CONTENT_INDEX } from './contentIndex';
import { evaluateStorySteps } from './sim';
import type { StoryStepEvaluation } from './sim';
import { formatClock, getDay, getMinuteOfDay } from './time';
import type { GameState, StoryChainStep } from './types';

export { describeCondition };

export type HandbookStatus =
  | 'waiting'
  | 'blocked'
  | 'off-hours'
  | 'available'
  | 'done';

export type HandbookStepView = {
  label: string;
  done: boolean;
  current: boolean;
};

export type HandbookEntryView = {
  id: string;
  title: string;
  idolId: string;
  idolName: string;
  status: HandbookStatus;
  locationName: string;
  timeWindowText: string;
  reason?: string;
  earliestDay?: number;
  daysLeft?: number;
  /** 时段还没到，但今天之内会开：决定写"今天"还是"明天"。 */
  opensLaterToday?: boolean;
  steps: HandbookStepView[];
};

export type HandbookView = {
  active: HandbookEntryView[];
  archive: HandbookEntryView[];
};

const GENERIC_REASON = '还不到时候。';
const BUSY_REASON = '现在不行。';

const STATUS_ORDER: Record<HandbookStatus, number> = {
  available: 0,
  waiting: 1,
  'off-hours': 2,
  blocked: 3,
  done: 4,
};

function stepWindowText(step: StoryChainStep | undefined): string {
  if (!step?.timeWindow) return '全天';
  return `${formatClock(step.timeWindow.fromMinute)}–${formatClock(step.timeWindow.toMinute)}`;
}

function gapText(evaluation: StoryStepEvaluation, state: GameState): string {
  const failed =
    evaluation.blocks.find((block) => block.kind === 'conditions')?.failed ??
    [];
  const ctx = { idolId: evaluation.chain.idolId };
  const phrases = failed
    .map((condition) => describeCondition(condition, state, ctx))
    .filter((text): text is string => Boolean(text));
  if (phrases.length === 0) return GENERIC_REASON;
  const head = phrases.slice(0, 2).join('、');
  const rest = failed.length - Math.min(phrases.length, 2);
  return rest > 0 ? `${head} 等 ${failed.length} 项` : head;
}

/**
 * 展示用的顺序：忙 > 等天数 > 条件 > 时段。
 * 和 evaluateStorySteps 的判定共用同一份 blocks，不另写一套。
 */
function statusOf(
  evaluation: StoryStepEvaluation,
  state: GameState,
): { status: HandbookStatus; reason?: string } {
  const has = (kind: StoryStepEvaluation['blocks'][number]['kind']) =>
    evaluation.blocks.some((block) => block.kind === kind);

  if (has('completed')) return { status: 'done' };
  if (has('busy')) return { status: 'blocked', reason: BUSY_REASON };
  if (has('idol-busy')) {
    return { status: 'blocked', reason: '她正在经历另一段剧情' };
  }
  if (has('waiting')) return { status: 'waiting' };
  if (has('conditions')) {
    return { status: 'blocked', reason: gapText(evaluation, state) };
  }
  if (has('off-hours')) return { status: 'off-hours' };
  return { status: 'available' };
}

function buildEntry(
  evaluation: StoryStepEvaluation,
  state: GameState,
  day: number,
): HandbookEntryView {
  const { chain, step, stepIndex } = evaluation;
  const idolName =
    CONTENT_INDEX.idols.get(chain.idolId)?.name ?? chain.idolId;
  const { status, reason } = statusOf(evaluation, state);
  const placeStep = step ?? chain.steps[chain.steps.length - 1];
  const locationId = placeStep?.locationId;
  const locationName = locationId
    ? (CONTENT_INDEX.locations.get(locationId)?.name ?? locationId)
    : '';
  const earliestDay = evaluation.nextEligibleDay;
  const fromMinute = placeStep?.timeWindow?.fromMinute;
  const opensLaterToday =
    fromMinute !== undefined &&
    fromMinute > getMinuteOfDay(state.clock.absoluteMinutes);

  return {
    id: `chain:${chain.id}`,
    title: chain.title ?? `${idolName} · ${chain.steps[0]?.actionLabel ?? ''}`,
    idolId: chain.idolId,
    idolName,
    status,
    locationName,
    timeWindowText: stepWindowText(placeStep),
    reason,
    earliestDay,
    opensLaterToday,
    daysLeft:
      earliestDay === undefined ? undefined : Math.max(0, earliestDay - day),
    steps: chain.steps.map((entry, index) => ({
      label: entry.actionLabel,
      done: index < stepIndex,
      current: status !== 'done' && index === stepIndex,
    })),
  };
}

/**
 * 手册内容 = 剧情链投影。不写状态，不做副作用，
 * 所以它永远和真实进度一致。
 */
export function buildHandbook(state: GameState): HandbookView {
  const day = getDay(state.clock.absoluteMinutes);
  const active: HandbookEntryView[] = [];
  const archive: HandbookEntryView[] = [];

  for (const evaluation of evaluateStorySteps(state)) {
    if (!evaluation.revealed) continue;
    const entry = buildEntry(evaluation, state, day);
    if (entry.status === 'done') {
      archive.push(entry);
    } else {
      active.push(entry);
    }
  }

  active.sort((a, b) => {
    const order = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (order !== 0) return order;
    if (a.status === 'waiting') {
      return (a.daysLeft ?? 0) - (b.daysLeft ?? 0);
    }
    return a.title.localeCompare(b.title, 'zh-CN');
  });
  archive.sort(
    (a, b) =>
      a.idolName.localeCompare(b.idolName, 'zh-CN') ||
      a.title.localeCompare(b.title, 'zh-CN'),
  );

  return { active, archive };
}
