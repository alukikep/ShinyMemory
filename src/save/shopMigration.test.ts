import { describe, expect, it } from 'vitest';
import { newGame } from '../core/sim';
import { createSaveEnvelope, migrateSave } from './save';
import { SAVE_VERSION } from './version';

describe('shop cooldown save migration', () => {
  it('adds shopCooldowns to a v18 save', () => {
    const state = newGame(1);
    state.shopCooldowns = undefined;
    const envelope = createSaveEnvelope(state);
    envelope.schemaVersion = 18;

    const migrated = migrateSave(envelope);

    expect(migrated.schemaVersion).toBe(SAVE_VERSION);
    expect(migrated.state.shopCooldowns).toEqual({});
  });
});
