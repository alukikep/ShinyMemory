import { describe, expect, it } from 'vitest';
import { getActorLocation, isActorPresent, newGame } from './sim';
import type { ActorDef } from './types';

const homeActor: ActorDef = {
  id: 'home-idol',
  name: '在家偶像',
  role: 'idol',
  description: '',
  schedule: [
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      label: '回家',
    },
  ],
  topics: [],
};

describe('idol home schedules', () => {
  it('treats home as the idol own home, not a public location', () => {
    expect(getActorLocation(homeActor, 18 * 60)).toBeUndefined();
  });

  it('does not make the idol present in the producer home', () => {
    const state = newGame(1);
    state.phase = 'plan';
    state.locationId = 'home';
    state.clock.absoluteMinutes = 18 * 60;
    expect(isActorPresent(state, homeActor)).toBe(false);
  });
});
