import type {
  ActivityDef,
  EventDef,
  ItemDef,
  JobDef,
  ShopDef,
} from '../types';
import { APPROVED_CONTENT } from './approved';
import { LOCATIONS } from './locations';
import { WALK_EDGES } from './map';
import { TRANSIT_ROUTES } from './transit';
import { ACTORS } from './actors';
import { IDOLS } from './idols';
import { EQUIPS as BASE_EQUIPS } from './equips';
import { MANO_DIALOGUES } from './dialogues/mano';
import { PROLOGUE_DIALOGUES } from './dialogues/prologue';
import { STORY_CHAINS } from './storyChains';
import { STARTING_STATE } from './starting';
import { ITEMS as BASE_ITEMS, SHOPS as BASE_SHOPS } from './items';
import vocal from './activities/vocal';
import dance from './activities/dance';
import expression from './activities/expression';
import rest from './activities/rest';
import free from './activities/free';
import lookAround from './activities/lookAround';
import sleep from './activities/sleep';
import studioShoot from './jobs/studioShoot';

export const ACTIVITIES: ActivityDef[] = [
  vocal,
  dance,
  expression,
  rest,
  free,
  lookAround,
  sleep,
  ...APPROVED_CONTENT.activities,
];

export const EQUIPS = BASE_EQUIPS;

export const EVENTS: EventDef[] = [...APPROVED_CONTENT.events];

export const JOBS: JobDef[] = [studioShoot, ...APPROVED_CONTENT.jobs];

export const ITEMS: ItemDef[] = [...BASE_ITEMS];

export const SHOPS: ShopDef[] = [...BASE_SHOPS];

export const DIALOGUES = [
  ...PROLOGUE_DIALOGUES,
  ...MANO_DIALOGUES,
  ...APPROVED_CONTENT.dialogues,
];

export const STORY_CHAIN_DEFS = [
  ...STORY_CHAINS,
  ...APPROVED_CONTENT.storyChains,
];

export { STARTING_STATE };

export { ACTORS, IDOLS, LOCATIONS, TRANSIT_ROUTES, WALK_EDGES };
