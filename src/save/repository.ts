import type { SaveEnvelope } from '../core/types';
import type { SaveSlotMeta } from './slots';

export interface SaveRepository {
  load(): SaveEnvelope | null;
  save(envelope: SaveEnvelope): void;
  clear(): void;

  listSlots(): SaveSlotMeta[];
  loadSlot(id: string): SaveEnvelope | null;
  saveSlot(id: string, label: string, envelope: SaveEnvelope): SaveSlotMeta;
  deleteSlot(id: string): void;
}
