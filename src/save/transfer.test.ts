import { describe, expect, it } from 'vitest';
import { newGame } from '../core/sim';
import { createSaveEnvelope } from './save';
import { exportSaveText, parseSaveText } from './transfer';

describe('save transfer', () => {
  it('round-trips a save through export and import', () => {
    const envelope = createSaveEnvelope(newGame(7));
    envelope.state.locationId = 'park';

    const result = parseSaveText(exportSaveText(envelope));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.envelope.state.locationId).toBe('park');
      expect(result.envelope.schemaVersion).toBe(envelope.schemaVersion);
    }
  });

  it('rejects text that is not JSON', () => {
    expect(parseSaveText('not json').ok).toBe(false);
  });

  it('rejects a save from another content epoch', () => {
    const envelope = createSaveEnvelope(newGame(1));
    const result = parseSaveText(
      JSON.stringify({ ...envelope, contentEpoch: 99 }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a save from a newer schema version', () => {
    const envelope = createSaveEnvelope(newGame(1));
    const result = parseSaveText(
      JSON.stringify({ ...envelope, schemaVersion: 999 }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects an object without state', () => {
    expect(parseSaveText(JSON.stringify({ schemaVersion: 14 })).ok).toBe(false);
  });
});
