import { neighborsOf } from './content/map';
import { CONTENT_INDEX } from './contentIndex';
import {
  formatCalendarDateFromDay,
  formatClock,
  formatCalendarDate,
  formatDuration,
  formatTimeWindows,
  getDay,
  getMinuteOfDay,
} from './time';
import { canReplaceDay } from './schedule';
import { attributeLabel, STAT_ABBR } from './labels';
import { describeCondition } from './conditionText';
import {
  activityAvailability,
  activityCheckChance,
  activityCheckLabel,
  jobCheckChance,
  activityCost,
  activityDuration,
  activeJobFor,
  checkCondition,
  effectSummary,
  formatCastText,
  formatIdolText,
  getActivity,
  getActor,
  getFocusIdolId,
  getEligibleStories,
  getEvent,
  isActorPresent,
  isIdolRecruited,
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
  JobBoardEntry,
  JobBoardOffer,
  JobBoardView,
  JobDef,
  SceneView,
  StatKey,
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
    presentIdols.find((actor) => actor.id === state.selectedIdolId) ??
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
  idolId?: string,
): ActionView {
  const availability = activityAvailability(state, activity, idolId);
  const duration =
    activity.kind === 'sleep'
      ? '睡到早上 8 点'
      : formatDuration(activityDuration(state, activity));
  const effects =
    activity.target === 'all-present-idols'
      ? [
          effectSummary([], activityCost(state, activity)),
          effectSummary(activity.effects)
            ? `每人：${effectSummary(activity.effects)}`
            : '',
        ]
          .filter(Boolean)
          .join(' · ')
      : effectSummary(activity.effects, activityCost(state, activity));
  const reward =
    activity.workReward && idolId
      ? workRewardSummary(state, activity.workReward, idolId)
      : '';
  const risk =
    activity.workRisk && idolId
      ? workRiskSummary(state, activity.workRisk, activity.workReward, idolId)
      : '';
  const timeLabel = formatTimeWindows(activity.timeWindows);
  const checkChance = activityCheckChance(state, activity, idolId);
  const checkLabel =
    checkChance === undefined
      ? ''
      : `检定：${activityCheckLabel(checkChance)}`;
  const hint = [timeLabel, duration, checkLabel, reward, risk, effects]
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

/** 某个偶像接这份工作最早能被排进哪一天。 */
function jobOfferFor(
  state: GameState,
  job: JobDef,
  idolId: string,
): { day: number; chance?: number } | undefined {
  const actor = CONTENT_INDEX.actors.get(idolId);
  if (!actor || actor.role !== 'idol') return undefined;
  if (!isIdolRecruited(state, idolId)) return undefined;
  if (
    state.jobs.some(
      (entry) => entry.jobId === job.id && entry.idolId === actor.id,
    )
  ) {
    return undefined;
  }

  const overrides = state.actors[actor.id]?.scheduleOverrides;
  const startDay = getDay(state.clock.absoluteMinutes) + 1;
  for (let offset = 0; offset < 7; offset += 1) {
    const day = startDay + offset;
    if (!canReplaceDay(actor, day, overrides).ok) continue;
    return { day, chance: jobCheckChance(state, job, idolId) };
  }
  return undefined;
}

/**
 * 工作面板：列出所有工作、解锁状态，以及"谁能去、哪天、成功率多少"。
 * 地点页只留一个入口，不再把每份工作铺成按钮。
 */
export function buildJobBoard(state: GameState): JobBoardView {
  const focusIdolId = getFocusIdolId(state);
  const idols = [...CONTENT_INDEX.idols.values()].filter(
    (idol) => state.idols[idol.id]?.status === 'recruited',
  );

  const entries: JobBoardEntry[] = [...CONTENT_INDEX.jobs.values()].map((job) => {
    const lockedReason = (job.requires ?? [])
      .map((condition) =>
        describeCondition(condition, state, { idolId: focusIdolId }),
      )
      .filter(Boolean)
      .join('；');

    // 一份工作同时只能派一个人；完成后按 cooldownDays 冷却。
    const assigned = state.jobs?.some((entry) => entry.jobId === job.id);
    const cooldownUntil =
      (state.jobCooldowns?.[job.id] ?? 0) + (job.cooldownDays ?? 0);
    const coolingDays =
      cooldownUntil - getDay(state.clock.absoluteMinutes);
    const busyReason = assigned
      ? '已派出'
      : coolingDays > 0
        ? `冷却中，还有 ${coolingDays} 天`
        : undefined;

    const offers: JobBoardOffer[] = (busyReason ? [] : idols).map((idol) => {
      const offer = jobOfferFor(state, job, idol.id);
      const chance = jobCheckChance(state, job, idol.id);
      const checkLabel =
        job.check && chance !== undefined
          ? `需要${attributeLabel(job.check.ref)} ${job.check.difficulty}（${activityCheckLabel(chance)}）`
          : '';
      return {
        idolId: idol.id,
        idolName: CONTENT_INDEX.idols.get(idol.id)?.name ?? idol.id,
        day: offer?.day ?? 0,
        dayLabel: offer
          ? `${formatCalendarDateFromDay(offer.day, false)} · ${formatClock(job.fromMinute)}–${formatClock(job.toMinute)}`
          : '未来七天没有可改期的空档',
        chance,
        checkLabel,
        command: offer
          ? { type: 'acceptJob', jobId: job.id, day: offer.day, idolId: idol.id }
          : undefined,
      };
    });

    return {
      jobId: job.id,
      name: job.name,
      description: job.description,
      locationName: CONTENT_INDEX.locations.get(job.locationId)?.name ?? job.locationId,
      timeLabel: `${formatClock(job.fromMinute)}–${formatClock(job.toMinute)}`,
      pay: job.pay,
      checkText: job.check
        ? `需要${attributeLabel(job.check.ref)} ${job.check.difficulty}`
        : undefined,
      // 内容里的 ref 常写成字符串（'expression'），按偶像属性处理。
      checkStat: (() => {
        if (!job.check) return undefined;
        const ref = job.check.ref;
        if (typeof ref === 'string') {
          return ref in STAT_ABBR ? (ref as StatKey) : undefined;
        }
        return ref.scope === 'idol' ? ref.key : undefined;
      })(),
      lockedReason: lockedReason || undefined,
      offers,
    };
  });

  return { entries, focusIdolId };
}

function buildJobActions(state: GameState): ActionView[] {
  if (state.locationId !== 'office') return [];
  const minute = getMinuteOfDay(state.clock.absoluteMinutes);
  if (minute < 8 * 60 || minute >= 20 * 60) return [];
  const jobs = [...CONTENT_INDEX.jobs.values()];
  if (jobs.length === 0) return [];

  const board = buildJobBoard(state);
  const openCount = board.entries.filter(
    (entry) => !entry.lockedReason && !entry.busyReason,
  ).length;

  return [
    {
      id: 'job-board',
      command: { type: 'openJobBoard' },
      label: '查看可以接的工作',
      hint: openCount > 0 ? `${openCount} 份在招` : '暂时没有可接的工作',
      icon: 'calendar',
      tone: 'work',
      disabled: openCount === 0,
      disabledReason: openCount === 0 ? '暂时没有可接的工作' : undefined,
    },
  ];
}

function buildJobOpportunity(state: GameState): ActionView | undefined {
  const assignment = activeJobFor(state);
  if (!assignment) return undefined;
  const job = CONTENT_INDEX.jobs.get(assignment.jobId);
  if (!job) return undefined;

  return {
    id: `attend-job:${assignment.id}`,
    command: { type: 'attendJob', jobId: assignment.id },
    label: `参与：${job.name}`,
    hint: `${formatClock(assignment.fromMinute)}–${formatClock(assignment.toMinute)} · ¥${job.pay.toLocaleString('zh-CN')}`,
    icon: 'star',
    tone: 'primary',
  };
}

function buildPlan(state: GameState): SceneView {
  const location = CONTENT_INDEX.locations.get(state.locationId);
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
        activity.target !== 'present-idol' &&
        // 训练/工作默认只出现在偶像页；但 target: 'none' 的是制作人自己的活，留在地点页。
        (activity.target === 'none' ||
          activity.target === 'all-present-idols' ||
          (activity.kind !== 'training' && activity.kind !== 'work')),
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

  if (!state.flags.forced_rest) {
    actions.push(...buildJobActions(state));
    const jobOpportunity = buildJobOpportunity(state);
    if (jobOpportunity) actions.push(jobOpportunity);
    const story = getEligibleStories(state);
    for (const entry of story) {
      actions.push({
        id: `story:${entry.chain.id}`,
        command: { type: 'startStory', chainId: entry.chain.id },
        label: entry.step.actionLabel,
        hint: '剧情',
        icon: 'sparkle',
        tone: 'primary',
      });
    }
  }

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
    title: formatCalendarDate(state.clock.absoluteMinutes, false),
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
  if (state.pendingResults?.length) {
    for (const entry of state.pendingResults) {
      const name = CONTENT_INDEX.idols.get(entry.idolId)?.name ?? entry.idolId;
      blocks.push({ kind: 'p', text: `${name}：${entry.text}` });
    }
  } else if (state.lastResult) {
    blocks.push({ kind: 'p', text: state.lastResult });
  }
  if (activity) {
    if (activity.kind === 'sleep') {
      blocks.push({
        kind: 'system',
        text: `现在是 ${formatClock(state.clock.absoluteMinutes)}。`,
      });
    } else {
      blocks.push({
        kind: 'system',
        text: `${formatDuration(activityDuration(state, activity))}后，现在是 ${formatClock(
          state.clock.absoluteMinutes,
        )}。`,
      });
    }
    if ((state.pendingResults?.length ?? 0) > 1) {
      // 多目标：消耗只结算一次，效果按偶像各算一份。
      const costText = effectSummary([], activityCost(state, activity));
      if (costText) blocks.push({ kind: 'system', text: costText });
      const effectText = effectSummary(activity.effects);
      if (effectText) {
        blocks.push({ kind: 'system', text: `每人：${effectText}` });
      }
    } else {
      const effects = effectSummary(
        activity.effects,
        activityCost(state, activity),
      );
      if (effects) {
        blocks.push({ kind: 'system', text: effects });
      }
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

  const cast = state.pendingEventCast ?? [];

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    title: event.title,
    blocks: [
      {
        kind: 'p',
        text:
          cast.length > 1
            ? formatCastText(event.text, cast)
            : formatIdolText(event.text, state.pendingEventIdolId),
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
  const idolId = state.selectedIdolId;
  const actor = getActor(idolId);
  const idolDef = CONTENT_INDEX.idols.get(idolId);
  const idolState = state.idols[idolId];

  if (
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
        // target: 'none' 是制作人自己的活，只留在地点页。
        activity.target !== 'none' &&
        activity.target !== 'all-present-idols' &&
        (activity.kind === 'training' ||
          activity.kind === 'work' ||
          activity.kind === 'bond'),
    )
    .map((activity) => ({
      activity,
      availability: activityAvailability(state, activity, idolId),
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
            : activity.kind === 'bond'
              ? {
                  type: 'activity',
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
  const modeLabel = mode === 'work' ? '工作' : mode === 'training' ? '训练' : '互动';

  return {
    id: sceneId(state),
    phase: state.phase,
    phaseLabel: modeLabel,
    title: idolDef.name,
    subtitle: `${idolDef.unit} · ${modeLabel}`,
    blocks: [],
    idol: {
      id: idolId,
      name: idolDef.name,
      unit: idolDef.unit,
      description: idolDef.profile,
      color: idolDef.color,
      avatar: idolDef.avatar,
      stats: idolState.stats,
      fans: idolState.fans ?? 0,
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
    default:
      return buildPlan(state);
  }
}
