import type { ContentPack } from '../contentIndex';
import { DATE_TEST_DIALOGUE, DATE_TEST_SCENARIO } from './dateScenarios';
import {
  ACTIVITIES,
  ACTORS,
  DIALOGUES,
  EQUIPS,
  EVENTS,
  IDOLS,
  ITEMS,
  JOBS,
  LOCATIONS,
  SHOPS,
  STARTING_STATE,
  STORY_CHAIN_DEFS,
  TRANSIT_ROUTES,
  WALK_EDGES,
} from './index';

// Frozen test content. It is intentionally independent from src/core/content,
// so production content can be replaced or deleted without changing tests.
export const FIXTURE_CONTENT_PACK: ContentPack = {
  dateScenarios: [DATE_TEST_SCENARIO],
  activities: ACTIVITIES,
  actors: ACTORS,
  idols: IDOLS,
  equips: EQUIPS,
  events: EVENTS,
  jobs: JOBS,
  items: ITEMS,
  shops: SHOPS,
  dialogues: [...DIALOGUES, DATE_TEST_DIALOGUE],
  storyChains: STORY_CHAIN_DEFS,
  locations: LOCATIONS,
  transitRoutes: TRANSIT_ROUTES,
  walkEdges: WALK_EDGES,
  starting: STARTING_STATE,
};

export const ACTIVE_CONTENT_PACK: ContentPack = FIXTURE_CONTENT_PACK;
