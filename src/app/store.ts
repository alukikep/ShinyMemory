import { create } from 'zustand';
import { MAX_DEBUG_DAY, MINUTES_PER_DAY, START_MINUTE } from '../core/config';
import {
  completeDueJobs,
  getEvent,
  handleCommand,
  newGame,
  presentIdolIds,
  pruneScheduleOverrides,
} from '../core/sim';
import type { ActionCommand, GameState } from '../core/types';
import { LocalStorageRepository } from '../save/localStorageRepository';
import type { SaveRepository } from '../save/repository';
import { createSaveEnvelope } from '../save/save';

type GameStore = {
  state: GameState;
  manualSavedAt?: string;
  act: (command: ActionCommand) => void;
  restart: () => void;
  manualSave: () => string;
  manualLoad: () => boolean;
  debugForceEvent: (eventId: string) => void;
  debugJumpDay: (day: number) => void;
  debugJumpTo: (
    day: number,
    minuteOfDay: number,
    locationId?: string,
  ) => void;
  debugReset: (seed?: number) => void;
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

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialState(),
  manualSavedAt: repository.loadManual()?.createdAt,
  act: (command) =>
    set((previous) => {
      const next = handleCommand(previous.state, command);
      repository.save(createSaveEnvelope(next));
      return { state: next };
    }),
  restart: () => {
    const next = newGame(makeSeed());
    repository.save(createSaveEnvelope(next));
    set({ state: next });
  },
  manualSave: () => {
    const envelope = createSaveEnvelope(get().state);
    repository.saveManual(envelope);
    set({ manualSavedAt: envelope.createdAt });
    return envelope.createdAt;
  },
  manualLoad: () => {
    const saved = repository.loadManual();
    if (!saved) return false;
    pruneScheduleOverrides(saved.state);
    completeDueJobs(saved.state);
    repository.save(createSaveEnvelope(saved.state));
    set({ state: saved.state, manualSavedAt: saved.createdAt });
    return true;
  },
  debugForceEvent: (eventId) =>
    set((previous) => {
      const next = structuredClone(previous.state);
      // 强制事件绕过触发条件，但要补上参与者，否则 {a}/{b} 会是原样。
      const event = getEvent(eventId);
      const cast =
        event?.cast ??
        (event?.castSize ? presentIdolIds(next).slice(0, event.castSize) : []);
      next.phase = 'event';
      next.pendingEventId = eventId;
      next.pendingEventCast = cast.length > 1 ? cast : undefined;
      next.pendingEventIdolId = cast[0] ?? next.selectedIdolId;
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
      repository.save(createSaveEnvelope(next));
      return { state: next };
    }),
  debugJumpTo: (day, minuteOfDay, locationId) =>
    set((previous) => {
      const next = structuredClone(previous.state);
      const safeDay = Math.max(1, Math.min(MAX_DEBUG_DAY, Math.round(day)));
      const safeMinute = Math.max(
        0,
        Math.min(MINUTES_PER_DAY - 1, Math.round(minuteOfDay)),
      );
      next.clock.absoluteMinutes =
        (safeDay - 1) * MINUTES_PER_DAY + safeMinute;
      if (locationId) next.locationId = locationId;
      pruneScheduleOverrides(next);
      completeDueJobs(next);
      next.phase = 'plan';
      next.pendingActivityId = undefined;
      next.pendingEventId = undefined;
      repository.save(createSaveEnvelope(next));
      return { state: next };
    }),
  debugReset: (seed) => {
    const next = newGame(seed ?? makeSeed());
    repository.save(createSaveEnvelope(next));
    set({ state: next });
  },
}));
