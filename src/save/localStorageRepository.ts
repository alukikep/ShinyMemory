import type { SaveEnvelope } from '../core/types';
import type { SaveRepository } from './repository';
import { migrateSave } from './save';
import { buildSlotMeta } from './slots';
import type { SaveSlotMeta } from './slots';
import type { StorageLike } from './storage';
import { CONTENT_EPOCH, SAVE_VERSION } from './version';

export const SAVE_KEY = 'shiny-memory.save.v1';
export const SLOT_INDEX_KEY = 'shiny-memory.slots.v1';
export const SLOT_KEY_PREFIX = 'shiny-memory.slot.';
/** 旧版单一手动存档，用于自动迁移。 */
export const LEGACY_MANUAL_SAVE_KEY = 'shiny-memory.save.manual.v1';

function defaultStorage(): StorageLike | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

function slotKey(id: string): string {
  return `${SLOT_KEY_PREFIX}${id}`;
}

export class LocalStorageRepository implements SaveRepository {
  constructor(private readonly storage: StorageLike | null = defaultStorage()) {}

  private read(key: string): SaveEnvelope | null {
    if (!this.storage) return null;
    const raw = this.storage.getItem(key);
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

  load(): SaveEnvelope | null {
    return this.read(SAVE_KEY);
  }

  save(envelope: SaveEnvelope): void {
    this.storage?.setItem(SAVE_KEY, JSON.stringify(envelope));
  }

  clear(): void {
    this.storage?.removeItem(SAVE_KEY);
  }

  private readIndex(): SaveSlotMeta[] {
    if (!this.storage) return [];
    const raw = this.storage.getItem(SLOT_INDEX_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (entry): entry is SaveSlotMeta =>
          !!entry &&
          typeof entry === 'object' &&
          typeof (entry as SaveSlotMeta).id === 'string' &&
          typeof (entry as SaveSlotMeta).label === 'string',
      );
    } catch {
      return [];
    }
  }

  private writeIndex(slots: SaveSlotMeta[]): void {
    this.storage?.setItem(SLOT_INDEX_KEY, JSON.stringify(slots));
  }

  /** 旧版单一手动存档自动升级为一个槽位，只做一次。 */
  private migrateLegacyManual(): void {
    if (!this.storage) return;
    if (!this.storage.getItem(LEGACY_MANUAL_SAVE_KEY)) return;
    const legacy = this.read(LEGACY_MANUAL_SAVE_KEY);
    if (legacy) {
      const slots = this.readIndex();
      if (!slots.some((slot) => slot.id === 'legacy')) {
        const meta = buildSlotMeta('legacy', '旧手动存档', legacy);
        this.storage.setItem(slotKey('legacy'), JSON.stringify(legacy));
        this.writeIndex([meta, ...slots]);
      }
    }
    this.storage.removeItem(LEGACY_MANUAL_SAVE_KEY);
  }

  listSlots(): SaveSlotMeta[] {
    this.migrateLegacyManual();
    return this.readIndex().sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
    );
  }

  loadSlot(id: string): SaveEnvelope | null {
    return this.read(slotKey(id));
  }

  saveSlot(
    id: string,
    label: string,
    envelope: SaveEnvelope,
  ): SaveSlotMeta {
    const meta = buildSlotMeta(id, label, envelope);
    this.storage?.setItem(slotKey(id), JSON.stringify(envelope));
    const slots = this.readIndex().filter((slot) => slot.id !== id);
    this.writeIndex([meta, ...slots]);
    return meta;
  }

  deleteSlot(id: string): void {
    this.storage?.removeItem(slotKey(id));
    this.writeIndex(this.readIndex().filter((slot) => slot.id !== id));
  }
}
