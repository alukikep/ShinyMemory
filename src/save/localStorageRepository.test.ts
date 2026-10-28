import { describe, expect, it } from 'vitest';
import { newGame } from '../core/sim';
import {
  LocalStorageRepository,
  MANUAL_SAVE_KEY,
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
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.idols.mano?.stats.vocal.rank).toBe('D');
    expect(loaded?.state.idols.hiori?.stats.vocal.rank).toBe('F');
    expect(loaded?.state.shared.stamina).toBe(100);
    expect(loaded?.state.actors.hazuki?.affinity).toBe(0);
    expect(loaded?.state.actors.tsutomu?.affinity).toBe(0);
    expect(loaded?.state.actors.mano?.affinity).toBe(0);
    expect(loaded?.state.actors.hiori?.affinity).toBe(0);
  });

  it('migrates a v1 save to the time system', () => {
    const storage = new MemoryStorage();
    const legacyState = newGame(1) as unknown as Record<string, unknown>;
    delete legacyState.locationId;
    delete legacyState.clock;
    legacyState.week = 3;
    legacyState.slot = 1;
    legacyState.log = [];
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        contentEpoch: 3,
        gameVersion: '0.2.0',
        createdAt: '2026-10-24T00:00:00.000Z',
        state: legacyState,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.locationId).toBe('office');
    expect(loaded?.state.clock.absoluteMinutes).toBe(8 * 60);
    expect(loaded?.state.actors.hazuki?.affinity).toBe(0);
    expect(loaded?.state.actors.tsutomu?.affinity).toBe(0);
    expect(loaded?.state.actors.mano?.affinity).toBe(0);
  });

  it('migrates a v3 save by adding actors', () => {
    const storage = new MemoryStorage();
    const state = newGame(1) as unknown as Record<string, unknown>;
    delete state.actors;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 3,
        contentEpoch: 3,
        gameVersion: '0.4.0',
        createdAt: '2026-10-24T00:00:00.000Z',
        state,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.actors.hazuki?.affinity).toBe(0);
    expect(loaded?.state.actors.tsutomu?.affinity).toBe(0);
    expect(loaded?.state.actors.mano?.affinity).toBe(0);
  });

  it('migrates a v4 save by adding actors and splitting idol stats', () => {
    const storage = new MemoryStorage();
    const state = newGame(1) as unknown as Record<string, unknown>;
    const actors = state.actors as Record<string, { affinity: number }>;
    actors.hazuki.affinity = 3;
    delete actors.tsutomu;
    delete state.shared;
    delete state.idols;
    delete state.selectedIdolId;
    state.stats = {
      vocal: 24,
      dance: 25,
      expression: 26,
      stamina: 88,
      stress: 12,
      trust: 7,
    };
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 4,
        contentEpoch: 3,
        gameVersion: '0.5.0',
        createdAt: '2026-10-24T00:00:00.000Z',
        state,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.actors.hazuki?.affinity).toBe(3);
    expect(loaded?.state.actors.tsutomu?.affinity).toBe(0);
    expect(loaded?.state.actors.mano?.affinity).toBe(0);
    expect(loaded?.state.shared.stamina).toBe(88);
    expect(loaded?.state.shared.stress).toBe(12);
    expect(loaded?.state.idols.mano?.stats.vocal.rank).toBe('D');
    expect(loaded?.state.idols.mano?.stats.trust.rank).toBe('E');
  });

  it('migrates a v6 save by adding the idol actor', () => {
    const storage = new MemoryStorage();
    const state = newGame(1) as unknown as Record<string, unknown>;
    const actors = state.actors as Record<string, { affinity: number }>;
    delete actors.mano;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 6,
        contentEpoch: 3,
        gameVersion: '0.7.0',
        createdAt: '2026-10-24T00:00:00.000Z',
        state,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.actors.mano?.affinity).toBe(0);
  });

  it('migrates a v7 save by adding the second idol', () => {
    const storage = new MemoryStorage();
    const state = newGame(1) as unknown as Record<string, unknown>;
    const actors = state.actors as Record<string, { affinity: number }>;
    const idols = state.idols as Record<string, unknown>;
    delete actors.hiori;
    delete idols.hiori;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 7,
        contentEpoch: 3,
        gameVersion: '0.8.0',
        createdAt: '2026-10-24T00:00:00.000Z',
        state,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.actors.hiori?.affinity).toBe(0);
    expect(loaded?.state.idols.hiori?.stats.vocal.rank).toBe('F');
  });

  it('migrates a v9 numeric save to ranks', () => {
    const storage = new MemoryStorage();
    const state = newGame(1) as unknown as Record<string, unknown>;
    const idols = state.idols as Record<
      string,
      { stats: Record<string, number> }
    >;
    idols.mano.stats = {
      vocal: 24,
      dance: 25,
      expression: 26,
      trust: 7,
    };
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 9,
        contentEpoch: 3,
        gameVersion: '0.10.0',
        createdAt: '2026-10-24T00:00:00.000Z',
        state,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.idols.mano?.stats.vocal.rank).toBe('D');
    expect(loaded?.state.idols.mano?.stats.trust.rank).toBe('E');
  });

  it('migrates a v10 save by adding inventory state', () => {
    const storage = new MemoryStorage();
    const state = newGame(1) as unknown as Record<string, unknown>;
    delete state.inventory;
    delete state.shopPurchases;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 10,
        contentEpoch: 3,
        gameVersion: '0.11.0',
        createdAt: '2026-10-26T00:00:00.000Z',
        state,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.inventory).toEqual({});
    expect(loaded?.state.shopPurchases).toEqual({});
  });

  it('migrates a v11 save by marking all existing idols recruited', () => {
    const storage = new MemoryStorage();
    const state = newGame(1) as unknown as Record<string, unknown>;
    delete state.storyChains;
    delete state.pendingDialogueId;
    delete state.dialogueNodeId;
    delete state.dialogueTargetIdolId;
    const idols = state.idols as Record<string, Record<string, unknown>>;
    delete idols.mano.status;
    delete idols.hiori.status;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        schemaVersion: 11,
        contentEpoch: 3,
        gameVersion: '0.12.0',
        createdAt: '2026-10-27T00:00:00.000Z',
        state,
      }),
    );

    const loaded = new LocalStorageRepository(storage).load();
    expect(loaded?.schemaVersion).toBe(13);
    expect(loaded?.state.idols.mano?.status).toBe('recruited');
    expect(loaded?.state.idols.hiori?.status).toBe('recruited');
    expect(loaded?.state.storyChains).toEqual({});
  });
  it('rejects saves from another content epoch', () => {
    const storage = new MemoryStorage();
    const envelope = createSaveEnvelope(newGame(1));
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...envelope, contentEpoch: 99 }),
    );
    expect(new LocalStorageRepository(storage).load()).toBeNull();
  });

  it('rejects saves without a content epoch', () => {
    const storage = new MemoryStorage();
    const envelope = createSaveEnvelope(newGame(1)) as unknown as Record<
      string,
      unknown
    >;
    delete envelope.contentEpoch;
    storage.setItem(SAVE_KEY, JSON.stringify(envelope));
    expect(new LocalStorageRepository(storage).load()).toBeNull();
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

  it('keeps manual save separate from autosave', () => {
    const storage = new MemoryStorage();
    const repo = new LocalStorageRepository(storage);
    const manual = createSaveEnvelope(newGame(2));
    manual.state.clock.absoluteMinutes = 3 * 1440 + 12 * 60;
    repo.saveManual(manual);
    repo.save(createSaveEnvelope(newGame(3)));

    expect(repo.load()?.state.clock.absoluteMinutes).toBe(8 * 60);
    expect(repo.loadManual()?.state.clock.absoluteMinutes).toBe(
      3 * 1440 + 12 * 60,
    );
  });

  it('rejects a manual save from another content epoch', () => {
    const storage = new MemoryStorage();
    const envelope = createSaveEnvelope(newGame(1));
    storage.setItem(
      MANUAL_SAVE_KEY,
      JSON.stringify({ ...envelope, contentEpoch: 99 }),
    );
    expect(new LocalStorageRepository(storage).loadManual()).toBeNull();
  });

  it('clears the manual save without touching autosave', () => {
    const storage = new MemoryStorage();
    const repo = new LocalStorageRepository(storage);
    repo.save(createSaveEnvelope(newGame(1)));
    repo.saveManual(createSaveEnvelope(newGame(2)));
    repo.clearManual();
    expect(repo.loadManual()).toBeNull();
    expect(repo.load()).not.toBeNull();
  });

  it('clears the save', () => {
    const repo = new LocalStorageRepository(new MemoryStorage());
    repo.save(createSaveEnvelope(newGame(1)));
    repo.clear();
    expect(repo.load()).toBeNull();
  });
});
