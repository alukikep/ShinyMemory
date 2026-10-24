import { TOTAL_ACTIONS } from './config';
import { LOCATIONS } from './content';
import { CONTENT_INDEX } from './contentIndex';
import { FINAL_EXAM, MID_EXAM, WEEK_FLAVOR } from './content/weeks';
import {
  activityAvailability,
  checkCondition,
  effectSummary,
  finalScore,
  getActivity,
  getEnding,
  getEvent,
  midScore,
} from './sim';
import type {
  ActionView,
  GameState,
  SceneView,
  TextBlock,
} from './types';

const SLOT_LABEL = ['平日', '周末'] as const;

const PHASE_LABEL = {
  plan: '本周安排',
  activityResult: '行动结果',
  event: '事件',
  eventResult: '事件结果',
  examMid: '中期考核',
  examFinal: '最终考核',
  ending: '结局',
} as const;

function sceneId(state: GameState): string {
  return `${state.phase}:${state.week}:${state.slot}:${state.actionsTaken}`;
}

function buildPlan(state: GameState): SceneView {
  const location = CONTENT_INDEX.locations.get(state.locationId);
  const blocks: TextBlock[] = [];
  if (location?.description) {
    blocks.push({ kind: 'p', text: location.description });
  }
  blocks.push({
    kind: 'system',
    text: WEEK_FLAVOR[state.week - 1] ?? '新的一周。',
  });
  if (state.flags.forced_rest) {
    blocks.push({
      kind: 'system',
      text: '她需要休息。这一次只能选择「休息」。',
    });
  }

  const activities = CONTENT_INDEX.activitiesByLocation.get(state.locationId) ?? [];
  const actions: ActionView[] = activities.map((activity) => {
    const availability = activityAvailability(state, activity);
    return {
      id: activity.id,
      label: activity.name,
      hint: effectSummary(activity.effects, activity.cost),
      disabled: !availability.ok,
      disabledReason: availability.reason,
      tone: activity.kind,
    };
  });

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: `第 ${state.week} 周 · ${SLOT_LABEL[state.slot]}`,
    subtitle: `第 ${state.actionsTaken + 1} 次行动 / ${TOTAL_ACTIONS}`,
    locationName: location?.name,
    locations: LOCATIONS.map((item) => ({
      id: item.id,
      name: item.name,
      current: item.id === state.locationId,
    })),
    blocks,
    actions,
    layout: 'grid',
  };
}

function buildActivityResult(state: GameState): SceneView {
  const activity = state.pendingActivityId
    ? getActivity(state.pendingActivityId)
    : undefined;
  const blocks: TextBlock[] = [];
  if (state.lastResult) blocks.push({ kind: 'p', text: state.lastResult });
  if (activity) {
    blocks.push({
      kind: 'system',
      text: effectSummary(activity.effects, activity.cost),
    });
  }
  if (state.flags.forced_rest) {
    blocks.push({
      kind: 'system',
      text: '她需要休息。下一次只能选择「休息」。',
    });
  }

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: activity?.name ?? '结果',
    blocks,
    actions: [{ id: 'continue', label: '继续', tone: 'primary' }],
    layout: 'list',
  };
}

function buildEvent(state: GameState): SceneView {
  const event = state.pendingEventId ? getEvent(state.pendingEventId) : undefined;
  if (!event) {
    return {
      id: sceneId(state),
      phase: state.phase,
      phaseLabel: PHASE_LABEL[state.phase],
      title: '事件',
      blocks: [{ kind: 'system', text: '事件数据缺失。' }],
      actions: [{ id: 'continue', label: '继续', tone: 'primary' }],
      layout: 'list',
    };
  }

  const actions: ActionView[] = event.choices.map((choice, index) => {
    const allowed = choice.requires
      ? choice.requires.every((condition) => checkCondition(condition, state))
      : true;
    return {
      id: `choice:${index}`,
      label: choice.label,
      hint: choice.hint,
      disabled: !allowed,
      disabledReason: allowed ? undefined : '条件未满足',
      tone: index === 0 ? 'primary' : 'secondary',
    };
  });

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: event.title,
    blocks: [{ kind: 'p', text: event.text }],
    actions,
    layout: 'list',
  };
}

function buildEventResult(state: GameState): SceneView {
  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: '结果',
    blocks: state.lastResult
      ? [{ kind: 'p', text: state.lastResult }]
      : [{ kind: 'system', text: '……' }],
    actions: [{ id: 'continue', label: '继续', tone: 'primary' }],
    layout: 'list',
  };
}

function buildExam(state: GameState, kind: 'mid' | 'final'): SceneView {
  const exam = kind === 'mid' ? MID_EXAM : FINAL_EXAM;
  const computed = kind === 'mid' ? midScore(state) : finalScore(state);
  const parts = state.examParts ?? computed.parts;
  const total = state.examScore ?? computed.total;
  const breakdown = parts
    .map((part) => `${part.label} ${part.value.toFixed(1)}`)
    .join(' · ');

  const blocks: TextBlock[] = [
    { kind: 'p', text: exam.text },
    { kind: 'system', text: breakdown },
    { kind: 'system', text: `合计：${total} 分` },
  ];

  if (kind === 'mid') {
    blocks.push({
      kind: 'system',
      text: state.examPassed
        ? `通过线 ${MID_EXAM.passLine} 分。她通过了。`
        : `通过线 ${MID_EXAM.passLine} 分。她没有通过。`,
    });
  }

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: exam.title,
    blocks,
    actions: [
      {
        id: 'continue',
        label: kind === 'final' ? '查看结局' : '继续',
        tone: 'primary',
      },
    ],
    layout: 'list',
  };
}

function buildEnding(state: GameState): SceneView {
  const ending = (state.endingId ? getEnding(state.endingId) : undefined) ?? {
    id: 'end.unknown',
    title: '结局',
    when: [],
    text: '……',
    accent: 'normal' as const,
  };
  const blocks: TextBlock[] = ending.text
    .split('\n\n')
    .filter(Boolean)
    .map((text) => ({ kind: 'p' as const, text }));
  blocks.push({
    kind: 'system',
    text: `最终得分 ${state.examScore ?? 0} · 信任 ${Math.round(state.stats.trust)} / 20 · 压力 ${Math.round(state.stats.stress)} / 100`,
  });

  const endLabel =
    ending.accent === 'true'
      ? 'TRUE END'
      : ending.accent === 'bad'
        ? 'BAD END'
        : 'NORMAL END';

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: ending.title,
    subtitle: endLabel,
    blocks,
    actions: [{ id: 'restart', label: '再玩一次', tone: 'primary' }],
    layout: 'list',
  };
}

export function buildScene(state: GameState): SceneView {
  switch (state.phase) {
    case 'plan':
      return buildPlan(state);
    case 'activityResult':
      return buildActivityResult(state);
    case 'event':
      return buildEvent(state);
    case 'eventResult':
      return buildEventResult(state);
    case 'examMid':
      return buildExam(state, 'mid');
    case 'examFinal':
      return buildExam(state, 'final');
    case 'ending':
      return buildEnding(state);
    default:
      return buildPlan(state);
  }
}
