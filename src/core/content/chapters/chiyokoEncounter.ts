import type { StoryChainDef } from '../../types';

/**
 * 智代子的招募链（档案型）。
 *
 * 依据：
 * - W.I.N.G. 第一篇：她在事务所认出制作人，被邀进新组合，当场想出「チョコアイドル」 [101000101]。
 * - W.I.N.G. 第二篇：她一个人在练习室练巧克力段子，制作人给建议 [101000102]。
 * 档案型：制作人在甄选现场见过她，所以第一步是"认出来 + 邀请"。
 * 招募链不占位（lockScope: 'none'）。
 */
export const chiyokoEncounter: StoryChainDef = {
  id: 'chiyoko-encounter',
  kind: 'arc',
  lockScope: 'none',
  idolId: 'chiyoko',
  priority: 10,
  title: '巧克力的名字',
  steps: [
    {
      id: 'chiyoko-office-1',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1020 },
      dialogueId: 'dialogue.chiyoko.first',
      actionLabel: '事务所里有个眼熟的女孩子',
      source: '101000101',
      complete: { status: 'known', nextStepDelayDays: 2 },
    },
    {
      id: 'chiyoko-practice-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.chiyoko.second',
      actionLabel: '练习室里有人在练巧克力段子',
      source: '101000102',
      complete: { status: 'recruited' },
    },
  ],
};

export default chiyokoEncounter;
