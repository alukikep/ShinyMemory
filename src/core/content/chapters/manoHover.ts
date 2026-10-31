import type { StoryChainDef } from '../../types';

/**
 * 真乃的卡面第一章（剧本 200100401）。
 *
 * 一章 = 一段 commu = 1 步；本段无分支。
 * 状态：待接入——对话在审查台待审。
 */
const manoHover: StoryChainDef = {
  id: 'mano-hover',
  idolId: 'mano',
  title: 'ほわほわアイドル',
  kind: 'card',
  priority: 5,
  workPolicy: 'open',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
  ],
  steps: [
    {
      id: 'mano-hover-1',
      locationId: 'park',
      timeWindow: { fromMinute: 12 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.mano.hover',
      actionLabel: '公园里有鸽子在聚',
      when: [
        { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.mano.hover', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default manoHover;
