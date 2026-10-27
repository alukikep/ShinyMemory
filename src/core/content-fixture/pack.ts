import type { ContentPack } from '../contentIndex';
import {
  ACTIVITIES,
  ACTORS,
  DIALOGUES,
  EVENTS,
  IDOLS,
  ITEMS,
  JOBS,
  LOCATIONS,
  SHOPS,
  STARTING_STATE,
  STORY_CHAIN_DEFS,
  TRANSIT_ROUTES,
} from './index';

// Frozen test content. It is intentionally independent from src/core/content,
// so production content can be replaced or deleted without changing tests.
export const FIXTURE_CONTENT_PACK: ContentPack = {
  activities: ACTIVITIES,
  actors: ACTORS,
  idols: IDOLS,
  events: EVENTS,
  jobs: JOBS,
  items: ITEMS,
  shops: SHOPS,
  dialogues: DIALOGUES,
  storyChains: STORY_CHAIN_DEFS,
  locations: LOCATIONS,
  transitRoutes: TRANSIT_ROUTES,
  starting: STARTING_STATE,
};

export const ACTIVE_CONTENT_PACK = FIXTURE_CONTENT_PACK;
