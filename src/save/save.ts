import { START_MINUTE } from '../core/config';
import {
  CONTENT_INDEX,
  createInitialActorStates,
  createInitialIdolStates,
} from '../core/contentIndex';
import { createInitialProducerStats, PRODUCER_STAT_KEYS } from '../core/producer';
import type {
  GameState,
  IdolAttribute,
  IdolStatus,
  ProducerStats,
  Rank,
  SaveEnvelope,
  StatKey,
} from '../core/types';
import { CONTENT_EPOCH, GAME_VERSION, SAVE_VERSION } from './version';



const RANK_FROM_VALUE: Rank[] = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

const IDOL_STATUS_ORDER: Record<IdolStatus, number> = {
  unknown: 0,
  known: 1,
  recruited: 2,
};

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
        fans: 0,
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

  if (next.schemaVersion === 14) {
    const state = next.state as GameState & {
      idols?: Record<string, { fans?: number }>;
    };
    for (const idol of Object.values(state.idols ?? {})) {
      idol.fans = idol.fans ?? 0;
    }
    next.schemaVersion = 15;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 15) {
    // 制作人属性从 2 个扩到 5 个；旧存档里缺 negotiation/planning/insight，
    // 面板直接读 undefined.rank 会整页崩，所以在这里补齐。
    const initial = createInitialProducerStats();
    const state = next.state as GameState & {
      producer?: Partial<GameState['producer']>;
    };
    state.producer = { ...initial, ...(state.producer ?? {}) };
    for (const key of PRODUCER_STAT_KEYS) {
      if (!state.producer[key]) state.producer[key] = initial[key];
    }
    next.schemaVersion = 16;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 16) {
    // 重点偶像成为正式设置：老存档沿用原来的 selectedIdolId。
    const state = next.state as GameState & { focusIdolId?: string };
    state.focusIdolId = state.focusIdolId ?? state.selectedIdolId;
    next.schemaVersion = 17;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 17) {
    const state = next.state as GameState & { chatCounts?: Record<string, number> };
    state.chatCounts = state.chatCounts ?? {};
    next.schemaVersion = 18;
    next.gameVersion = GAME_VERSION;
  }

  if (next.schemaVersion === 18) {
    const state = next.state as GameState & {
      shopCooldowns?: Record<string, number>;
    };
    state.shopCooldowns = state.shopCooldowns ?? {};
    next.schemaVersion = 19;
    next.gameVersion = GAME_VERSION;
  }

  // 兜底：当前内容里新加的偶像/角色，旧存档里没有条目。
  // 事故 #32：摩美々是在存档纪元 3 之后加进来的，纪元没变 → 旧档照常加载，
  // 但 `state.idols` 里没有她；招募链的 `complete.status` 被守卫静默跳过，
  // 剧情走完了她也不进名册/日程表。补条目不会动已有进度。
  next.state.idols = {
    ...createInitialIdolStates(),
    ...(next.state.idols ?? {}),
  };
  next.state.actors = {
    ...createInitialActorStates(),
    ...(next.state.actors ?? {}),
  };

  // 已经走完、但状态没落盘的招募步骤：按剧情进度把状态补回来。
  // （否则旧档补出条目后，她的招募链already completed，永远招不进来。）
  for (const chain of CONTENT_INDEX.storyChains.values()) {
    const chainState = next.state.storyChains?.[chain.id];
    if (!chainState) continue;
    const done = Math.min(chainState.stepIndex ?? 0, chain.steps.length);
    for (const step of chain.steps.slice(0, done)) {
      const status = step.complete?.status;
      const idol = next.state.idols[chain.idolId];
      if (!status || !idol) continue;
      if (IDOL_STATUS_ORDER[status] > IDOL_STATUS_ORDER[idol.status]) {
        idol.status = status;
        idol.knownAt = idol.knownAt ?? 1;
      }
    }
  }

  return next;
}
