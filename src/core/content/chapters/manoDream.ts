import type { StoryChainDef } from '../../types';

/**
 * 真乃的卡面第五章（剧本 200100411），也是这张卡的收尾。
 * 公园里她睡着了，醒来讲梦到的演唱会；她说"想一直和制作人一起实现梦想"。
 * 状态：待接入——对话在审查台待审。
 */
const manoDream: StoryChainDef = {
  id: 'mano-dream',
  idolId: 'mano',
  title: 'ずっと続く夢の先へ',
  kind: 'card',
  priority: 9,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.mano.afterglow', value: true }],
  steps: [
    {
      id: 'mano-dream-1',
      locationId: 'park',
      timeWindow: { fromMinute: 15 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.mano.dream',
      actionLabel: '她在长椅上睡着了',
      when: [
        { kind: 'flag', key: 'completed.mano.afterglow', value: true },
        { kind: 'dayAtLeast', day: 15 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -6 },
        { kind: 'flag', key: 'completed.mano.dream', value: true },
      ],
      complete: { nextStepDelayDays: 3 },
    },
  ],
};

export default manoDream;
