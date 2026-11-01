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
    kiriko: 'unknown',
    kogane: 'unknown',
    sakuya: 'unknown',
    yuika: 'unknown',
    kaho: 'unknown',
    // 智代子是档案型：制作人在甄选现场见过她，进事务所时已经认识。
    chiyoko: 'known',
    juri: 'unknown',
    rinze: 'unknown',
    // 夏葉是档案型：她是自己通过书面审查进的事务所，制作人第一次去练习室见她。
    natsuha: 'known',
    amana: 'unknown',
    tenka: 'unknown',
    chiyuki: 'unknown',
    asahi: 'unknown',
    fuyuko: 'unknown',
    mei: 'unknown',
    toru: 'unknown',
    madoka: 'unknown',
    koito: 'unknown',
    hinana: 'unknown',
    nichika: 'unknown',
    mikoto: 'unknown',
    // ルカ 是"被挖过来"的：致敬演出那一夜之后才闭门不出，招募链挂在那个 flag 上。
    luca: 'unknown',
    hana: 'unknown',
  } as Record<string, IdolStatus>,
  dialogueId: 'dialogue.prologue.office',
} as const;
