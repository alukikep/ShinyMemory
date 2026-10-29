import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import { checkScheduledEvent, newGame } from './sim';
import { getWeekdayFromDay } from './time';
import type { EventDef, GameState } from './types';

const registered: string[] = [];

function register(event: EventDef): EventDef {
  CONTENT_INDEX.events.set(event.id, event);
  registered.push(event.id);
  return event;
}

afterEach(() => {
  for (const id of registered.splice(0)) {
    CONTENT_INDEX.events.delete(id);
  }
});

function makeEvent(id: string, trigger: EventDef['trigger']): EventDef {
  return register({
    id,
    title: id,
    when: [],
    trigger,
    text: `${id} 发生了。`,
    choices: [{ label: '好', effects: [], result: '好。' }],
  });
}

function at(state: GameState, day: number, minute: number): GameState {
  const next = structuredClone(state);
  next.clock.absoluteMinutes = (day - 1) * 1440 + minute;
  next.phase = 'plan';
  next.pendingEventId = undefined;
  return next;
}

function fired(state: GameState): string | undefined {
  return checkScheduledEvent(state).event?.id;
}

describe('scheduled events', () => {
  it('waits for the minute and fires once per day', () => {
    const id = 'test.scheduled.daily';
    makeEvent(id, { weekday: getWeekdayFromDay(1), atMinute: 9 * 60 });
    const base = newGame(1);

    expect(fired(at(base, 1, 8 * 60 + 30))).not.toBe(id);

    const hit = checkScheduledEvent(at(base, 1, 9 * 60));
    expect(hit.event?.id).toBe(id);
    expect(hit.state.scheduledDays?.[id]).toBe(1);
    expect(hit.state.phase).toBe('event');

    const again = checkScheduledEvent(at(hit.state, 1, 15 * 60));
    expect(again.event?.id).not.toBe(id);
  });

  it('supports every N days', () => {
    const id = 'test.scheduled.every3';
    makeEvent(id, { everyDays: 3, atMinute: 0 });
    const base = newGame(1);

    expect(fired(at(base, 1, 12 * 60))).toBe(id);
    expect(fired(at(base, 2, 12 * 60))).not.toBe(id);
    expect(fired(at(base, 4, 12 * 60))).toBe(id);
  });

  it('fires after sleeping past the trigger time', () => {
    const id = 'test.scheduled.sleep';
    makeEvent(id, { weekday: getWeekdayFromDay(4), atMinute: 7 * 60 });
    const base = newGame(1);

    // 第 4 天 09:00 才醒，7:00 的触发点已经过了，仍然补触发一次
    expect(fired(at(base, 4, 9 * 60))).toBe(id);
  });

  it('ignores a trigger on the wrong weekday', () => {
    const id = 'test.scheduled.weekday';
    makeEvent(id, { weekday: getWeekdayFromDay(2), atMinute: 0 });
    const base = newGame(1);

    expect(fired(at(base, 1, 12 * 60))).not.toBe(id);
  });

  it('respects when conditions', () => {
    const id = 'test.scheduled.gated';
    register({
      id,
      title: id,
      when: [{ kind: 'moneyAtLeast', value: 999999 }],
      trigger: { weekday: getWeekdayFromDay(1), atMinute: 0 },
      text: '不该发生。',
      choices: [{ label: '好', effects: [], result: '好。' }],
    });

    expect(fired(at(newGame(1), 1, 12 * 60))).not.toBe(id);
  });
});
