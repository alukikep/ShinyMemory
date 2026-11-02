import type { StoryChainDef } from '../../types';

/**
 * 円香的招募链（偶遇型）。
 *
 * 依据：
 * - 相遇：她冒充"对偶像有兴趣的人"，约在喫茶店审问制作人，最后摊牌 [102100101]。
 * - 第一次工作：宣材写真，第一个「ミスター・オールドタイプ」[102100102]。
 * - 收工路上：CD 店门口的迷你 live，她第一次问「アイドルとは？」（三分支）[102100102]。
 *
 * 三段戏、三个地点（playbook §4.6）：站前 → 摄影棚 → 商店街。
 */
export const madokaEncounter: StoryChainDef = {
  id: 'madoka-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'madoka',
  priority: 10,
  title: '確かめに来たんです',
  revealWhen: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
  steps: [
    {
      id: 'madoka-cafe-1',
      locationId: 'station',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.madoka.first',
      actionLabel: '站前的喫茶店，有人一直看着你',
      source: '102100101',
      when: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'madoka-shoot-1',
      locationId: 'studio',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.madoka.second',
      actionLabel: '第一次宣材写真',
      source: '102100102',
      when: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'madoka-street-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.madoka.third',
      actionLabel: 'CD 店门口的小舞台',
      source: '102100102',
      when: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
      complete: { status: 'recruited' },
    },
  ],
};

export default madokaEncounter;
