import { describe, expect, it } from 'vitest';
import { buildScene } from './scene';
import {
  MINUTES_PER_DAY,
} from './config';
import {
  activityAvailability,
  advanceTime,
  applyActivity,
  applyEventChoice,
  applyIdolExp,
  checkCondition,
  formatIdolText,
  getActivity,
  getActor,
  handleAction,
  handleCommand,
  moveTo,
  newGame,
  presentActors,
  talkTo,
  takeTransit,
  topicAvailability,
  travelTo,
  workRewardPreview,
} from './sim';
import { formatClock, getDay } from './time';

describe('raising sim core', () => {
  it('starts on day 1 at 08:00 with the expected numbers', () => {
    const state = newGame(1);
    expect(getDay(state.clock.absoluteMinutes)).toBe(1);
    expect(formatClock(state.clock.absoluteMinutes)).toBe('08:00');
    expect(state.locationId).toBe('office');
    expect(state.phase).toBe('plan');
    expect(state.activeIdolId).toBe('mano');
    expect(state.idols.mano?.stats.vocal.rank).toBe('D');
    expect(state.idols.mano?.stats.vocal.exp).toBe(0);
    expect(state.shared.stamina).toBe(100);
    expect(state.money).toBe(3000);
    expect(state.actionsTaken).toBe(0);
  });

  it('applies activity costs, effects and duration', () => {
    const state = travelTo(newGame(1), 'practice_room');
    const next = applyActivity(state, 'vocal');
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
    expect(advanced.pendingExam).toBeUndefined();
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
    expect(labels).toContain('自由时间');
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
    expect(entered.pendingIdolId).toBe('mano');

    const trained = handleCommand(entered, {
      type: 'train',
      idolId: 'mano',
      activityId: 'vocal',
    });
    expect(trained.phase).toBe('activityResult');
    expect(trained.idols.mano?.stats.vocal.exp).toBe(3);
    expect(trained.shared.stamina).toBe(85);
    expect(trained.pendingIdolId).toBe('mano');

    const left = handleCommand(entered, { type: 'leaveIdol' });
    expect(left.phase).toBe('plan');
  });

  it('trains a specific idol without changing the other', () => {
    const state = travelTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
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

    expect(trained.activeIdolId).toBe('hiori');
    expect(trained.idols.hiori?.stats.vocal.exp).toBe(3);
    expect(trained.idols.mano?.stats.vocal.exp).toBe(0);
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
    applyIdolExp(state, 'vocal', 3);
    expect(state.idols.mano?.stats.vocal.rank).toBe('C');
    expect(state.idols.mano?.stats.vocal.exp).toBe(2);

    state.idols.hiori!.stats.vocal.rank = 'B';
    state.idols.hiori!.stats.vocal.exp = 0;
    applyIdolExp(state, 'vocal', 20, 'gain', 'hiori');
    expect(state.idols.hiori?.stats.vocal.rank).toBe('B');
    expect(state.idols.hiori?.stats.vocal.exp).toBe(0);
  });

  it('checks event conditions against the target idol', () => {
    const state = newGame(1);
    state.idols.mano!.stats.trust.rank = 'E';
    state.idols.hiori!.stats.trust.rank = 'C';
    const condition = {
      kind: 'rankAtLeast',
      attribute: 'trust',
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

    practice.activeIdolId = 'hiori';
    expect(buildScene(practice).hero?.idolId).toBe('hiori');
  });

  it('keeps the location open after hours but hides timed actions', () => {
    const midnight = advanceTime(newGame(1), 16 * 60);
    const scene = buildScene(midnight);
    expect(scene.actions).toHaveLength(0);
    expect(scene.blocks.some((block) => block.text.includes('关门'))).toBe(false);
    expect(scene.locations?.map((location) => location.id)).toEqual([
      'station',
    ]);
  });
});
