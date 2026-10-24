import type { SaveEnvelope } from '../core/types';

export interface SaveRepository {
  load(): SaveEnvelope | null;
  save(envelope: SaveEnvelope): void;
  clear(): void;
}
