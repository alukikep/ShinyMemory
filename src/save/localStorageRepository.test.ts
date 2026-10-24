import { describe, expect, it } from 'vitest';
import { newGame } from '../core/sim';
import {
  LocalStorageRepository,
  SAVE_KEY,
} from './localStorageRepository';
import { MemoryStorage } from './memoryStorage';
import { createSaveEnvelope } from './save';

describe('LocalStorageRepository', () => {
  it('roundtrips a save', () => {
    const repo = new LocalStorageRepository(new MemoryStorage());
    repo.save(createSaveEnvelope(newGame(1)));

    const loaded = repo.load();
    expect(loaded).not.toBeNull();
    expect(loaded?.schemaVersion).toBe(1);
    expect(loaded?.state.stats.vocal).toBe(20);
  });

  it('returns null for invalid JSON', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, '{');
    const repo = new LocalStorageRepository(storage);
    expect(repo.load()).toBeNull();
  });

  it('returns null for an unknown schema version', () => {
    const storage = new MemoryStorage();
    const envelope = createSaveEnvelope(newGame(1));
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...envelope, schemaVersion: 99 }),
    );
    const repo = new LocalStorageRepository(storage);
    expect(repo.load()).toBeNull();
  });

  it('clears the save', () => {
    const repo = new LocalStorageRepository(new MemoryStorage());
    repo.save(createSaveEnvelope(newGame(1)));
    repo.clear();
    expect(repo.load()).toBeNull();
  });
});
