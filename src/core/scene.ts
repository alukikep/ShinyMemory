import { FINAL_EXAM, MID_EXAM } from './content/weeks';
import { neighborsOf } from './content/map';
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
  formatIdolText,
  getActivity,
  getActiveIdol,
  getActor,
  getEnding,
  getEvent,
  isActorPresent,
  midScore,
  presentActors,
  topicAvailability,
  workRewardSummary,
  workRiskSummary,
} from './sim';
import type {
  ActionView,
  ActorView,
  ActivityDef,
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
  idol: '互动',
  examMid: '中期考核',
  examFinal: '最终考核',
  ending: '结局',
} as const;

function sceneId(state: GameState): string {
  return `${state.phase}:${state.clock.absoluteMinutes}:${state.actionsTaken}`;
}

function idolActivityKindAt(
  state: GameState,
): 'training' | 'work' | undefined {
  const kinds = new Set(
    (CONTENT_INDEX.activitiesByLocation.get(state.locationId) ?? [])
      .filter(
        (activity) =>
          activity.kind === 'training' || activity.kind === 'work',
      )
      .map((activity) => activity.kind),
  );
  if (kinds.has('work')) return 'work';
  if (kinds.has('training')) return 'training';
  return undefined;
}

function buildHero(state: GameState) {
  const location = CONTENT_INDEX.locations.get(state.locationId);
  const presentIdols = presentActors(state).filter((actor) =>
    CONTENT_INDEX.idols.has(actor.id),
  );
  const focus =
    presentIdols.find((actor) => actor.id === state.activeIdolId) ??
    presentIdols[0];
  const idol = focus ? CONTENT_INDEX.idols.get(focus.id) : undefined;

  return {
    locationId: state.locationId,
    locationName: location?.name ?? state.locationId,
    idolId: idol?.id,
    idolName: idol?.name,
    unit: idol?.unit,
    color: idol?.color,
    portrait: idol?.portrait,
    quote: idol?.quote,
  };
}

function buildActorViews(state: GameState): ActorView[] {
  return presentActors(state).map((actor) => {
    const actorState = state.actors[actor.id];
    const isIdol = actor.role === 'idol';
    const idolMode = isIdol ? idolActivityKindAt(state) : undefined;
    return {
      id: actor.id,
      name: actor.name,
      role: actor.role,
      description: actor.description,
      color: actor.color,
      affinity: isIdol
        ? (state.idols[actor.id]?.stats.trust.rank ?? 'F')
        : (actorState?.affinity ?? 0),
      relationshipLabel: isIdol ? '信任' : '好感',
      entryLabel: isIdol
        ? idolMode === 'work'
          ? '工作'
          : idolMode === 'training'
            ? '训练'
            : '互动'
        : '交谈',
      enterCommand: isIdol
        ? { type: 'enterIdol', idolId: actor.id }
        : { type: 'enterNpc', actorId: actor.id },
    };
  });
}

const ACTIVITY_ICONS: Record<string, string> = {
  vocal: 'mic',
  dance: 'music',
  expression: 'sparkle',
  work: 'mic',
  tv_work: 'star',
  music_work: 'star',
  rest: 'coffee',
  sleep: 'moon',
  free: 'heart',
  look_around: 'compass',
};

function activityIcon(activity: ActivityDef): string {
  return (
    ACTIVITY_ICONS[activity.id] ??
    (activity.kind === 'training'
      ? 'music'
      : activity.kind === 'work'
        ? 'mic'
        : activity.kind === 'rest'
          ? 'coffee'
          : activity.kind === 'sleep'
            ? 'moon'
            : activity.kind === 'explore'
              ? 'compass'
              : 'sparkle')
  );
}

function activityActionView(
  state: GameState,
  activity: ActivityDef,
  idolId: string = state.activeIdolId,
): ActionView {
  const availability = activityAvailability(state, activity, idolId);
  const duration =
    activity.kind === 'sleep'
      ? '睡到早上 8 点'
      : formatDuration(activity.durationMinutes);
  const effects = effectSummary(activity.effects, activity.cost);
  const reward = activity.workReward
    ? workRewardSummary(state, activity.workReward, idolId)
    : '';
  const risk = activity.workRisk
    ? workRiskSummary(state, activity.workRisk, idolId)
    : '';
  const timeLabel = formatTimeWindows(activity.timeWindows);
  const hint = [timeLabel, duration, reward, risk, effects]
    .filter(Boolean)
    .join(' · ');

  return {
    id: activity.id,
    command: { type: 'activity', activityId: activity.id },
    label: activity.name,
    hint,
    icon: activityIcon(activity),
    disabled: !availability.ok,
    disabledReason: availability.ok ? undefined : availability.reason,
    tone: activity.kind,
  };
}

