import { afterEach, describe, expect, it } from 'vitest';
import { CONTENT_INDEX } from './contentIndex';
import {
  checkForEvent,
  checkScheduledEvent,
  moveTo,
  newGame,
  takeTransit,
  travelTo,
} from './sim';
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
    const index = CONTENT_INDEX.globalEvents.findIndex(
      (event) => event.id === id,
    );
    if (index >= 0) CONTENT_INDEX.globalEvents.splice(index, 1);
  }
});

const CHOICES: EventDef['choices'] = [
  { label: '好', effects: [], result: '好。' },
];

function arrivalEvent(
  id: string,
  overrides: Partial<EventDef> = {},
): EventDef {
  return register({
    id,
    title: id,
    when: [],
    entry: { kind: 'arrival' },
    text: `${id} 发生了。`,
    choices: CHOICES,
    ...overrides,
  });
}

function base(): GameState {
  const state = newGame(7);
  state.pendingDialogueId = undefined;
  return state;
}

describe('arrival events', () => {
  it('fires when you arrive at the location', () => {
    const id = 'test.arrival.park';
    arrivalEvent(id, {
      when: [{ kind: 'atLocation', locationId: 'park' }],
    });

    const moved = moveTo(base(), 'park');
    expect(moved.locationId).toBe('park');
    expect(moved.phase).toBe('event');
    expect(moved.pendingEventId).toBe(id);
  });

  it('ignores other locations', () => {
    const id = 'test.arrival.park_only';
    arrivalEvent(id, {
      when: [{ kind: 'atLocation', locationId: 'park' }],
    });

    const moved = moveTo(base(), 'station');
    expect(moved.locationId).toBe('station');
    expect(moved.phase).toBe('plan');
    expect(moved.pendingEventId).toBeUndefined();
  });

  it('respects when conditions', () => {
    const id = 'test.arrival.gated';
    arrivalEvent(id, { when: [{ kind: 'dayAtLeast', day: 3 }] });

    expect(moveTo(base(), 'park').phase).toBe('plan');
  });

  it('does not let action-pool events fire on arrival', () => {
    const id = 'test.arrival.action_pool';
    const event = register({
      id,
      title: id,
      when: [],
      priority: 999,
      text: `${id} 发生了。`,
      choices: CHOICES,
    });
    // 让它同时出现在行动后随机池里
    CONTENT_INDEX.globalEvents.push(event);

    const atOffice = base();
    expect(checkForEvent(atOffice).event?.id).toBe(id);

    const moved = moveTo(atOffice, 'park');
    expect(moved.phase).toBe('plan');
    expect(moved.pendingEventId).toBeUndefined();
  });

  it('stops a multi-hop walk at the hop that triggered it', () => {
    const id = 'test.arrival.midway';
    arrivalEvent(id, {
      when: [{ kind: 'atLocation', locationId: 'practice_room' }],
    });

    // office → station → practice_room → studio
    const moved = travelTo(base(), 'studio');
    expect(moved.locationId).toBe('practice_room');
    expect(moved.phase).toBe('event');
    expect(moved.pendingEventId).toBe(id);
  });

  it('settles a scheduled event whose minute passed while walking', () => {
    const id = 'test.arrival.scheduled';
    register({
      id,
      title: id,
      when: [],
      trigger: { weekday: getWeekdayFromDay(1), atMinute: 8 * 60 + 4 },
      text: `${id} 发生了。`,
      choices: CHOICES,
    });

    const atEight = base();
    expect(checkScheduledEvent(atEight).event).toBeNull();

    // 走到公园 8 分钟，08:04 的触发点已经过了
    const moved = moveTo(atEight, 'park');
    expect(moved.phase).toBe('event');
    expect(moved.pendingEventId).toBe(id);
  });

  it('fires a once arrival event only once', () => {
    const id = 'test.arrival.once';
    arrivalEvent(id, { once: true });

    const first = moveTo(base(), 'park');
    expect(first.phase).toBe('event');

    const second = moveTo(
      {
        ...structuredClone(first),
        phase: 'plan',
        pendingEventId: undefined,
        locationId: 'office',
      },
      'park',
    );
    expect(second.phase).toBe('plan');
  });

  it('also fires after a transit ride', () => {
    const id = 'test.arrival.transit';
    arrivalEvent(id, {
      when: [{ kind: 'atLocation', locationId: 'park' }],
    });

    const moved = takeTransit(base(), 'taxi_office_park');
    expect(moved.locationId).toBe('park');
    expect(moved.phase).toBe('event');
    expect(moved.pendingEventId).toBe(id);
  });
});
