import { START_MINUTE } from '../core/config';
import {
  CONTENT_INDEX,
  createInitialActorStates,
  createInitialIdolStates,
} from '../core/contentIndex';
import { createInitialProducerStats } from '../core/producer';
import type {
  GameState,
  IdolAttribute,
  ProducerStats,
  Rank,
  SaveEnvelope,
  StatKey,
} from '../core/types';
import { CONTENT_EPOCH, GAME_VERSION, SAVE_VERSION } from './version';



const RANK_FROM_VALUE: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

function legacyRank(value: number): Rank {
  if (value >= 100) return 'S';
  if (value >= 85) return 'A';
  if (value >= 70) return 'B';
  if (value >= 55) return 'C';
  if (value >= 40) return 'D';
  if (value >= 25) return 'E';
  return 'F';
}

function legacyAttribute(
  value: number,
  initial: Rank,
  maxRank: Rank,
): IdolAttribute {
  const start = Math.max(
    RANK_FROM_VALUE.indexOf(initial),
    RANK_FROM_VALUE.indexOf(legacyRank(value)),
  );
  const cap = RANK_FROM_VALUE.indexOf(maxRank);
  return {
    rank: RANK_FROM_VALUE[Math.min(start, cap)]!,
    exp: 0,
    maxRank,
  };
}

export function createSaveEnvelope(state: GameState): SaveEnvelope {
  return {
    schemaVersion: SAVE_VERSION,
    contentEpoch: CONTENT_EPOCH,
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
    state.lastResult = undefined;

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
    const profile = CONTENT_INDEX.idols.get(idolId)?.growth;

    if (legacy && profile) {
      idols[idolId] = {
        id: idolId,
        status: 'recruited',
        stats: {
          vocal: legacyAttribute(
            legacy.vocal,
            profile.vocal.initial,
            profile.vocal.max,
          ),
          dance: legacyAttribute(
            legacy.dance,
            profile.dance.initial,
            profile.dance.max,
          ),
          expression: legacyAttribute(
            legacy.expression,
            profile.expression.initial,
            profile.expression.max,
          ),
          trust: legacyAttribute(
            legacy.trust,
            profile.trust.initial,
            profile.trust.max,
          ),
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
    const state = next.state as GameState & { activeIdolId?: string };
    state.actors = {
      ...createInitialActorStates(),
      ...(state.actors ?? {}),
    };
    state.idols = {
      ...createInitialIdolStates(),
      ...(state.idols ?? {}),
    };
    state.activeIdolId = state.activeIdolId ?? CONTENT_INDEX.startingIdolId;
    next.schemaVersion = 8;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 8) {
    next.schemaVersion = 9;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 9) {
    const state = next.state as GameState & {
      idols?: Record<
        string,
        {
          id: string;
          stats: Record<string, number | IdolAttribute>;
        }
      >;
    };

    for (const [idolId, idol] of Object.entries(state.idols ?? {})) {
      const profile = CONTENT_INDEX.idols.get(idolId)?.growth;
      if (!profile) continue;
      for (const key of Object.keys(idol.stats)) {
        const raw = idol.stats[key];
        if (typeof raw !== 'number') continue;
        const attribute = key as keyof typeof profile;
        const growth = profile[attribute];
        idol.stats[key] = legacyAttribute(
          raw,
          growth.initial,
          growth.max,
        );
      }
    }

    next.schemaVersion = 10;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 10) {
    const state = next.state as GameState & {
      inventory?: Record<string, number>;
      shopPurchases?: Record<string, number>;
    };
    state.inventory = state.inventory ?? {};
    state.shopPurchases = state.shopPurchases ?? {};
    next.schemaVersion = 11;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 11) {
    const state = next.state as GameState;
    for (const idol of Object.values(state.idols ?? {})) {
      idol.status = 'recruited';
      idol.recruitedAt = idol.recruitedAt ?? Date.now();
    }
    state.storyChains = {};
    state.pendingDialogueId = undefined;
    state.dialogueChainId = undefined;
    state.dialogueNodeId = undefined;
    state.dialogueTargetIdolId = undefined;
    next.schemaVersion = 12;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 12) {
    const state = next.state as GameState & {
      activeIdolId?: string;
      pendingIdolId?: string;
    };
    if (!state.selectedIdolId) {
      state.selectedIdolId =
        state.activeIdolId ?? CONTENT_INDEX.startingIdolId;
    }
    delete state.activeIdolId;
    delete state.pendingIdolId;
    state.jobs = state.jobs ?? [];
    next.schemaVersion = 13;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 13) {
    const state = next.state as GameState & { producer?: ProducerStats };
    state.producer = state.producer ?? createInitialProducerStats();
    next.schemaVersion = 14;
    next.gameVersion = GAME_VERSION;
  }

  return next;
}
