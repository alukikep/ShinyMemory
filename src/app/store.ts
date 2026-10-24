import { create } from 'zustand';
import { MAX_WEEKS } from '../core/config';
import { handleAction, newGame } from '../core/sim';
import type { GameState } from '../core/types';
import { LocalStorageRepository } from '../save/localStorageRepository';
import type { SaveRepository } from '../save/repository';
import { createSaveEnvelope } from '../save/save';

type GameStore = {
  state: GameState;
  act: (actionId: string) => void;
  restart: () => void;
  debugForceEvent: (eventId: string) => void;
  debugJumpWeek: (week: number) => void;
};

const repository: SaveRepository = new LocalStorageRepository();

function makeSeed(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0]!;
}

function initialState(): GameState {
  const saved = repository.load();
  return saved?.state ?? newGame(makeSeed());
}

export const useGameStore = create<GameStore>((set) => ({
  state: initialState(),
  act: (actionId) =>
    set((previous) => {
      const next =
        actionId === 'restart'
          ? newGame(makeSeed())
          : handleAction(previous.state, actionId);
      repository.save(createSaveEnvelope(next));
      return { state: next };
    }),
  restart: () => {
    const next = newGame(makeSeed());
    repository.save(createSaveEnvelope(next));
    set({ state: next });
  },
  debugForceEvent: (eventId) =>
    set((previous) => {
      const next = structuredClone(previous.state);
      next.phase = 'event';
      next.pendingEventId = eventId;
      next.pendingActivityId = undefined;
      repository.save(createSaveEnvelope(next));
      return { state: next };
    }),
  debugJumpWeek: (week) =>
    set((previous) => {
      const next = structuredClone(previous.state);
      next.week = Math.max(1, Math.min(MAX_WEEKS, Math.round(week)));
      next.slot = 0;
      next.phase = 'plan';
      next.pendingActivityId = undefined;
      next.pendingEventId = undefined;
      repository.save(createSaveEnvelope(next));
      return { state: next };
    }),
}));
