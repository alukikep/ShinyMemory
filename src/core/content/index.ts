import type {
  ActivityDef,
  DialogueDef,
  EventDef,
  ItemDef,
  JobDef,
  ShopDef,
} from '../types';
import { LOCATIONS } from './locations';
import { WALK_EDGES } from './map';
import { TRANSIT_ROUTES } from './transit';
import { ACTORS } from './actors';
import { IDOLS } from './idols';
import { EQUIPS as BASE_EQUIPS } from './equips';
import { MANO_DIALOGUES } from './dialogues/mano';
import { HIORI_DIALOGUES } from './dialogues/hiori';
import { MEGURU_DIALOGUES } from './dialogues/meguru';
import { PROLOGUE_DIALOGUES } from './dialogues/prologue';
import { STORY_CHAINS } from './storyChains';
import { STARTING_STATE } from './starting';
import vocal from './activities/vocal';
import dance from './activities/dance';
import expression from './activities/expression';
import rest from './activities/rest';
import free from './activities/free';
import lookAround from './activities/lookAround';
import sleep from './activities/sleep';

/**
 * 只用 TS 写死的内容，**不含**审查台通过的 approved。
 *
 * 构建门和审查台拿它当基准（再把 approved 合上去），否则 approved 会被算两次。
 * 游戏实际使用的是 `PRODUCTION_PACK`（`productionPack.ts`，基准 + approved）。
 */

export const ACTIVITIES: ActivityDef[] = [
  vocal,
  dance,
  expression,
  rest,
  free,
  lookAround,
  sleep,
];

export const EQUIPS = BASE_EQUIPS;

export const EVENTS: EventDef[] = [];

export const JOBS: JobDef[] = [];

export const ITEMS: ItemDef[] = [];

export const SHOPS: ShopDef[] = [];

export const DIALOGUES: DialogueDef[] = [
  ...PROLOGUE_DIALOGUES,
  ...MANO_DIALOGUES,
  ...HIORI_DIALOGUES,
  ...MEGURU_DIALOGUES,
];

export const STORY_CHAIN_DEFS = STORY_CHAINS;

export { STARTING_STATE };

export { ACTORS, IDOLS, LOCATIONS, TRANSIT_ROUTES, WALK_EDGES };
