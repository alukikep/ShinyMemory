import { describe, expect, it } from 'vitest';
import { createInitialIdolStates } from './contentIndex';
import { newGame } from './sim';

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
});