function buildPlan(state: GameState): SceneView {
  const location = CONTENT_INDEX.locations.get(state.locationId);
  const day = getDay(state.clock.absoluteMinutes);
  const blocks: TextBlock[] = [];
  if (location?.description) {
    blocks.push({ kind: 'p', text: location.description });
  }
  if (state.flags.forced_rest) {
    blocks.push({
      kind: 'system',
      text: '她需要休息。只能选择「休息」或「睡觉」。',
    });
  }

  const activities = (CONTENT_INDEX.activitiesByLocation.get(state.locationId) ?? [])
    .filter(
      (activity) =>
        activity.kind !== 'training' && activity.kind !== 'work',
    );
  const actors = buildActorViews(state);

  const actions: ActionView[] = activities
    .map((activity) => ({
      activity,
      availability: activityAvailability(state, activity),
    }))
    .filter(
      ({ availability }) =>
        availability.ok || availability.display === 'disable',
    )
    .map(({ activity }) => activityActionView(state, activity));

  if (actions.length === 0 && actors.length === 0) {
    blocks.push({
      kind: 'system',
      text:
        location?.kind === 'station'
          ? '车站没有可做的事。步行或乘公交前往其他地点吧。'
          : '这个时间没有可做的行动。去别的地点看看，或者回家睡觉。',
    });
  }

  const locations = neighborsOf(state.locationId).map((edge) => {
    const id = edge.from === state.locationId ? edge.to : edge.from;
    return {
      id,
      name: CONTENT_INDEX.locations.get(id)?.name ?? id,
      current: false,
      minutes: edge.minutes,
    };
  });

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: `第 ${day} 天 · ${formatClock(state.clock.absoluteMinutes)}`,
    locationName: location?.name,
    hero: buildHero(state),
    locations,
    actors,
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
      ? choice.requires.every((condition) =>
          checkCondition(condition, state, {
            idolId: state.pendingEventIdolId,
          }),
        )
      : true;
    return {
      id: `choice:${index}`,
      command: { type: 'eventChoice', index },
      label: formatIdolText(choice.label, state.pendingEventIdolId),
      hint: choice.hint
        ? formatIdolText(choice.hint, state.pendingEventIdolId)
        : undefined,
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
    blocks: [
      {
        kind: 'p',
        text: formatIdolText(event.text, state.pendingEventIdolId),
      },
    ],
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

function buildIdolPage(state: GameState): SceneView {
  const idolId = state.pendingIdolId;
  const actor = idolId ? getActor(idolId) : undefined;
  const idolDef = idolId ? CONTENT_INDEX.idols.get(idolId) : undefined;
  const idolState = idolId ? state.idols[idolId] : undefined;

  if (
    !idolId ||
    !actor ||
    actor.role !== 'idol' ||
    !isActorPresent(state, actor) ||
    !idolDef ||
    !idolState
  ) {
    return {
      id: sceneId(state),
      phase: state.phase,
      phaseLabel: PHASE_LABEL[state.phase],
      title: '互动',
      blocks: [{ kind: 'system', text: '她不在这里。' }],
      actions: [
        {
          id: 'leave_idol',
          command: { type: 'leaveIdol' },
          label: '离开',
          hint: '返回地点页面',
          tone: 'secondary',
        },
      ],
      layout: 'grid',
    };
  }

  const activities: ActionView[] = (
    CONTENT_INDEX.activitiesByLocation.get(state.locationId) ?? []
  )
    .filter(
      (activity) =>
        activity.kind === 'training' || activity.kind === 'work',
    )
    .map((activity) => ({
      activity,
      availability: activityAvailability(state, activity),
    }))
    .filter(
      ({ availability }) =>
        availability.ok || availability.display === 'disable',
    )
    .map(({ activity }) => {
      const action = activityActionView(state, activity, idolId);
      return {
        ...action,
        command:
          activity.kind === 'work'
            ? {
                type: 'work',
                idolId,
                activityId: activity.id,
              }
            : {
                type: 'train',
                idolId,
                activityId: activity.id,
              },
      };
    });
  const mode = idolActivityKindAt(state);

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: mode === 'work' ? '工作' : '训练',
    title: idolDef.name,
    subtitle: `${idolDef.unit} · ${mode === 'work' ? '工作' : '训练'}`,
    blocks: [],
    idol: {
      id: idolId,
      name: idolDef.name,
      unit: idolDef.unit,
      description: idolDef.profile,
      color: idolDef.color,
      avatar: idolDef.avatar,
      stats: idolState.stats,
    },
    actions: [
      ...activities,
      {
        id: 'leave_idol',
        command: { type: 'leaveIdol' },
        label: '离开',
        hint: '返回地点页面',
        tone: 'secondary',
      },
    ],
    layout: 'grid',
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
    text: `最终得分 ${state.examScore ?? 0} · 信任 ${
      getActiveIdol(state).stats.trust.rank
    } · 压力 ${Math.round(state.shared.stress)} / 100`,
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
    case 'idol':
      return buildIdolPage(state);
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
