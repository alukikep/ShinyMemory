import type { SaveEnvelope } from '../core/types';
import type { SaveRepository } from './repository';
import { migrateSave } from './save';
import type { StorageLike } from './storage';
import { CONTENT_EPOCH, SAVE_VERSION } from './version';

export const SAVE_KEY = 'shiny-memory.save.v1';

function defaultStorage(): StorageLike | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export class LocalStorageRepository implements SaveRepository {
  constructor(private readonly storage: StorageLike | null = defaultStorage()) {}

  load(): SaveEnvelope | null {
    if (!this.storage) return null;
    const raw = this.storage.getItem(SAVE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<SaveEnvelope>;
      if (!parsed || typeof parsed !== 'object') return null;
      if (typeof parsed.schemaVersion !== 'number') return null;
      if (parsed.schemaVersion > SAVE_VERSION) return null;
      if (parsed.contentEpoch !== CONTENT_EPOCH) return null;
      if (!parsed.state) return null;
      return migrateSave(parsed as SaveEnvelope);
    } catch {
      return null;
    }
  }

  save(envelope: SaveEnvelope): void {
    this.storage?.setItem(SAVE_KEY, JSON.stringify(envelope));
  }

  clear(): void {
    this.storage?.removeItem(SAVE_KEY);
  }
}
