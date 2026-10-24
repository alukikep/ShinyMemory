import { describe, expect, it } from 'vitest';
import { checkEventCandidates, newGame } from './sim';
import type { EventDef } from './types';

function makeEvent(overrides: Partial<EventDef> & { id: string }): EventDef {
  return {
    title: overrides.id,
    when: [],
    text: 'test',
    choices: [{ label: 'ok', effects: [], result: 'ok' }],
    ...overrides,
  };
}

describe('event trigger v2', () => {
  it('never triggers at chance 0, but still advances the RNG cursor', () => {
    const state = newGame(1);
    const event = makeEvent({ id: 'evt.test', chance: 0 });
    const result = checkEventCandidates(state, [event], {});
    expect(result.event).toBeNull();
    expect(result.state.rng.counter).toBeGreaterThan(state.rng.counter);
    expect(result.state.flags['seen:evt.test']).toBeUndefined();
  });

  it('always triggers at chance 1', () => {
    const state = newGame(1);
    const event = makeEvent({ id: 'evt.test', chance: 1 });
    const result = checkEventCandidates(state, [event], {});
    expect(result.event?.id).toBe('evt.test');
    expect(result.state.phase).toBe('event');
    expect(result.state.pendingEventId).toBe('evt.test');
  });

  it('respects after.ids', () => {
    const state = newGame(1);
    const event = makeEvent({
      id: 'evt.vocal',
      after: { ids: ['vocal'] },
      chance: 1,
    });
    const missed = checkEventCandidates(state, [event], {
      lastActivityId: 'dance',
      lastActivityKind: 'training',
    });
    expect(missed.event).toBeNull();

    const hit = checkEventCandidates(state, [event], {
      lastActivityId: 'vocal',
      lastActivityKind: 'training',
    });
    expect(hit.event?.id).toBe('evt.vocal');
  });

  it('respects after.kinds', () => {
    const state = newGame(1);
    const event = makeEvent({
      id: 'evt.training',
      after: { kinds: ['training'] },
      chance: 1,
    });
    const result = checkEventCandidates(state, [event], {
      lastActivityId: 'vocal',
      lastActivityKind: 'training',
    });
    expect(result.event?.id).toBe('evt.training');
  });

  it('does not mark once when chance fails', () => {
    const state = newGame(1);
    const event = makeEvent({ id: 'evt.once', chance: 0, once: true });
    const result = checkEventCandidates(state, [event], {});
    expect(result.event).toBeNull();
    expect(result.state.flags['seen:evt.once']).toBeUndefined();
  });

  it('blocks a once event that was already seen', () => {
    const state = newGame(1);
    state.flags['seen:evt.once'] = true;
    const event = makeEvent({ id: 'evt.once', chance: 1, once: true });
    const result = checkEventCandidates(state, [event], {});
    expect(result.event).toBeNull();
  });

  it('respects cooldownActions', () => {
    const event = makeEvent({
      id: 'evt.cooldown',
      chance: 1,
      cooldownActions: 3,
    });
    const state = newGame(1);
    state.actionsTaken = 5;
    state.eventCooldowns['evt.cooldown'] = 4;
    expect(checkEventCandidates(state, [event], {}).event).toBeNull();

    state.actionsTaken = 7;
    expect(checkEventCandidates(state, [event], {}).event?.id).toBe(
      'evt.cooldown',
    );
  });

  it('prefers the highest priority among passing events', () => {
    const state = newGame(1);
    const low = makeEvent({ id: 'evt.low', chance: 1, priority: 0 });
    const high = makeEvent({ id: 'evt.high', chance: 1, priority: 10 });
    const result = checkEventCandidates(state, [low, high], {});
    expect(result.event?.id).toBe('evt.high');
  });

  it('does not consume RNG when nothing is eligible', () => {
    const state = newGame(1);
    const event = makeEvent({
      id: 'evt.after',
      after: { ids: ['vocal'] },
      chance: 1,
    });
    const result = checkEventCandidates(state, [event], {
      lastActivityId: 'dance',
    });
    expect(result.event).toBeNull();
    expect(result.state.rng.counter).toBe(state.rng.counter);
  });
});
