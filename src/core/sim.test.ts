import { describe, expect, it } from 'vitest';
import { buildScene } from './scene';
import {
  MID_EXAM_DAY,
  MID_EXAM_MINUTE,
  MINUTES_PER_DAY,
  START_MINUTE,
} from './config';
import {
  activityAvailability,
  advanceTime,
  applyActivity,
  applyEventChoice,
  checkCondition,
  formatIdolText,
  getActivity,
  getActor,
  handleAction,
  handleCommand,
  isLocationOpen,
  moveTo,
  newGame,
  presentActors,
  talkTo,
  topicAvailability,
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
    expect(state.idols.mano?.stats.vocal).toBe(20);
    expect(state.shared.stamina).toBe(100);
    expect(state.money).toBe(3000);
    expect(state.actionsTaken).toBe(0);
  });

  it('applies activity costs, effects and duration', () => {
    const state = moveTo(newGame(1), 'practice_room');
    const next = applyActivity(state, 'vocal');
    expect(next.idols.mano?.stats.vocal).toBe(26);
    expect(next.money).toBe(2500);
    expect(next.shared.stamina).toBe(85);
    expect(next.shared.stress).toBe(8);
    expect(next.phase).toBe('activityResult');
    expect(next.actionsTaken).toBe(1);
    expect(formatClock(next.clock.absoluteMinutes)).toBe('10:15');
  });

  it('disables a lesson when money is not enough', () => {
    const state = moveTo(newGame(1), 'practice_room');
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
    const state = moveTo(newGame(1), 'practice_room');
    state.shared.stamina = 5;
    const activity = getActivity('vocal')!;
    const availability = activityAvailability(state, activity);
    expect(availability.ok).toBe(false);
    if (availability.ok) throw new Error('expected unavailable');
    expect(availability.display).toBe('disable');
    expect(availability.reason).toBe('体力不足（需要 15）');
  });

  it('shows resource-blocked actions as disabled with a reason', () => {
    const state = moveTo(newGame(1), 'practice_room');
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
    const next = moveTo(state, 'practice_room');
    expect(next.locationId).toBe('practice_room');
    expect(next.actionsTaken).toBe(state.actionsTaken);
    expect(next.clock.absoluteMinutes - state.clock.absoluteMinutes).toBe(15);

    const back = moveTo(next, 'office');
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
      state = moveTo(state, locationId);
      state = handleAction(state, 'look_around');
      expect(state.phase).toBe('activityResult');

      state = handleAction(state, 'continue');
      expect(state.phase).toBe('event');
      expect(state.pendingEventId).toBe(eventId);
    }
  });

  it('sleeps until 08:00 and restores stamina by hours slept', () => {
    let state = moveTo(newGame(1), 'home');
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

  it('marks the mid exam pending when time crosses day 2 20:00', () => {
    const state = newGame(1);
    const midAt = (MID_EXAM_DAY - 1) * MINUTES_PER_DAY + MID_EXAM_MINUTE;
    const advanced = advanceTime(state, midAt - START_MINUTE + 1);
    expect(advanced.pendingExam).toBe('mid');
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
    const state = advanceTime(moveTo(newGame(1), 'practice_room'), 13 * 60);
    const activity = getActivity('vocal')!;
    const availability = activityAvailability(state, activity);
    expect(availability.ok).toBe(false);
    if (availability.ok) throw new Error('expected unavailable');
    expect(availability.display).toBe('hide');
    expect(availability.reason).toBe('现在不能做');
  });

  it('hides actions outside their time windows', () => {
    const state = advanceTime(moveTo(newGame(1), 'practice_room'), 13 * 60);
    const labels = buildScene(state).actions.map((action) => action.label);
    expect(labels).not.toContain('声乐课');
    expect(labels).toContain('自由时间');
    expect(labels).toContain('环顾四周');
  });

  it('blocks sleep during the day and allows it at night', () => {
    const state = moveTo(newGame(1), 'home');
    const sleep = getActivity('sleep')!;
    const blocked = activityAvailability(state, sleep);
    expect(blocked.ok).toBe(false);
    if (blocked.ok) throw new Error('expected unavailable');
    expect(blocked.display).toBe('hide');
    expect(blocked.reason).toBe('现在不能做');

    const evening = advanceTime(state, 12 * 60);
    expect(activityAvailability(evening, sleep).ok).toBe(true);
  });

  it('opens the studio at 10:00 and blocks moving there earlier', () => {
    const morning = newGame(1);
    expect(isLocationOpen(morning, 'studio')).toBe(false);
    expect(moveTo(morning, 'studio').locationId).toBe('office');

    const ten = advanceTime(morning, 2 * 60);
    expect(isLocationOpen(ten, 'studio')).toBe(true);
    expect(moveTo(ten, 'studio').locationId).toBe('studio');
  });

  it('accepts typed action commands', () => {
    let state = newGame(1);
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
    const state = moveTo(newGame(1), 'practice_room');
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
    expect(trained.idols.mano?.stats.vocal).toBe(26);
    expect(trained.shared.stamina).toBe(85);
    expect(trained.pendingIdolId).toBe('mano');

    const left = handleCommand(entered, { type: 'leaveIdol' });
    expect(left.phase).toBe('plan');
  });

  it('trains a specific idol without changing the other', () => {
    const state = moveTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
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
    expect(trained.idols.hiori?.stats.vocal).toBe(26);
    expect(trained.idols.mano?.stats.vocal).toBe(20);
  });

  it('applies event effects to the context idol', () => {
    let state = moveTo(advanceTime(newGame(1), 2 * 60), 'practice_room');
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
    expect(next.idols.mano?.stats.vocal).toBe(28);
    expect(next.idols.mano?.stats.trust).toBe(6);
    expect(next.idols.hiori?.stats.vocal).toBe(20);
    expect(next.lastResult).toContain('樱木真乃');
  });

  it('checks event conditions against the target idol', () => {
    const state = newGame(1);
    state.idols.mano!.stats.trust = 5;
    state.idols.hiori!.stats.trust = 15;
    const condition = {
      kind: 'statAtLeast',
      stat: 'trust',
      value: 10,
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
    state = moveTo(state, 'practice_room');
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

  it('hides actions and closed tabs after hours', () => {
    const midnight = advanceTime(newGame(1), 16 * 60);
    expect(isLocationOpen(midnight, 'office')).toBe(false);

    const scene = buildScene(midnight);
    expect(scene.actions).toHaveLength(0);
    expect(scene.blocks.some((block) => block.text.includes('关门'))).toBe(true);
    expect(
      (scene.locations ?? [])
        .filter((location) => location.current || location.open)
        .map((location) => location.id),
    ).toEqual(['office', 'home']);
  });
});
