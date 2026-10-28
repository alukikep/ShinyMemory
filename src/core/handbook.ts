import { CONTENT_INDEX } from './contentIndex';
import { attributeLabel } from './labels';
import { checkCondition } from './sim';
import { formatClock, getDay, getMinuteOfDay } from './time';
import type {
  CheckContext,
  Condition,
  GameState,
  StoryChainDef,
  StoryChainStep,
} from './types';

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

function inWindow(step: StoryChainStep, minute: number): boolean {
  const window = step.timeWindow;
  if (!window) return true;
  if (window.fromMinute === window.toMinute) return true;
  return window.fromMinute < window.toMinute
    ? minute >= window.fromMinute && minute < window.toMinute
    : minute >= window.fromMinute || minute < window.toMinute;
}

function describeGaps(
  step: StoryChainStep,
  state: GameState,
  ctx: CheckContext,
): string | undefined {
  const failing = (step.when ?? []).filter(
    (condition) => !checkCondition(condition, state, ctx),
  );
  if (failing.length === 0) return undefined;
  const phrases = failing
    .map((condition) => describeCondition(condition, state, ctx))
    .filter((text): text is string => Boolean(text));
  if (phrases.length === 0) return GENERIC_REASON;
  const head = phrases.slice(0, 2).join('、');
  const rest = failing.length - Math.min(phrases.length, 2);
  return rest > 0 ? `${head} 等 ${failing.length} 项` : head;
}

function buildEntry(
  chain: StoryChainDef,
  state: GameState,
  day: number,
  minute: number,
  phaseBlocked: boolean,
): HandbookEntryView {
  const chainState = state.storyChains[chain.id];
  const stepIndex = chainState?.stepIndex ?? 0;
  const step = chain.steps[stepIndex];
  const idol = CONTENT_INDEX.idols.get(chain.idolId);
  const idolName = idol?.name ?? chain.idolId;
  const ctx: CheckContext = { idolId: chain.idolId };
  const completed = Boolean(chainState?.completed);

  let status: HandbookStatus;
  let reason: string | undefined;

  if (completed) {
    status = 'done';
  } else if (phaseBlocked) {
    status = 'blocked';
    reason = BUSY_REASON;
  } else if (
    chainState?.nextEligibleDay &&
    day < chainState.nextEligibleDay
  ) {
    status = 'waiting';
  } else {
    const gap = step ? describeGaps(step, state, ctx) : GENERIC_REASON;
    if (gap) {
      status = 'blocked';
      reason = gap;
    } else if (step && !inWindow(step, minute)) {
      status = 'off-hours';
    } else {
      status = 'available';
    }
  }

  const placeStep = step ?? chain.steps[chain.steps.length - 1];
  const locationId = placeStep?.locationId;
  const locationName = locationId
    ? (CONTENT_INDEX.locations.get(locationId)?.name ?? locationId)
    : '';

  const earliestDay = chainState?.nextEligibleDay;

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
    daysLeft:
      earliestDay === undefined ? undefined : Math.max(0, earliestDay - day),
    steps: chain.steps.map((entry, index) => ({
      label: entry.actionLabel,
      done: index < stepIndex,
      current: !completed && index === stepIndex,
    })),
  };
}

/**
 * 手册内容 = 剧情链投影。不写状态，不做副作用，
 * 所以它永远和真实进度一致。
 */
export function buildHandbook(state: GameState): HandbookView {
  const day = getDay(state.clock.absoluteMinutes);
  const minute = getMinuteOfDay(state.clock.absoluteMinutes);
  const phaseBlocked = Boolean(state.pendingDialogueId || state.flags.forced_rest);

  const active: HandbookEntryView[] = [];
  const archive: HandbookEntryView[] = [];

  for (const chain of CONTENT_INDEX.storyChains.values()) {
    const chainState = state.storyChains[chain.id];
    const revealed =
      Boolean(chainState) ||
      (chain.revealWhen?.every((condition) =>
        checkCondition(condition, state, { idolId: chain.idolId }),
      ) ??
        false);
    if (!revealed) continue;

    const entry = buildEntry(chain, state, day, minute, phaseBlocked);
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

/**
 * 把一条未满足的条件翻成人话，供手册展示。
 * 返回 undefined 表示无法翻译，调用方应回退到通用句。
 *
 * 与 checkCondition 吃同一个 Condition 对象：新增条件类型时忘了写文案，
 * 只会退化成通用句，不会显示出错误的原因。
 */
export function describeCondition(
  condition: Condition,
  state: GameState,
  ctx: CheckContext = {},
): string | undefined {
  switch (condition.kind) {
    case 'moneyAtLeast': {
      const gap = condition.value - state.money;
      if (gap <= 0) return undefined;
      return `还差 ¥${gap.toLocaleString('zh-CN')}`;
    }
    case 'hasItem': {
      const need = condition.count ?? 1;
      const gap = need - (state.inventory[condition.itemId] ?? 0);
      if (gap <= 0) return undefined;
      const name = CONTENT_INDEX.items.get(condition.itemId)?.name ?? condition.itemId;
      return `还缺 ${name} ×${gap}`;
    }
    case 'idolStatus': {
      const idolId = condition.idolId ?? ctx.idolId ?? state.selectedIdolId;
      const idol = CONTENT_INDEX.idols.get(idolId);
      const current = state.idols[idolId]?.status;
      // 泄露护栏：还没有名字的人不能被写进手记
      if (!idol || !current || current === 'unknown') return undefined;
      return condition.status === 'recruited'
        ? `得先让${idol.name}加入`
        : `还得先正式认识${idol.name}`;
    }
    case 'attributeAtLeast':
      return `${attributeLabel(condition.ref)}还得练到 ${condition.rank}`;
    case 'atLocation': {
      const name = CONTENT_INDEX.locations.get(condition.locationId)?.name;
      return name ? `得回${name}一趟` : undefined;
    }
    case 'timeWindow':
    case 'dayAtLeast':
      return '过两天再说';
    default:
      return undefined;
  }
}
