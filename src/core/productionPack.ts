import type { ContentPack } from './contentIndex';
import {
  ACTORS,
  ACTIVITIES,
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
} from './content';

export const PRODUCTION_PACK: ContentPack = {
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

export const ACTIVE_CONTENT_PACK = PRODUCTION_PACK;
