import { describe, expect, it } from 'vitest';
import { createInitialIdolStates } from './contentIndex';
import { buildScene } from './scene';
import {
  activityAvailability,
  enterIdol,
  getActivity,
  newGame,
  presentActors,
} from './sim';

describe('idol status', () => {
  it('starts Mano recruited and the other idols unknown', () => {
    const state = newGame(1);
    expect(state.idols.mano?.status).toBe('recruited');
    expect(state.idols.hiori?.status).toBe('unknown');
    expect(state.idols.meguru?.status).toBe('unknown');
  });

  it('creates the same initial statuses', () => {
    const idols = createInitialIdolStates();
    expect(idols.mano?.status).toBe('recruited');
    expect(idols.hiori?.status).toBe('unknown');
    expect(idols.meguru?.status).toBe('unknown');
  });

  it('does not expose Hiori or Meguru as present actors before recruitment', () => {
    const state = newGame(1);
    state.clock.absoluteMinutes = 12 * 60;
    state.locationId = 'practice_room';
    expect(
      presentActors(state).some((actor) => actor.id === 'hiori'),
    ).toBe(false);
    expect(
      presentActors(state).some((actor) => actor.id === 'meguru'),
    ).toBe(false);
  });

  it('rejects entering an unknown idol', () => {
    const state = newGame(1);
    state.clock.absoluteMinutes = 12 * 60;
    state.locationId = 'practice_room';
    expect(enterIdol(state, 'hiori')).toBe(state);
    expect(enterIdol(state, 'meguru')).toBe(state);
  });

  it('hides free time when the active idol is not recruited', () => {
    const state = newGame(1);
    state.idols.mano!.status = 'unknown';
    state.clock.absoluteMinutes = 12 * 60;
    state.locationId = 'office';
    expect(activityAvailability(state, getActivity('free')!, 'mano').ok).toBe(
      false,
    );
    expect(
      activityAvailability(state, getActivity('free')!, 'mano'),
    ).toMatchObject({ display: 'hide' });
  });

  it('moves free time from the plan page to the present idol page', () => {
    const state = newGame(1);
    state.clock.absoluteMinutes = 12 * 60;
    state.locationId = 'office';
    expect(activityAvailability(state, getActivity('free')!, 'mano').ok).toBe(
      false,
    );
    expect(buildScene(state).actions.some((action) => action.id === 'free')).toBe(
      false,
    );

    state.locationId = 'practice_room';
    const idolPage = enterIdol(state, 'mano');
    expect(buildScene(idolPage).actions.some((action) => action.id === 'free')).toBe(
      true,
    );
  });
});
