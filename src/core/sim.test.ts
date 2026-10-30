import { describe, expect, it } from 'vitest';
import { buildScene } from './scene';
import {
  MINUTES_PER_DAY,
} from './config';
import {
  activityAvailability,
  activityDuration,
  activityStaminaCost,
  activityTargets,
  advanceDialogue,
  advanceTime,
  applyActivity,
  applyActivityDef,
  applyEventChoice,
  applyAttributeExp,
  checkCondition,
  checkEventCandidates,
  effectSummary,
  formatIdolText,
  getActivity,
  getActor,
  getDialogueNode,
  getDialogueText,
  getEvent,
  handleAction,
  handleCommand,
  maxStamina,
  moveTo,
  newGame,
  presentActors,
  talkTo,
  takeTransit,
  topicAvailability,
  travelTo,
  workRewardPreview,
  workRiskPreview,
} from './sim';
import { formatClock, getDay } from './time';
import type { ActivityDef } from './types';

describe('raising sim core', () => {
  it('starts on day 1 at 08:00 with the expected numbers', () => {
    const state = newGame(1);
    expect(getDay(state.clock.absoluteMinutes)).toBe(1);
    expect(formatClock(state.clock.absoluteMinutes)).toBe('08:00');
    expect(state.locationId).toBe('office');
    expect(state.phase).toBe('plan');
    expect(state.selectedIdolId).toBe('mano');
    expect(state.idols.mano?.stats.vocal.rank).toBe('D');
    expect(state.idols.mano?.stats.vocal.exp).toBe(0);
    expect(state.shared.stamina).toBe(100);
    expect(state.money).toBe(3000);
    expect(state.actionsTaken).toBe(0);
  });

  it('applies activity costs, effects and duration', () => {
    const state = travelTo(newGame(1), 'practice_room');
    const next = applyActivity(state, 'vocal', 'mano');
    expect(next.idols.mano?.stats.vocal.rank).toBe('D');
    expect(next.idols.mano?.stats.vocal.exp).toBe(3);
    expect(next.money).toBe(2500);
    expect(next.shared.stamina).toBe(85);
    expect(next.shared.stress).toBe(8);
    expect(next.phase).toBe('activityResult');
    expect(next.actionsTaken).toBe(1);
    expect(formatClock(next.clock.absoluteMinutes)).toBe('10:15');
  });

  it('disables a lesson when money is not enough', () => {
    const state = travelTo(newGame(1), 'practice_room');
    state.money = 100;
    const activity = getActivity('vocal');
    expect(activity).toBeTruthy();
    const availability = activityAvailability(state, activity!);
    expect(availability.ok).toBe(false);
    if (availability.ok) throw new Error('expected unavailable');
    expect(availability.display).toBe('disable');
    expect(availability.reason).toBe('金钱不足（需要 ¥500）');
  });

  it('disables a lesson when stamina is not enough', () => {
    const state = travelTo(newGame(1), 'practice_room');
    state.shared.stamina = 5;
    const activity = getActivity('vocal')!;
    const availability = activityAvailability(state, activity);
    expect(availability.ok).toBe(false);
    if (availability.ok) throw new Error('expected unavailable');
    expect(availability.display).toBe('disable');
    expect(availability.reason).toBe('体力不足（需要 15）');
  });

  it('shows resource-blocked actions as disabled with a reason', () => {
    const state = travelTo(newGame(1), 'practice_room');
    state.money = 100;
    const idolPage = handleCommand(state, {
      type: 'enterIdol',
      idolId: 'mano',
    });
    const vocal = buildScene(idolPage).actions.find(
      (action) => action.id === 'vocal',
    );
    expect(vocal).toBeTruthy();
    expect(vocal?.disabled).toBe(true);
    expect(vocal?.disabledReason).toBe('金钱不足（需要 ¥500）');
  });

  it('hides non-rest actions while forced to rest', () => {
    const state = newGame(1);
    state.flags.forced_rest = true;
    const labels = buildScene(state).actions.map((action) => action.label);
    expect(labels).toContain('休息');
    expect(labels).not.toContain('自由时间');
    expect(labels).not.toContain('环顾四周');
  });

  it('blocks an activity outside its location', () => {
    const state = newGame(1);
    const activity = getActivity('vocal');
    const availability = activityAvailability(state, activity!);
    expect(availability.ok).toBe(false);
    if (availability.ok) throw new Error('expected unavailable');
    expect(availability.display).toBe('hide');
    expect(availability.reason).toBe('不在此地点');
  });

  it('takes 15 minutes to move and keeps the action count', () => {
    const state = newGame(1);
    const next = travelTo(state, 'practice_room');
    expect(next.locationId).toBe('practice_room');
    expect(next.actionsTaken).toBe(state.actionsTaken);
    expect(next.clock.absoluteMinutes - state.clock.absoluteMinutes).toBe(15);

    const back = travelTo(next, 'office');
    expect(back.locationId).toBe('office');
    expect(back.clock.absoluteMinutes - next.clock.absoluteMinutes).toBe(15);
  });

  it('looks around and triggers each location event', () => {
    const cases: Array<[string, string]> = [
      ['office', 'evt.office_desk'],
      ['practice_room', 'evt.practice_note'],
      ['studio', 'evt.studio_headphones'],
    ];

    for (const [locationId, eventId] of cases) {
      let state = newGame(1);
      if (locationId === 'studio') {
        state = advanceTime(state, 2 * 60);
      }
      state = travelTo(state, locationId);
      state = handleAction(state, 'look_around');
      expect(state.phase).toBe('activityResult');

      state = handleAction(state, 'continue');
      expect(state.phase).toBe('event');
      expect(state.pendingEventId).toBe(eventId);
    }
  });

  it('prunes expired schedule overrides when time advances', () => {
    const state = newGame(1);
    state.actors.mano.scheduleOverrides = [
      {
        id: 'day-1',
        day: 1,
        locationId: 'studio',
        label: '收录',
        mode: 'replace-day',
      },
      {
        id: 'day-2',
        day: 2,
        locationId: 'studio',
        label: '收录',
        mode: 'replace-day',
      },
    ];

    const next = advanceTime(state, 24 * 60);
    expect(next.actors.mano.scheduleOverrides).toHaveLength(1);
    expect(next.actors.mano.scheduleOverrides?.[0]?.id).toBe('day-2');
  });

  it('accepts a job into a future free day', () => {
    const state = newGame(1);
    const scene = buildScene(state);
    const jobAction = scene.actions.find(
      (action) =>
        action.command.type === 'acceptJob' &&
        action.label.includes('杂志拍摄'),
    );
    expect(jobAction).toBeDefined();
    if (!jobAction || jobAction.command.type !== 'acceptJob') return;

    expect(jobAction.hint ?? '').toContain('4月12日');
    const accepted = handleCommand(state, jobAction.command);
    const override = accepted.actors.mano.scheduleOverrides?.[0];
    expect(override?.day).toBe(7);
    expect(override?.mode).toBe('replace-day');
    expect(override?.locationId).toBe('studio');
    expect(accepted.jobs).toHaveLength(1);

    const nextScene = buildScene(accepted);
    expect(
      nextScene.actions.some(
        (action) =>
          action.command.type === 'acceptJob' &&
          action.label.includes('杂志拍摄'),
      ),
    ).toBe(false);
  });

  it('completes an accepted job automatically without reward or log', () => {
    const state = newGame(1);
    const scene = buildScene(state);
    const jobAction = scene.actions.find(
      (action) =>
        action.command.type === 'acceptJob' &&
        action.label.includes('杂志拍摄'),
    );
    if (!jobAction || jobAction.command.type !== 'acceptJob') {
      throw new Error('expected magazine offer');
    }

    const accepted = handleCommand(state, jobAction.command);
    const logLength = accepted.log.length;
    const after = advanceTime(accepted, 6 * 24 * 60 + 8 * 60);

    expect(after.jobs).toHaveLength(0);
    expect(after.money).toBe(3000);
    expect(after.log.length).toBe(logLength);
  });

  it('participating in a job pays and advances to the end', () => {
    const state = newGame(1);
    // 工作要她去做，先让她出道。
    state.idols.mano!.status = 'recruited';
    const scene = buildScene(state);
    const jobAction = scene.actions.find(
      (action) =>
        action.command.type === 'acceptJob' &&
        action.label.includes('杂志拍摄'),
    );
    if (!jobAction || jobAction.command.type !== 'acceptJob') {
      throw new Error('expected magazine offer');
    }

    const accepted = handleCommand(state, jobAction.command);
    const assignment = accepted.jobs?.[0];
    expect(assignment).toBeDefined();
    if (!assignment) throw new Error('expected assignment');

    const atStudio = advanceTime(accepted, 6 * 24 * 60 + 2 * 60);
    atStudio.locationId = 'studio';
    const jobScene = buildScene(atStudio);
    expect(
      jobScene.actions.some((action) => action.label.includes('参与：杂志拍摄')),
    ).toBe(true);

    const attended = handleCommand(atStudio, {
      type: 'attendJob',
      jobId: assignment.id,
    });

    expect(attended.jobs).toHaveLength(0);
    expect(attended.money).toBe(4200);
    // 工作现在和行动一样走结果页，而不是把一句日志丢回安排页。
    expect(attended.phase).toBe('activityResult');
    expect(attended.lastResult).toContain('收入 ¥');
    expect(attended.log.some((entry) => entry.text.includes('收入'))).toBe(true);
    expect(attended.idols.mano?.stats.expression.exp).toBeGreaterThan(0);
    expect(formatClock(attended.clock.absoluteMinutes)).toBe('16:00');
  });

  it('sleeps until 08:00 and restores stamina by hours slept', () => {
    let state = travelTo(newGame(1), 'home');
    state = advanceTime(state, 14 * 60);
    state.shared.stamina = 20;
    state.shared.stress = 50;

    const slept = applyActivity(state, 'sleep');
    expect(formatClock(slept.clock.absoluteMinutes)).toBe('08:00');
    expect(getDay(slept.clock.absoluteMinutes)).toBe(2);
    expect(slept.shared.stamina).toBe(100);
    expect(slept.shared.stress).toBeLessThan(50);
    expect(slept.phase).toBe('activityResult');
  });

  it('keeps time advancing without fixed exam triggers', () => {
    const state = newGame(1);
    const advanced = advanceTime(state, 10 * MINUTES_PER_DAY);
    expect(getDay(advanced.clock.absoluteMinutes)).toBe(11);
  });

  it('advances time for timed event choices', () => {
    const state = newGame(1);
    state.clock.absoluteMinutes = 22 * 60;
    state.phase = 'event';
    state.pendingEventId = 'evt.tv_offer';

    const next = applyEventChoice(state, 0);
    expect(next.phase).toBe('eventResult');
    expect(formatClock(next.clock.absoluteMinutes)).toBe('02:00');
    expect(getDay(next.clock.absoluteMinutes)).toBe(2);
  });

  it('blocks training outside its time window', () => {
    const state = advanceTime(travelTo(newGame(1), 'practice_room'), 13 * 60);
    const activity = getActivity('vocal')!;
    const availability = activityAvailability(state, activity);
    expect(availability.ok).toBe(false);
    if (availability.ok) throw new Error('expected unavailable');
    expect(availability.display).toBe('hide');
    expect(availability.reason).toBe('现在不能做');
  });

  it('hides actions outside their time windows', () => {
    const state = advanceTime(travelTo(newGame(1), 'practice_room'), 13 * 60);
    const labels = buildScene(state).actions.map((action) => action.label);
    expect(labels).not.toContain('声乐课');
    expect(labels).not.toContain('自由时间');
    expect(labels).toContain('环顾四周');
  });

  it('blocks sleep during the day and allows it at night', () => {
    const state = travelTo(newGame(1), 'home');
    const sleep = getActivity('sleep')!;
    const blocked = activityAvailability(state, sleep);
    expect(blocked.ok).toBe(false);
    if (blocked.ok) throw new Error('expected unavailable');
    expect(blocked.display).toBe('hide');
    expect(blocked.reason).toBe('现在不能做');

    const evening = advanceTime(state, 12 * 60);
    expect(activityAvailability(evening, sleep).ok).toBe(true);
  });

  it('moves one adjacent node at a time', () => {
    const morning = newGame(1);
    expect(moveTo(morning, 'practice_room').locationId).toBe('office');

    const station = moveTo(morning, 'station');
    expect(station.locationId).toBe('station');
    const practice = moveTo(station, 'practice_room');
    expect(practice.locationId).toBe('practice_room');
  });

  it('takes the bus from the station for a fixed fare and time', () => {
    const station = moveTo(newGame(1), 'station');
    const studio = takeTransit(station, 'bus_station_studio');

    expect(studio.locationId).toBe('studio');
    expect(studio.money).toBe(2900);
    expect(formatClock(studio.clock.absoluteMinutes)).toBe('08:10');
    expect(studio.log[0]?.text).toContain('车费 ¥100');
  });

  it('takes a taxi from any location with a flat fare', () => {
    const studio = takeTransit(newGame(1), 'taxi_office_studio');
    expect(studio.locationId).toBe('studio');
    expect(studio.money).toBe(2600);
    expect(formatClock(studio.clock.absoluteMinutes)).toBe('08:03');
  });

  it('rejects transit without money or from the wrong location', () => {
    const station = moveTo(newGame(1), 'station');
    station.money = 99;
    expect(takeTransit(station, 'bus_station_studio').locationId).toBe(
      'station',
    );
    expect(takeTransit(newGame(1), 'bus_station_studio').locationId).toBe(
      'office',
    );
  });

  it('points station players to walking or bus', () => {
    const scene = buildScene(moveTo(newGame(1), 'station'));
    expect(scene.blocks.some((block) => block.text.includes('乘公交'))).toBe(
      true,
    );
    expect(scene.locations?.map((location) => location.id)).toEqual([
      'home',
      'office',
      'practice_room',
    ]);
  });

  it('accepts typed transit commands', () => {
    const state = handleCommand(moveTo(newGame(1), 'station'), {
      type: 'transit',
      routeId: 'bus_station_office',
    });
    expect(state.locationId).toBe('office');
    expect(state.money).toBe(2900);
    expect(formatClock(state.clock.absoluteMinutes)).toBe('08:10');
  });

  it('accepts typed action commands', () => {
    let state = newGame(1);
    state = handleCommand(state, {
      type: 'move',
      locationId: 'station',
    });
    expect(state.locationId).toBe('station');
    state = handleCommand(state, {
      type: 'move',
      locationId: 'practice_room',
    });
    expect(state.locationId).toBe('practice_room');

    state = handleCommand(state, {
      type: 'activity',
      activityId: 'vocal',
      idolId: 'mano',
    });
    expect(state.phase).toBe('activityResult');
  });

  it('navigates NPC interaction with typed commands', () => {
    let state = advanceTime(newGame(1), 60);
    state = handleCommand(state, { type: 'enterNpc', actorId: 'hazuki' });
    expect(state.phase).toBe('npc');

    state = handleCommand(state, {
      type: 'talk',
      actorId: 'hazuki',
      topicId: 'greeting',
    });
    expect(state.phase).toBe('npcResult');

    state = handleCommand(state, { type: 'continue' });
    expect(state.phase).toBe('npc');

    state = handleCommand(state, { type: 'leaveNpc' });
    expect(state.phase).toBe('plan');
  });

  it('enters Mano at the practice room and trains her', () => {
    const state = travelTo(newGame(1), 'practice_room');
    expect(presentActors(state).map((actor) => actor.id)).toEqual(['mano']);

    const entered = handleCommand(state, {
      type: 'enterIdol',
      idolId: 'mano',
    });
    expect(entered.phase).toBe('idol');
    expect(entered.selectedIdolId).toBe('mano');

    const trained = handleCommand(entered, {
      type: 'train',
      idolId: 'mano',
      activityId: 'vocal',
    });
    expect(trained.phase).toBe('activityResult');
    expect(trained.idols.mano?.stats.vocal.exp).toBe(3);
    expect(trained.shared.stamina).toBe(85);
    expect(trained.pendingIdolReturnId).toBe('mano');

    const left = handleCommand(entered, { type: 'leaveIdol' });
    expect(left.phase).toBe('plan');
  });

  it('trains a specific idol without changing the other', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    expect(presentActors(state).map((actor) => actor.id)).toEqual([
      'mano',
      'hiori',
    ]);

    const entered = handleCommand(state, {
      type: 'enterIdol',
      idolId: 'hiori',
    });
    const trained = handleCommand(entered, {
      type: 'train',
      idolId: 'hiori',
      activityId: 'vocal',
    });

    expect(trained.selectedIdolId).toBe('hiori');
    expect(trained.idols.hiori?.stats.vocal.exp).toBe(3);
    expect(trained.idols.mano?.stats.vocal.exp).toBe(0);
  });

  it('does not move the selection when another idol trains', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    const before = state.selectedIdolId;

    const next = applyActivity(state, 'vocal', 'hiori');

    expect(next.selectedIdolId).toBe(before);
    expect(next.idols.hiori?.stats.vocal.exp).toBe(3);
  });

  it('applies a multi-target action to everyone present', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    const activity = getActivity('group_greeting')!;
    const staminaBefore = state.shared.stamina;
    const clockBefore = state.clock.absoluteMinutes;

    expect(activityTargets(state, activity)).toEqual(['mano', 'hiori']);

    const next = applyActivityDef(state, activity);

    expect(next.idols.mano?.stats.trust.exp).toBe(1);
    expect(next.idols.hiori?.stats.trust.exp).toBe(1);
    expect(next.shared.stamina).toBe(staminaBefore - 5);
    expect(next.clock.absoluteMinutes - clockBefore).toBe(30);
    expect(next.pendingResults?.map((entry) => entry.idolId)).toEqual([
      'mano',
      'hiori',
    ]);
    expect(next.phase).toBe('activityResult');

    const plan = buildScene(state);
    expect(plan.actions.some((action) => action.id === 'group_greeting')).toBe(
      true,
    );

    const scene = buildScene(next);
    const text = scene.blocks.map((block) => block.text).join('\n');
    expect(text).toContain('樱木真乃');
    expect(text).toContain('风野灯织');
  });

  it('hides a multi-target action when nobody is present', () => {
    const state = newGame(1);
    const activity = getActivity('group_greeting')!;

    expect(activityTargets(state, activity)).toEqual([]);
    expect(activityAvailability(state, activity).ok).toBe(false);
    expect(applyActivityDef(state, activity)).toBe(state);
  });

  it('applies event effects to the context idol', () => {
    let state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state = handleCommand(state, { type: 'enterIdol', idolId: 'mano' });
    state = handleCommand(state, {
      type: 'train',
      idolId: 'mano',
      activityId: 'vocal',
    });
    state.pendingEventId = 'evt.mano_soft_voice';
    state.pendingEventIdolId = 'mano';
    state.phase = 'event';

    const next = applyEventChoice(state, 0);
    expect(next.idols.mano?.stats.vocal.rank).toBe('D');
    expect(next.idols.mano?.stats.vocal.exp).toBe(6);
    expect(next.idols.mano?.stats.trust.exp).toBe(1);
    expect(next.idols.hiori?.stats.vocal.exp).toBe(0);
    expect(next.lastResult).toContain('樱木真乃');
  });

  it('levels up and freezes at the idol cap', () => {
    const state = newGame(1);
    state.idols.mano!.stats.vocal.exp = 59;
    applyAttributeExp(state, 'vocal', 3, 'gain', 'mano');
    expect(state.idols.mano?.stats.vocal.rank).toBe('C');
    expect(state.idols.mano?.stats.vocal.exp).toBe(2);

    state.idols.hiori!.stats.vocal.rank = 'B';
    state.idols.hiori!.stats.vocal.exp = 0;
    applyAttributeExp(state, 'vocal', 20, 'gain', 'hiori');
    expect(state.idols.hiori?.stats.vocal.rank).toBe('B');
    expect(state.idols.hiori?.stats.vocal.exp).toBe(0);
  });

  it('checks event conditions against the target idol', () => {
    const state = newGame(1);
    state.idols.mano!.stats.trust.rank = 'E';
    state.idols.hiori!.stats.trust.rank = 'C';
    const condition = {
      kind: 'attributeAtLeast',
      ref: 'trust',
      rank: 'C',
    } as const;

    expect(checkCondition(condition, state)).toBe(false);
    expect(checkCondition(condition, state, { idolId: 'hiori' })).toBe(true);
  });

  it('formats pronouns with the target idol name', () => {
    expect(formatIdolText('她又唱了一遍。', 'mano')).toBe(
      '樱木真乃又唱了一遍。',
    );
    expect(formatIdolText('她又唱了一遍。')).toBe('她又唱了一遍。');
  });

  it('works with an idol at the studio', () => {
    const state = travelTo(advanceTime(newGame(1), 7 * 60), 'studio');
    expect(presentActors(state).map((actor) => actor.id)).toEqual(['mano']);

    const entered = handleCommand(state, {
      type: 'enterIdol',
      idolId: 'mano',
    });
    const scene = buildScene(entered);
    expect(scene.actions.map((action) => action.id)).toContain('work');
    expect(scene.actions.map((action) => action.id)).not.toContain('vocal');

    const worked = handleCommand(entered, {
      type: 'work',
      idolId: 'mano',
      activityId: 'work',
    });
    expect(worked.phase).toBe('activityResult');
    expect(worked.money).toBe(4350);
    expect(worked.shared.stamina).toBe(80);
    expect(worked.shared.stress).toBe(14);
    expect(worked.idols.hiori?.stats.trust.rank).toBe('E');
  });

  it('scales work reward by the target idol rank', () => {
    const state = newGame(1);
    const work = getActivity('work')!;
    const reward = work.workReward!;
    expect(workRewardPreview(state, reward, 'mano').money).toBe(1350);

    state.idols.mano!.stats.expression.rank = 'A';
    expect(workRewardPreview(state, reward, 'mano').money).toBe(2250);
  });

  it('enforces a hard work rank gate', () => {
    const state = travelTo(advanceTime(newGame(1), 7 * 60), 'studio');
    const music = getActivity('music_work')!;
    expect(activityAvailability(state, music, 'mano').ok).toBe(false);

    state.idols.mano!.stats.vocal.rank = 'B';
    expect(activityAvailability(state, music, 'mano').ok).toBe(true);
  });

  it('routes a failed risky work into its failure event', () => {
    const tv = getActivity('tv_work')!;
    const original = tv.workRisk?.failureByGap;
    tv.workRisk!.failureByGap = { 1: 1, 2: 1, 3: 1 };
    try {
      const state = travelTo(advanceTime(newGame(1), 12 * 60), 'studio');
      state.idols.hiori!.status = 'recruited';
      state.idols.hiori!.stats.trust.exp = 10;
      const entered = handleCommand(state, {
        type: 'enterIdol',
        idolId: 'hiori',
      });
      const worked = handleCommand(entered, {
        type: 'work',
        idolId: 'hiori',
        activityId: 'tv_work',
      });

      expect(worked.phase).toBe('event');
      expect(worked.pendingEventId).toBe('evt.work_failure_tv');
      expect(worked.pendingEventIdolId).toBe('hiori');
      expect(worked.money).toBe(3000);

      const resolved = applyEventChoice(worked, 0);
      expect(resolved.money).toBe(3000);
      expect(resolved.idols.hiori?.stats.trust.exp).toBe(7);
      expect(resolved.pendingChainEventId).toBe(
        'evt.tv_failure_aftermath',
      );

      const chained = handleCommand(resolved, { type: 'continue' });
      expect(chained.phase).toBe('event');
      expect(chained.pendingEventId).toBe('evt.tv_failure_aftermath');
    } finally {
      if (original) {
        tv.workRisk!.failureByGap = original;
      } else {
        delete tv.workRisk!.failureByGap;
      }
    }
  });

  it('routes a successful risky work into its success chain', () => {
    const state = travelTo(advanceTime(newGame(1), 12 * 60), 'studio');
    state.idols.hiori!.status = 'recruited';
    state.idols.hiori!.stats.expression.rank = 'C';
    const entered = handleCommand(state, {
      type: 'enterIdol',
      idolId: 'hiori',
    });
    const worked = handleCommand(entered, {
      type: 'work',
      idolId: 'hiori',
      activityId: 'tv_work',
    });

    expect(worked.phase).toBe('event');
    expect(worked.pendingEventId).toBe('evt.tv_success');
    expect(worked.money).toBe(5760);

    const resolved = applyEventChoice(worked, 0);
    expect(resolved.pendingChainEventId).toBe('evt.tv_afterglow');
    const chained = handleCommand(resolved, { type: 'continue' });
    expect(chained.phase).toBe('event');
    expect(chained.pendingEventId).toBe('evt.tv_afterglow');
  });

  it('shows Hazuki and Tsutomu on their office schedules', () => {
    const morning = newGame(1);
    expect(presentActors(morning).map((actor) => actor.id)).toEqual([]);

    const nine = advanceTime(morning, 60);
    expect(presentActors(nine).map((actor) => actor.id)).toEqual(['hazuki']);

    const ten = advanceTime(morning, 2 * 60);
    expect(presentActors(ten).map((actor) => actor.id)).toEqual([
      'hazuki',
      'tsutomu',
    ]);

    const seventeen = advanceTime(morning, 9 * 60);
    expect(presentActors(seventeen).map((actor) => actor.id)).toEqual([
      'hazuki',
    ]);

    const evening = advanceTime(morning, 10 * 60);
    expect(presentActors(evening).map((actor) => actor.id)).toEqual([]);
  });

  it('talks to Hazuki and applies affinity once', () => {
    const actor = getActor('hazuki')!;
    const greeting = actor.topics.find((topic) => topic.id === 'greeting')!;
    let state = advanceTime(newGame(1), 60);

    state = handleAction(state, 'enter:hazuki');
    expect(state.phase).toBe('npc');

    state = handleAction(state, 'talk:hazuki:greeting');
    expect(state.phase).toBe('npcResult');
    expect(state.actors.hazuki?.affinity).toBe(1);
    expect(state.actors.hazuki?.flags['seen:greeting']).toBe(true);
    expect(topicAvailability(state, actor, greeting).ok).toBe(false);

    state = handleAction(state, 'continue');
    expect(state.phase).toBe('npc');

    state = handleAction(state, 'leave_npc');
    expect(state.phase).toBe('plan');
  });

  it('applies coffee effects and cooldown', () => {
    const actor = getActor('hazuki')!;
    const coffee = actor.topics.find((topic) => topic.id === 'coffee')!;
    let state = advanceTime(newGame(1), 60);
    state.shared.stamina = 50;
    state.shared.stress = 50;
    state = handleAction(state, 'enter:hazuki');

    state = talkTo(state, 'hazuki', 'coffee');
    expect(state.phase).toBe('npcResult');
    expect(state.actors.hazuki?.affinity).toBe(1);
    expect(state.shared.stamina).toBe(60);
    expect(state.shared.stress).toBe(45);

    state = handleAction(state, 'continue');
    expect(state.phase).toBe('npc');
    expect(topicAvailability(state, actor, coffee).ok).toBe(false);
    expect(
      topicAvailability(advanceTime(state, 12 * 60), actor, coffee).ok,
    ).toBe(true);
  });

  it('does not talk to Hazuki outside the office', () => {
    let state = advanceTime(newGame(1), 60);
    state = travelTo(state, 'practice_room');
    const entered = handleAction(state, 'enter:hazuki');
    expect(entered.phase).toBe('plan');
    const talked = handleAction(entered, 'talk:hazuki:greeting');
    expect(talked.phase).toBe('plan');
  });

  it('triggers a Hazuki event after a topic and returns to the NPC page', () => {
    let state = advanceTime(newGame(1), 4 * 60);
    state = handleAction(state, 'enter:hazuki');
    state = handleAction(state, 'talk:hazuki:greeting');
    state = handleAction(state, 'continue');

    expect(state.phase).toBe('event');
    expect(state.pendingEventId).toBe('evt.hazuki_nap');

    state = handleAction(state, 'choice:0');
    state = handleAction(state, 'continue');
    expect(state.phase).toBe('npc');
  });

  it('puts the active present idol into the scene hero', () => {
    const office = buildScene(newGame(1));
    expect(office.hero?.locationName).toBe('事务所');
    expect(office.hero?.portrait).toBeUndefined();

    const practice = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    const scene = buildScene(practice);
    expect(scene.hero?.idolId).toBe('mano');
    expect(scene.hero?.portrait).toBe('./assets/idols/mano-portrait.png');

    practice.selectedIdolId = 'hiori';
    practice.idols.hiori!.status = 'recruited';
    expect(buildScene(practice).hero?.idolId).toBe('hiori');
  });

  it('exposes the Q avatar on the idol page', () => {
    const practice = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    const entered = handleCommand(practice, {
      type: 'enterIdol',
      idolId: 'mano',
    });
    const scene = buildScene(entered);
    expect(scene.idol?.avatar).toBe('./assets/idols/q/mano.png');
  });

  it('does not show day-flavor stage text on the plan page', () => {
    const scene = buildScene(newGame(1));
    expect(
      scene.blocks.some(
        (block) =>
          block.text.includes('第一天。') ||
          block.text.includes('第二天。她开始记住'),
      ),
    ).toBe(false);
  });

  it('keeps the location open after hours but hides timed actions', () => {
    const midnight = advanceTime(newGame(1), 16 * 60);
    const scene = buildScene(midnight);
    expect(scene.actions).toHaveLength(0);
    expect(scene.blocks.some((block) => block.text.includes('关门'))).toBe(false);
    expect(scene.locations?.map((location) => location.id)).toEqual([
      'station',
      'park',
    ]);
  });

  it('settles a producer-only work with the producer multiplier table', () => {
    const state = newGame(1);
    state.producer.photography.rank = 'D';
    const reward = {
      baseMoney: 1000,
      terms: [{ ref: { scope: 'producer', key: 'photography' } as const }],
    };

    const preview = workRewardPreview(state, reward, 'mano');

    expect(preview.multiplier).toBeCloseTo(1.2);
    expect(preview.money).toBe(1200);
  });

  it('settles an idol-only work with a single term', () => {
    const state = newGame(1);
    state.idols.mano!.stats.vocal.rank = 'D';
    const reward = { baseMoney: 1000, terms: [{ ref: 'vocal' as const }] };

    expect(workRewardPreview(state, reward, 'mano').money).toBe(1000);
  });

  it('adds idol and producer terms in sum mode', () => {
    const state = newGame(1);
    state.idols.mano!.stats.vocal.rank = 'S';
    state.producer.photography.rank = 'F';
    const reward = {
      baseMoney: 1000,
      combine: 'sum' as const,
      terms: [
        { ref: 'vocal' as const, weight: 0.7 },
        { ref: { scope: 'producer', key: 'photography' } as const, weight: 0.3 },
      ],
    };

    const preview = workRewardPreview(state, reward, 'mano');

    expect(preview.multiplier).toBeCloseTo(1.56);
    expect(preview.money).toBe(1560);
  });

  it('multiplies idol and producer terms in product mode', () => {
    const state = newGame(1);
    state.idols.mano!.stats.vocal.rank = 'S';
    state.producer.photography.rank = 'S';
    const reward = {
      baseMoney: 1000,
      combine: 'product' as const,
      terms: [
        { ref: 'vocal' as const },
        { ref: { scope: 'producer', key: 'photography' } as const },
      ],
    };

    expect(workRewardPreview(state, reward, 'mano').multiplier).toBeCloseTo(2.7);
  });

  it('falls back to a multiplier of one without terms', () => {
    const state = newGame(1);
    expect(
      workRewardPreview(state, { baseMoney: 1000, terms: [] }).multiplier,
    ).toBe(1);
  });

  it('takes the worst term when work risk omits its ref', () => {
    const state = newGame(1);
    state.idols.mano!.stats.vocal.rank = 'C';
    state.producer.photography.rank = 'D';
    const reward = {
      baseMoney: 1000,
      terms: [
        { ref: 'vocal' as const },
        { ref: { scope: 'producer', key: 'photography' } as const },
      ],
    };
    const risk = { safeRank: 'B' as const };

    const preview = workRiskPreview(state, risk, reward, 'mano');

    expect(preview.ref).toEqual({ scope: 'producer', key: 'photography' });
    expect(preview.gap).toBe(2);
    expect(preview.chance).toBeCloseTo(0.5);
  });

  it('levels a producer attribute and reports it in effect summaries', () => {
    const state = newGame(1);
    applyAttributeExp(state, { scope: 'producer', key: 'photography' }, 20, 'gain');

    expect(state.producer.photography.rank).toBe('E');
    expect(state.log[0]?.text).toContain('制作人 摄影提升到 E');

    const summary = effectSummary([
      { kind: 'attributeExp', ref: { scope: 'producer', key: 'photography' }, tier: 3 },
    ]);
    expect(summary).toBe('摄影 EXP +3');
  });

  it('wires the three fixture work forms', () => {
    const state = newGame(1);
    state.idols.mano!.stats.vocal.rank = 'S';
    state.idols.mano!.stats.expression.rank = 'S';
    state.producer.photography.rank = 'F';

    const demo = getActivity('demo_recording')!;
    const photo = getActivity('photo_shoot')!;
    const cover = getActivity('cover_shoot')!;

    // 只看偶像：制作人等级不影响结果。
    const demoAtF = workRewardPreview(state, demo.workReward!, 'mano');
    state.producer.photography.rank = 'S';
    const demoAtS = workRewardPreview(state, demo.workReward!, 'mano');
    expect(demoAtF.multiplier).toBeCloseTo(1.8);
    expect(demoAtS.multiplier).toBeCloseTo(1.8);

    // 只看制作人：偶像属性不参与。
    expect(photo.workReward!.terms).toHaveLength(1);
    const photoHighIdol = workRewardPreview(state, photo.workReward!, 'mano');
    state.idols.mano!.stats.vocal.rank = 'F';
    const photoLowIdol = workRewardPreview(state, photo.workReward!, 'mano');
    expect(photoHighIdol.multiplier).toBeCloseTo(1.5);
    expect(photoLowIdol.multiplier).toBeCloseTo(1.5);

    // 两者相乘。
    expect(cover.workReward!.combine).toBe('product');
    state.producer.photography.rank = 'D';
    state.idols.mano!.stats.expression.rank = 'S';
    expect(
      workRewardPreview(state, cover.workReward!, 'mano').multiplier,
    ).toBeCloseTo(1.8 * 1.2);

    // 风险没有 ref 时取最差项：摄影 D 比表现 S 更差。
    const risk = workRiskPreview(
      state,
      cover.workRisk!,
      cover.workReward,
      'mano',
    );
    expect(risk.ref).toEqual({ scope: 'producer', key: 'photography' });
    expect(risk.gap).toBe(1);
  });

  it('uses result variants that depend on the idol attribute', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.mano!.stats.trust.rank = 'D';

    const next = applyActivity(state, 'free', 'mano');

    expect(next.lastResult).toContain('她开始主动跟你说些无关紧要的事');
  });

  it('levels producer stamina from the test event and raises the cap', () => {
    const state = newGame(1);
    state.flags.test_producer_drill = true;
    state.phase = 'event';
    state.pendingEventId = 'evt.producer_stamina_drill';
    state.producer.stamina.exp = 15;

    const next = applyEventChoice(state, 0);

    expect(next.producer.stamina.rank).toBe('E');
    expect(next.producer.stamina.exp).toBe(0);
    expect(maxStamina(next)).toBe(125);
    expect(maxStamina(state)).toBe(100);
  });

  it('applies the producer stamina multiplier to activity cost', () => {
    const state = travelTo(newGame(1), 'practice_room');
    const vocal = getActivity('vocal')!;

    expect(activityStaminaCost(state, vocal)).toBe(15);

    state.producer.stamina.rank = 'B';
    expect(activityStaminaCost(state, vocal)).toBe(14);
    expect(activityAvailability(state, vocal).ok).toBe(true);
  });

  it('exposes activity duration through a single entry', () => {
    const state = travelTo(newGame(1), 'practice_room');
    const vocal = getActivity('vocal')!;

    expect(activityDuration(state, vocal)).toBe(vocal.durationMinutes);

    const next = applyActivity(state, 'vocal', 'mano');
    expect(next.clock.absoluteMinutes - state.clock.absoluteMinutes).toBe(
      activityDuration(state, vocal),
    );
  });

  it('settles group training once for cost and per idol for attributes', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    const moneyBefore = state.money;
    const staminaBefore = state.shared.stamina;
    const clockBefore = state.clock.absoluteMinutes;

    const next = applyActivity(state, 'group_training');

    expect(next.money).toBe(moneyBefore - 2000);
    expect(next.shared.stamina).toBe(staminaBefore - 30);
    expect(next.clock.absoluteMinutes - clockBefore).toBe(120);
    for (const idolId of ['mano', 'hiori']) {
      expect(next.idols[idolId]?.stats.vocal.exp).toBe(1);
      expect(next.idols[idolId]?.stats.trust.exp).toBe(1);
    }
  });

  it('triggers a bespoke pair scene only after the anchored action', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    const pair = getEvent('evt.pair_mano_hiori')!;
    const forced = [{ ...pair, chance: 1 }];
    const ctx = { lastActivityId: 'group_training', locationId: 'practice_room' };

    // 不在锚点行动之后
    expect(checkEventCandidates(state, forced, { locationId: 'practice_room' }).event).toBe(null);

    // 锚点对了，但 hiori 还没招募
    expect(checkEventCandidates(state, forced, ctx).event).toBe(null);

    state.idols.hiori!.status = 'recruited';
    const triggered = checkEventCandidates(state, forced, ctx);

    expect(triggered.event?.id).toBe(pair.id);
    expect(triggered.state.pendingEventCast).toEqual(['mano', 'hiori']);

    const next = applyEventChoice(triggered.state, 0);
    expect(next.idols.mano?.stats.trust.exp).toBe(1);
    expect(next.idols.hiori?.stats.trust.exp).toBe(1);

    // 选择后进入对话，参与者带上。
    expect(next.pendingDialogueId).toBe('dialogue.pair.mano_hiori');
    expect(next.pendingDialogueCast).toEqual(['mano', 'hiori']);

    const firstNode = getDialogueNode(next)!;
    expect(getDialogueText(next, firstNode)).toContain('樱木真乃');

    // 走完对话回到事件结果，并沿用这次选择的结果文案。
    const secondNode = advanceDialogue(next);
    const thirdNode = advanceDialogue(secondNode);
    const done = advanceDialogue(thirdNode);
    expect(done.pendingDialogueId).toBeUndefined();
    expect(done.pendingDialogueCast).toBeUndefined();
    expect(done.phase).toBe('eventResult');
    expect(done.lastResult).toContain('这顿饭吃得很慢');
  });

  it('picks two random participants for a generic pair scene', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    state.idols.meguru!.status = 'recruited';
    state.actors.meguru!.scheduleOverrides = [
      {
        id: 'test-meguru',
        day: getDay(state.clock.absoluteMinutes),
        fromMinute: 0,
        toMinute: 24 * 60,
        locationId: 'practice_room',
        mode: 'replace-day',
      },
    ];

    const generic = getEvent('evt.pair_generic_rest')!;
    const result = checkEventCandidates(
      state,
      [{ ...generic, chance: 1 }],
      { lastActivityId: 'group_training', locationId: 'practice_room' },
    );

    expect(result.event?.id).toBe(generic.id);
    expect(result.state.pendingEventCast).toHaveLength(2);
    for (const idolId of result.state.pendingEventCast ?? []) {
      expect(['mano', 'hiori', 'meguru']).toContain(idolId);
    }
  });

  it('blocks the same pair from repeating through the pair cooldown', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    const pair = getEvent('evt.pair_mano_hiori')!;
    const forced = [{ ...pair, chance: 1 }];
    const ctx = { lastActivityId: 'group_training', locationId: 'practice_room' };

    const first = checkEventCandidates(state, forced, ctx);
    expect(first.event?.id).toBe(pair.id);

    const second = checkEventCandidates(first.state, forced, ctx);
    expect(second.event).toBe(null);
  });

  it('settles producer effects once for multi-target actions', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
    state.idols.hiori!.status = 'recruited';
    const drill: ActivityDef = {
      id: 'test_group_drill',
      name: '集体体能',
      description: '测试用',
      kind: 'bond',
      target: 'all-present-idols',
      locations: ['practice_room'],
      durationMinutes: 30,
      cost: {},
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 1 },
        {
          kind: 'attributeExp',
          ref: { scope: 'producer', key: 'stamina' },
          tier: 5,
        },
      ],
      resultTexts: ['一起练完，谁都没有先走。'],
    };

    const next = applyActivityDef(state, drill);

    // 偶像效果按人各一份。
    expect(next.idols.mano?.stats.trust.exp).toBe(1);
    expect(next.idols.hiori?.stats.trust.exp).toBe(1);
    // 制作人效果只结算一次。
    expect(next.producer.stamina.exp).toBe(5);
  });
});
