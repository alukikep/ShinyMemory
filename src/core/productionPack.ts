import type { ContentPack } from './contentIndexCore';
import { mergeApprovedContent } from '../review/approval';
import { BASE_PACK } from './content/basePack';
import { APPROVED_CONTENT } from './content/approved.generated';
import { PENDING_CHAPTERS } from './content/chapters';

export { BASE_PACK } from './content/basePack';

/**
 * 游戏实际加载的内容：TS 基准 + 审查台通过的内容。
 *
 * **必须走 `mergeApprovedContent`**，不要在这里手写一份合并。
 * 曾经手写过一次：加 `topics` 时只改了 mergeApprovedContent，
 * 结果通过的话题进不了游戏——两份合并逻辑各写各的，必然漂移。
 */
const merged = mergeApprovedContent(BASE_PACK, APPROVED_CONTENT).pack;

/**
 * 卡面章节的**结构**在这里拼，而不是放进 BASE_PACK：
 * 它们的对话是审查台通过的内容，BASE_PACK 里没有，放进去会让
 * 每个草稿的预检都报 dialogue-ref（真实踩过）。
 */
const approvedDialogueIds = new Set(merged.dialogues.map((dialogue) => dialogue.id));

export const PRODUCTION_PACK: ContentPack = {
  ...merged,
  // 只挂上"对话已经批过"的链——批到一半时不会引用不存在的对话。
  storyChains: [...merged.storyChains, ...PENDING_CHAPTERS].filter((chain) =>
    chain.steps.every((step) => approvedDialogueIds.has(step.dialogueId)),
  ),
};

export const ACTIVE_CONTENT_PACK = PRODUCTION_PACK;
