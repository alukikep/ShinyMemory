import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import {
  applyActivity,
  checkCondition,
  checkPendingEvents,
  getVar,
  newGame,
  travelMinutes,
  travelTo,
} from './sim';
import type { ActivityDef, EquipDef, EventDef, GameState } from './types';

const registered: string[] = [];

function registerEvent(event: EventDef): EventDef {
  CONTENT_INDEX.events.set(event.id, event);
  registered.push(event.id);
  return event;
}

afterEach(() => {
  for (const id of registered.splice(0)) {
    CONTENT_INDEX.events.delete(id);
    CONTENT_INDEX.activities.delete(id);
  }
});

function run(state: GameState, effects: ActivityDef['effects']): GameState {
  const id = `test.var.${registered.length}`;
  const activity: ActivityDef = {
    id,
    name: id,
    description: '',
    kind: 'rest',
    locations: ['practice_room'],
    durationMinutes: 1,
    timeWindows: [{ fromMinute: 8 * 60, toMinute: 22 * 60 }],
    cost: {},
    effects,
    resultTexts: ['好。'],
  };
  CONTENT_INDEX.activities.set(id, activity);
  registered.push(id);
  return applyActivity(state, id);
}

function base(): GameState {
  return travelTo(newGame(1), 'practice_room');
}

describe('vars', () => {
  it('reads an unwritten key as zero', () => {
    expect(getVar(newGame(1), 'farm.clearing')).toBe(0);
  });

  it('adds and sets', () => {
    let state = run(base(), [{ kind: 'var', key: 'farm.clearing', op: 'set', value: 100 }]);
    expect(getVar(state, 'farm.clearing')).toBe(100);

    state = run(state, [{ kind: 'var', key: 'farm.clearing', value: -40 }]);
    expect(getVar(state, 'farm.clearing')).toBe(60);
  });

  it('allows negative values', () => {
    const state = run(base(), [{ kind: 'var', key: 'debt.count', value: -3 }]);
    expect(getVar(state, 'debt.count')).toBe(-3);
  });

  it('compares against thresholds', () => {
    const state = run(base(), [{ kind: 'var', key: 'cafe.buns', op: 'set', value: 200 }]);

    expect(
      checkCondition({ kind: 'varAtLeast', key: 'cafe.buns', value: 200 }, state),
    ).toBe(true);
    expect(
      checkCondition({ kind: 'varAtLeast', key: 'cafe.buns', value: 201 }, state),
    ).toBe(false);
    expect(
      checkCondition({ kind: 'varAtMost', key: 'cafe.buns', value: 200 }, state),
    ).toBe(true);
  });
});

describe('delayed events', () => {
  const promo: EventDef = {
    id: 'test.var.promo',
    title: '完工',
    when: [],
    text: '完工了。',
    choices: [{ label: '好', effects: [], result: '好。' }],
  };

  it('queues the event at today + inDays', () => {
    registerEvent(promo);
    const state = run(base(), [
      { kind: 'scheduleEvent', eventId: promo.id, inDays: 7 },
    ]);

    expect(state.pendingEvents).toEqual([{ eventId: promo.id, day: 8 }]);
  });

  it('fires once on the due day and leaves the queue', () => {
    registerEvent(promo);
    const state = run(base(), [
      { kind: 'scheduleEvent', eventId: promo.id, inDays: 7 },
    ]);

    const early = structuredClone(state);
    early.clock.absoluteMinutes = 6 * 1440 + 12 * 60;
    expect(checkPendingEvents(early).event).toBeNull();

    const due = structuredClone(state);
    due.clock.absoluteMinutes = 7 * 1440 + 12 * 60;
    const fired = checkPendingEvents(due);
    expect(fired.event?.id).toBe(promo.id);
    expect(fired.state.phase).toBe('event');
    expect(fired.state.pendingEvents).toEqual([]);
  });

  it('drops an event id that no longer exists', () => {
    const state = run(base(), [
      { kind: 'scheduleEvent', eventId: 'test.var.missing', inDays: 0 },
    ]);

    const next = checkPendingEvents(state);
    expect(next.event).toBeNull();
  });

  it('keeps other queued events when one fires', () => {
    registerEvent(promo);
    const state = run(base(), [
      { kind: 'scheduleEvent', eventId: promo.id, inDays: 1 },
      { kind: 'scheduleEvent', eventId: promo.id, inDays: 5 },
    ]);

    const due = structuredClone(state);
    due.clock.absoluteMinutes = 1440 + 12 * 60;
    const fired = checkPendingEvents(due);

    expect(fired.event?.id).toBe(promo.id);
    expect(fired.state.pendingEvents).toHaveLength(1);
    expect(fired.state.pendingEvents?.[0]?.day).toBe(6);
  });
});

describe('travel through the modifier pipeline', () => {
  const boots: EquipDef = {
    id: 'test.travel.boots',
    name: '轻便鞋',
    slot: 'charm',
    description: '',
    modifiers: [{ key: 'travel', value: 0.5 }],
  };

  it('keeps the base minutes when nothing modifies travel', () => {
    expect(travelMinutes(newGame(1), 8)).toBe(8);
  });

  it('shortens travel when a modifier is equipped', () => {
    CONTENT_INDEX.equips.set(boots.id, boots);
    try {
      const state = newGame(1);
      state.ownedEquips = [boots.id];
      state.equipment = { charm1: boots.id };

      expect(travelMinutes(state, 8)).toBe(4);
    } finally {
      CONTENT_INDEX.equips.delete(boots.id);
    }
  });
});

describe('content state end to end', () => {
  it('clears a field, unlocks the next step, and finishes an upgrade on schedule', () => {
    const finisher: EventDef = {
      id: 'test.state.done',
      title: '围栏完工',
      when: [],
      text: '围栏修好了。',
      choices: [
        {
          label: '好',
          effects: [{ kind: 'var', key: 'test.farm.fence', op: 'set', value: 1 }],
          result: '好。',
        },
      ],
    };
    CONTENT_INDEX.events.set(finisher.id, finisher);
    registered.push(finisher.id);

    // 清地：100 → 60 → 20 → 0
    let state = run(base(), [
      { kind: 'var', key: 'test.farm.clearing', op: 'set', value: 100 },
    ]);
    for (let i = 0; i < 2; i += 1) {
      state = run(state, [
        { kind: 'var', key: 'test.farm.clearing', value: -50 },
      ]);
    }
    expect(getVar(state, 'test.farm.clearing')).toBe(0);
    expect(
      checkCondition(
        { kind: 'varAtMost', key: 'test.farm.clearing', value: 0 },
        state,
      ),
    ).toBe(true);

    // 清完才能修围栏，修完两天后完工
    state = run(state, [
      { kind: 'scheduleEvent', eventId: finisher.id, inDays: 2 },
    ]);
    expect(state.pendingEvents).toHaveLength(1);

    const due = structuredClone(state);
    due.clock.absoluteMinutes = 2 * 1440 + 12 * 60;
    const fired = checkPendingEvents(due);
    expect(fired.event?.id).toBe(finisher.id);
    expect(fired.state.pendingEvents).toEqual([]);
  });
});
