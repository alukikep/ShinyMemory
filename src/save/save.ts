import type { GameState, SaveEnvelope } from '../core/types';
import { GAME_VERSION, SAVE_VERSION } from './version';

export function createSaveEnvelope(state: GameState): SaveEnvelope {
  return {
    schemaVersion: SAVE_VERSION,
    gameVersion: GAME_VERSION,
    createdAt: new Date().toISOString(),
    state,
  };
}

export function migrateSave(envelope: SaveEnvelope): SaveEnvelope {
  // v0.2 only has schema version 1. Future migrations go here.
  return envelope;
}
