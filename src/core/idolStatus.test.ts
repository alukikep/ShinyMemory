import { describe, expect, it } from 'vitest';
import { createInitialIdolStates } from './contentIndex';
import { enterIdol, newGame, presentActors } from './sim';

describe('idol status', () => {
  it('starts Mano recruited and Hiori unknown', () => {
    const state = newGame(1);
    expect(state.idols.mano?.status).toBe('recruited');
    expect(state.idols.hiori?.status).toBe('unknown');
  });

  it('creates the same initial statuses', () => {
    const idols = createInitialIdolStates();
    expect(idols.mano?.status).toBe('recruited');
    expect(idols.hiori?.status).toBe('unknown');
  });

  it('does not expose Hiori as a present actor before recruitment', () => {
    const state = newGame(1);
    state.clock.absoluteMinutes = 12 * 60;
    state.locationId = 'practice_room';
    expect(
      presentActors(state).some((actor) => actor.id === 'hiori'),
    ).toBe(false);
  });

  it('rejects entering an unknown idol', () => {
    const state = newGame(1);
    state.clock.absoluteMinutes = 12 * 60;
    state.locationId = 'practice_room';
    expect(enterIdol(state, 'hiori')).toBe(state);
  });
});
