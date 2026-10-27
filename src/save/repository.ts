import type { SaveEnvelope } from '../core/types';

export interface SaveRepository {
  load(): SaveEnvelope | null;
  loadManual(): SaveEnvelope | null;
  save(envelope: SaveEnvelope): void;
  saveManual(envelope: SaveEnvelope): void;
  clear(): void;
  clearManual(): void;
}
