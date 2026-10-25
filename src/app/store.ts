import { create } from 'zustand';
import { MAX_DEBUG_DAY, MINUTES_PER_DAY, START_MINUTE } from '../core/config';
import {
  completeDueJobs,
  handleCommand,
  newGame,
  pruneScheduleOverrides,
} from '../core/sim';
import type { ActionCommand, GameState } from '../core/types';
import { LocalStorageRepository } from '../save/localStorageRepository';
import type { SaveRepository } from '../save/repository';
import { createSaveEnvelope } from '../save/save';

type GameStore = {
  state: GameState;
  act: (command: ActionCommand) => void;
  restart: () => void;
  debugForceEvent: (eventId: string) => void;
  debugJumpDay: (day: number) => void;
};

const repository: SaveRepository = new LocalStorageRepository();

function makeSeed(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0]!;
}

function initialState(): GameState {
  const saved = repository.load();
  if (saved) {
    pruneScheduleOverrides(saved.state);
    completeDueJobs(saved.state);
    return saved.state;
  }
  return newGame(makeSeed());
}

export const useGameStore = create<GameStore>((set) => ({
  state: initialState(),
  act: (command) =>
    set((previous) => {
      const next =
        command.type === 'restart'
          ? newGame(makeSeed())
          : handleCommand(previous.state, command);
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
  debugJumpDay: (day) =>
    set((previous) => {
      const next = structuredClone(previous.state);
      const safeDay = Math.max(1, Math.min(MAX_DEBUG_DAY, Math.round(day)));
      next.clock.absoluteMinutes = (safeDay - 1) * MINUTES_PER_DAY + START_MINUTE;
      pruneScheduleOverrides(next);
      completeDueJobs(next);
      next.phase = 'plan';
      next.pendingActivityId = undefined;
      next.pendingEventId = undefined;
      next.pendingExam = undefined;
      repository.save(createSaveEnvelope(next));
      return { state: next };
    }),
}));
