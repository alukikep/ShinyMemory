import { START_MINUTE } from '../core/config';
import {
  CONTENT_INDEX,
  createInitialActorStates,
  createInitialIdolStates,
} from '../core/contentIndex';
import type { GameState, SaveEnvelope, StatKey } from '../core/types';
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
  const next = structuredClone(envelope);

  if (next.schemaVersion === 1) {
    if (!next.state.locationId) next.state.locationId = 'office';
    next.schemaVersion = 2;
  }

  if (next.schemaVersion === 2) {
    const state = next.state as GameState & { week?: number; slot?: number };
    const legacyLog = state.log as unknown as Array<{
      id: number;
      text: string;
      tone: GameState['log'][number]['tone'];
    }>;

    state.clock = { absoluteMinutes: START_MINUTE };
    state.log = (legacyLog ?? []).map((entry) => ({
      id: entry.id,
      day: 1,
      minuteOfDay: START_MINUTE,
      text: entry.text,
      tone: entry.tone,
    }));

    state.phase = 'plan';
    state.pendingActivityId = undefined;
    state.pendingEventId = undefined;
    state.pendingExam = undefined;
    state.lastResult = undefined;
    state.endingId = undefined;
    state.examScore = undefined;
    state.examParts = undefined;
    state.examPassed = undefined;
    state.midExamDone = false;
    state.finalExamDone = false;

    delete state.week;
    delete state.slot;

    next.schemaVersion = 3;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 3) {
    next.state.actors = next.state.actors ?? createInitialActorStates();
    next.schemaVersion = 4;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 4) {
    next.state.actors = {
      ...createInitialActorStates(),
      ...(next.state.actors ?? {}),
    };
    next.schemaVersion = 5;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 5) {
    const state = next.state as GameState & {
      stats?: Record<StatKey, number>;
      shared?: GameState['shared'];
      idols?: GameState['idols'];
      activeIdolId?: string;
    };
    const legacy = state.stats;
    const idolId = CONTENT_INDEX.startingIdolId;
    const idols = createInitialIdolStates();

    if (legacy) {
      idols[idolId] = {
        id: idolId,
        stats: {
          vocal: legacy.vocal,
          dance: legacy.dance,
          expression: legacy.expression,
          trust: legacy.trust,
        },
      };
    }

    state.shared = {
      stamina: legacy?.stamina ?? 100,
      stress: legacy?.stress ?? 0,
    };
    state.idols = idols;
    state.activeIdolId = idolId;
    delete state.stats;

    next.schemaVersion = 6;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 6) {
    next.state.actors = {
      ...createInitialActorStates(),
      ...(next.state.actors ?? {}),
    };
    next.schemaVersion = 7;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 7) {
    next.state.actors = {
      ...createInitialActorStates(),
      ...(next.state.actors ?? {}),
    };
    next.state.idols = {
      ...createInitialIdolStates(),
      ...(next.state.idols ?? {}),
    };
    next.state.activeIdolId =
      next.state.activeIdolId ?? CONTENT_INDEX.startingIdolId;
    next.schemaVersion = 8;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 8) {
    if (
      next.state.phase === 'examMid' ||
      next.state.phase === 'examFinal' ||
      next.state.phase === 'ending'
    ) {
      next.state.phase = 'plan';
      next.state.pendingExam = undefined;
      next.state.endingId = undefined;
    }
    next.schemaVersion = 9;
    next.gameVersion = GAME_VERSION;
  }

  return next;
}
