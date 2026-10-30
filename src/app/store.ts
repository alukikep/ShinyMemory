import { create } from 'zustand';
import { MAX_DEBUG_DAY, MINUTES_PER_DAY, START_MINUTE } from '../core/config';
import {
  completeDueJobs,
  getEvent,
  handleCommand,
  newGame,
  noteNoEffect,
  presentIdolIds,
  pruneScheduleOverrides,
} from '../core/sim';
import type { ActionCommand, GameState } from '../core/types';
import { createInitialProducerStats } from '../core/producer';
import { LocalStorageRepository } from '../save/localStorageRepository';
import type { SaveRepository } from '../save/repository';
import { createSaveEnvelope } from '../save/save';
import type { SaveSlotMeta } from '../save/slots';
import { exportSaveText, parseSaveText } from '../save/transfer';

type GameStore = {
  state: GameState;
  slots: SaveSlotMeta[];
  act: (command: ActionCommand) => void;
  restart: () => void;
  saveSlot: (slotId: string, label: string) => string;
  loadSlot: (slotId: string) => boolean;
  deleteSlot: (slotId: string) => void;
  exportSlot: (slotId: string) => string | null;
  importSlot: (label: string, text: string) => boolean;
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
    // 兜底：导入的存档、或迁移链漏掉的字段，都在这里补齐，别让面板读到 undefined。
    saved.state.producer = {
      ...createInitialProducerStats(),
      ...saved.state.producer,
    };
    pruneScheduleOverrides(saved.state);
    completeDueJobs(saved.state);
    return saved.state;
  }
  return newGame(makeSeed());
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialState(),
  slots: repository.listSlots(),
  act: (command) =>
    set((previous) => {
      const next = handleCommand(previous.state, command);
      // 没有变化也要看得见：否则按钮就像坏了。
      const resolved = next === previous.state ? noteNoEffect(previous.state) : next;
      repository.save(createSaveEnvelope(resolved));
      return { state: resolved };
    }),
  restart: () => {
    const next = newGame(makeSeed());
    repository.save(createSaveEnvelope(next));
    set({ state: next });
  },
  saveSlot: (slotId, label) => {
    const envelope = createSaveEnvelope(get().state);
    repository.saveSlot(slotId, label, envelope);
    set({ slots: repository.listSlots() });
    return envelope.createdAt;
  },
  loadSlot: (slotId) => {
    const saved = repository.loadSlot(slotId);
    if (!saved) return false;
    pruneScheduleOverrides(saved.state);
    completeDueJobs(saved.state);
    repository.save(createSaveEnvelope(saved.state));
    set({ state: saved.state, slots: repository.listSlots() });
    return true;
  },
  deleteSlot: (slotId) => {
    repository.deleteSlot(slotId);
    set({ slots: repository.listSlots() });
  },
  exportSlot: (slotId) => {
    const envelope = repository.loadSlot(slotId);
    return envelope ? exportSaveText(envelope) : null;
  },
  importSlot: (label, text) => {
    const parsed = parseSaveText(text);
    if (!parsed.ok) return false;
    repository.saveSlot(`slot-${Date.now()}`, label, parsed.envelope);
    set({ slots: repository.listSlots() });
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
