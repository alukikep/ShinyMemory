import { DAY_FLAVOR, FINAL_EXAM, MID_EXAM } from './content/weeks';
import { LOCATIONS } from './content';
import { CONTENT_INDEX } from './contentIndex';
import {
  formatClock,
  formatDuration,
  formatTimeWindows,
  getDay,
} from './time';
import {
  activityAvailability,
  checkCondition,
  effectSummary,
  finalScore,
  getActivity,
  getActiveIdol,
  getActor,
  getEnding,
  getEvent,
  isLocationOpen,
  midScore,
  presentActors,
  topicAvailability,
} from './sim';
import type {
  ActionView,
  ActorView,
  GameState,
  SceneView,
  TextBlock,
} from './types';

const PHASE_LABEL = {
  plan: '当前安排',
  activityResult: '行动结果',
  event: '事件',
  eventResult: '事件结果',
  npc: '交谈',
  npcResult: '对话',
  examMid: '中期考核',
  examFinal: '最终考核',
  ending: '结局',
} as const;

function sceneId(state: GameState): string {
  return `${state.phase}:${state.clock.absoluteMinutes}:${state.actionsTaken}`;
}

function buildActorViews(state: GameState): ActorView[] {
  return presentActors(state).map((actor) => {
    const actorState = state.actors[actor.id];
    return {
      id: actor.id,
      name: actor.name,
      role: actor.role,
      description: actor.description,
      color: actor.color,
      affinity: actorState?.affinity ?? 0,
      enterCommand: { type: 'enterNpc', actorId: actor.id },
    };
  });
}

