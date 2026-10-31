import type { IdolStatus } from '../types';

/**
 * 初始偶像状态。
 *
 * 两种起步方式，依据 W.I.N.G. 原作：
 * - **偶遇型**（樱木真乃）：制作人在公园听见她唱歌才认识 → `unknown`，
 *   第一步变 `known`，第二步招募。
 * - **档案型**（风野灯织、八宫巡）：制作人是看**书面审查资料**选中的，
 *   第一天就已经认识（`known`），只是还没正式招募。
 *
 * 所以她们的招募链不是"认识她"，而是"第一次见面 + 让她答应"。
 */
export const STARTING_STATE = {
  activeIdolId: 'mano',
  idolStatus: {
    mano: 'unknown',
    hiori: 'known',
    meguru: 'known',
    // 摩美々是偶遇型：制作人先在街上撞见她，她才进入名单。
    mamimi: 'unknown',
  } as Record<string, IdolStatus>,
  dialogueId: 'dialogue.prologue.office',
} as const;
