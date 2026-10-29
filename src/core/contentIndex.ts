import { ACTIVE_CONTENT_PACK } from '#content-pack';
import type { ActorState, IdolState } from './types';
import { buildContentIndex, type ContentIndex } from './contentIndexCore';

export type { ContentIndex, ContentPack } from './contentIndexCore';
export { buildContentIndex } from './contentIndexCore';

export function createInitialActorStates(): Record<string, ActorState> {
  return Object.fromEntries(
    [...CONTENT_INDEX.actors.values()].map((actor) => [
      actor.id,
      {
        id: actor.id,
        affinity: 0,
        flags: {},
        topicCooldowns: {},
        scheduleOverrides: [],
      } satisfies ActorState,
    ]),
  );
}

export function createInitialIdolStates(): Record<string, IdolState> {
  return Object.fromEntries(
    [...CONTENT_INDEX.idols.values()].map((idol) => [
      idol.id,
      {
        id: idol.id,
        stats: Object.fromEntries(
          Object.entries(idol.growth).map(([key, growth]) => [
            key,
            {
              rank: growth.initial,
              exp: 0,
              maxRank: growth.max,
            },
          ]),
        ) as IdolState['stats'],
        fans: idol.fans ?? 0,
        status: CONTENT_INDEX.startingIdolStatus[idol.id] ?? 'unknown',
      } satisfies IdolState,
    ]),
  );
}

export { PRODUCTION_PACK } from './productionPack';

export const CONTENT_INDEX: ContentIndex = buildContentIndex(ACTIVE_CONTENT_PACK);
