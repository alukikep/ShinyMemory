import type { ContentPack } from '../contentIndexCore';
import {
  ACTORS,
  ACTIVITIES,
  DIALOGUES,
  EQUIPS,
  EVENTS,
  IDOLS,
  ITEMS,
  JOBS,
  LOCATIONS,
  SHOPS,
  FACILITY_DEFS,
  STARTING_STATE,
  STORY_CHAIN_DEFS,
  TRANSIT_ROUTES,
  WALK_EDGES,
} from './index';

/**
 * 只用 TS 写死的内容（不含审查台通过的 approved）。
 *
 * 构建门、审查台、vite 插件都用它做基准，再把 approved 合上去。
 * 它**故意不 import** `approved.generated`：那个文件会在审批时被重写，
 * 而 vite 配置的依赖图里只要有它，开发服务器就会整机重启。
 */
export const BASE_PACK: ContentPack = {
  activities: ACTIVITIES,
  actors: ACTORS,
  idols: IDOLS,
  equips: EQUIPS,
  events: EVENTS,
  jobs: JOBS,
  items: ITEMS,
  shops: SHOPS,
  facilities: FACILITY_DEFS,
  dialogues: DIALOGUES,
  storyChains: STORY_CHAIN_DEFS,
  locations: LOCATIONS,
  transitRoutes: TRANSIT_ROUTES,
  walkEdges: WALK_EDGES,
  starting: STARTING_STATE,
};
