import type { ContentPack } from './contentIndexCore';
import { mergeApprovedContent } from '../review/approval';
import { BASE_PACK } from './content/basePack';
import { APPROVED_CONTENT } from './content/approved.generated';

export { BASE_PACK } from './content/basePack';

/**
 * 游戏实际加载的内容：TS 基准 + 审查台通过的内容。
 *
 * **必须走 `mergeApprovedContent`**，不要在这里手写一份合并。
 * 曾经手写过一次：加 `topics` 时只改了 mergeApprovedContent，
 * 结果通过的话题进不了游戏——两份合并逻辑各写各的，必然漂移。
 */
export const PRODUCTION_PACK: ContentPack = mergeApprovedContent(
  BASE_PACK,
  APPROVED_CONTENT,
).pack;

export const ACTIVE_CONTENT_PACK = PRODUCTION_PACK;