function buildPlan(state: GameState): SceneView {
  const location = CONTENT_INDEX.locations.get(state.locationId);
  const day = getDay(state.clock.absoluteMinutes);
  const blocks: TextBlock[] = [];
  if (location?.description) {
    blocks.push({ kind: 'p', text: location.description });
  }
  blocks.push({
    kind: 'system',
    text: DAY_FLAVOR[day - 1] ?? '新的一天。',
  });
  if (state.flags.forced_rest) {
    blocks.push({
      kind: 'system',
      text: '她需要休息。只能选择「休息」或「睡觉」。',
    });
  }

  const activities = CONTENT_INDEX.activitiesByLocation.get(state.locationId) ?? [];
  const locationOpen = isLocationOpen(state, state.locationId);
  if (!locationOpen) {
    blocks.push({
      kind: 'system',
      text: '这里已经关门了，先回家吧。',
    });
  }

  const actions: ActionView[] = activities
    .map((activity) => {
      const availability = activityAvailability(state, activity);
      const duration =
        activity.kind === 'sleep'
          ? '睡到早上 8 点'
          : formatDuration(activity.durationMinutes);
      const effects = effectSummary(activity.effects, activity.cost);
      const timeLabel = formatTimeWindows(activity.timeWindows);
      const hint = [timeLabel, duration, effects].filter(Boolean).join(' · ');
      return { activity, availability, hint };
    })
    .filter(
      ({ availability }) =>
        availability.ok || availability.display === 'disable',
    )
    .map(({ activity, availability, hint }) => ({
      id: activity.id,
      command: { type: 'activity', activityId: activity.id },
      label: activity.name,
      hint,
      disabled: !availability.ok,
      disabledReason: availability.ok ? undefined : availability.reason,
      tone: activity.kind,
    }));

  if (actions.length === 0 && locationOpen) {
    blocks.push({
      kind: 'system',
      text: '这个时间没有可做的行动。去别的地点看看，或者回家睡觉。',
    });
  }

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: `第 ${day} 天 · ${formatClock(state.clock.absoluteMinutes)}`,
    subtitle: `已行动 ${state.actionsTaken} 次`,
    locationName: location?.name,
    locations: LOCATIONS.map((item) => ({
      id: item.id,
      name: item.name,
      current: item.id === state.locationId,
      open: isLocationOpen(state, item.id),
    })),
    actors: buildActorViews(state),
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
    if (activity.kind === 'sleep') {
      blocks.push({
        kind: 'system',
        text: `现在是 ${formatClock(state.clock.absoluteMinutes)}。`,
      });
    } else {
      blocks.push({
        kind: 'system',
        text: `${formatDuration(activity.durationMinutes)}后，现在是 ${formatClock(
          state.clock.absoluteMinutes,
        )}。`,
      });
    }
    const effects = effectSummary(activity.effects, activity.cost);
    if (effects) {
      blocks.push({ kind: 'system', text: effects });
    }
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
    actions: [{ id: 'continue', command: { type: 'continue' }, label: '继续', tone: 'primary' }],
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
      actions: [{ id: 'continue', command: { type: 'continue' }, label: '继续', tone: 'primary' }],
      layout: 'list',
    };
  }

  const actions: ActionView[] = event.choices.map((choice, index) => {
    const allowed = choice.requires
      ? choice.requires.every((condition) => checkCondition(condition, state))
      : true;
    return {
      id: `choice:${index}`,
      command: { type: 'eventChoice', index },
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
    actions: [{ id: 'continue', command: { type: 'continue' }, label: '继续', tone: 'primary' }],
    layout: 'list',
  };
}

const ACTOR_ROLE_LABEL: Record<ActorView['role'], string> = {
  staff: '事务员',
  president: '社长',
  idol: '偶像',
  rival: '对手',
};

function buildNpcPage(state: GameState): SceneView {
  const actor = state.pendingActorId ? getActor(state.pendingActorId) : undefined;
  if (!actor) {
    return {
      id: sceneId(state),
      phase: state.phase,
      phaseLabel: PHASE_LABEL[state.phase],
      title: '对话',
      blocks: [{ kind: 'system', text: '她不在这里。' }],
      actions: [
        {
          id: 'leave_npc',
          command: { type: 'leaveNpc' },
          label: '离开',
          hint: '返回地点页面',
          tone: 'secondary',
        },
      ],
      layout: 'grid',
    };
  }

  const actorState = state.actors[actor.id];
  const affinity = actorState?.affinity ?? 0;
  const topics: ActionView[] = actor.topics.map((topic) => {
    const availability = topicAvailability(state, actor, topic);
    return {
      id: `talk:${actor.id}:${topic.id}`,
      command: { type: 'talk', actorId: actor.id, topicId: topic.id },
      label: topic.label,
      hint: topic.hint,
      disabled: !availability.ok,
      disabledReason: availability.ok ? undefined : availability.reason,
      tone: 'bond',
    };
  });

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: actor.name,
    subtitle: `${ACTOR_ROLE_LABEL[actor.role]} · 好感 ${affinity} / 20`,
    blocks: [],
    npc: {
      id: actor.id,
      name: actor.name,
      role: actor.role,
      description: actor.description,
      color: actor.color,
      affinity,
    },
    actions: [
      ...topics,
      {
        id: 'leave_npc',
        command: { type: 'leaveNpc' },
        label: '离开',
        hint: '返回地点页面',
        tone: 'secondary',
      },
    ],
    layout: 'grid',
  };
}

function buildNpcResult(state: GameState): SceneView {
  const actor = state.pendingActorId ? getActor(state.pendingActorId) : undefined;

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: actor?.name ?? '对话',
    blocks: state.lastResult
      ? [{ kind: 'p', text: state.lastResult }]
      : [{ kind: 'system', text: '……' }],
    actions: [{ id: 'continue', command: { type: 'continue' }, label: '继续', tone: 'primary' }],
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
        command: { type: 'continue' },
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
    text: `最终得分 ${state.examScore ?? 0} · 信任 ${Math.round(
      getActiveIdol(state).stats.trust,
    )} / 20 · 压力 ${Math.round(state.shared.stress)} / 100`,
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
    actions: [
      {
        id: 'restart',
        command: { type: 'restart' },
        label: '再玩一次',
        tone: 'primary',
      },
    ],
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
    case 'npc':
      return buildNpcPage(state);
    case 'npcResult':
      return buildNpcResult(state);
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
