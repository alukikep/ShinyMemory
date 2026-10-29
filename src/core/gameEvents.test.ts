import { afterEach, describe, expect, it } from 'vitest';
import { setGameEventSink } from './gameEvents';
import type { GameEvent } from './gameEvents';
import {
  advanceTime,
  applyActivity,
  applyAttributeExp,
  equipItem,
  newGame,
  travelTo,
} from './sim';

const events: GameEvent[] = [];

function capture(): void {
  setGameEventSink((event) => events.push(event));
}

afterEach(() => {
  setGameEventSink(undefined);
  events.length = 0;
});

describe('game event sink', () => {
  it('stays silent when nothing is registered', () => {
    const state = newGame(1);
    expect(() => advanceTime(state, 24 * 60)).not.toThrow();
    expect(events).toEqual([]);
  });

  it('reports a level up', () => {
    capture();
    const state = newGame(1);
    state.idols.mano!.stats.vocal.exp = 59;

    applyAttributeExp(state, 'vocal', 1, 'gain', 'mano');

    expect(events).toEqual([
      {
        kind: 'skillLevelUp',
        ref: { scope: 'idol', key: 'vocal' },
        rank: 'C',
        idolId: 'mano',
      },
    ]);
  });

  it('reports the new day', () => {
    capture();
    advanceTime(newGame(1), 24 * 60);
    expect(events).toEqual([{ kind: 'dayStarted', day: 2 }]);
  });

  it('reports equipment changes', () => {
    capture();
    const state = travelTo(newGame(1), 'practice_room');
    const granted = applyActivity(state, 'test_old_drawer');
    events.length = 0;

    equipItem(granted, 'equip.test.watch');
    expect(events[0]).toEqual({
      kind: 'equipChanged',
      slot: 'charm1',
      equipId: 'equip.test.watch',
    });
  });

  it('survives a throwing sink', () => {
    setGameEventSink(() => {
      throw new Error('boom');
    });
    const state = newGame(1);
    state.idols.mano!.stats.vocal.exp = 59;

    expect(() => applyAttributeExp(state, 'vocal', 1, 'gain', 'mano')).not.toThrow();
    expect(state.idols.mano!.stats.vocal.rank).toBe('C');
  });
});
