import type { ContentPack } from './contentIndexCore';
import { BASE_PACK } from './content/basePack';
import { APPROVED_CONTENT } from './content/approved.generated';

export { BASE_PACK } from './content/basePack';

/** 游戏实际加载的内容：TS 基准 + 审查台通过的内容。 */
export const PRODUCTION_PACK: ContentPack = {
  ...BASE_PACK,
  activities: [...BASE_PACK.activities, ...APPROVED_CONTENT.activities],
  events: [...BASE_PACK.events, ...APPROVED_CONTENT.events],
  jobs: [...BASE_PACK.jobs, ...APPROVED_CONTENT.jobs],
  items: [...BASE_PACK.items, ...APPROVED_CONTENT.items],
  shops: [...BASE_PACK.shops, ...APPROVED_CONTENT.shops],
  dialogues: [...BASE_PACK.dialogues, ...APPROVED_CONTENT.dialogues],
  storyChains: [...BASE_PACK.storyChains, ...APPROVED_CONTENT.storyChains],
};

export const ACTIVE_CONTENT_PACK = PRODUCTION_PACK;
