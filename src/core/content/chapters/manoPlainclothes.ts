import type { StoryChainDef } from '../../types';

/**
 * 真乃的卡面第二章（剧本 200100402）。
 * 她说自己被突然搭话就会慌，制作人提议练说话；三选一。
 * 状态：待接入——对话在审查台待审。
 */
const manoPlainclothes: StoryChainDef = {
  id: 'mano-plainclothes',
  idolId: 'mano',
  title: '真乃ならできる',
  kind: 'card',
  priority: 6,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.mano.hover', value: true }],
  steps: [
    {
      id: 'mano-plainclothes-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 12 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.mano.plainclothes',
      actionLabel: '真乃在和谁说话',
      when: [
        { kind: 'flag', key: 'completed.mano.hover', value: true },
        { kind: 'dayAtLeast', day: 6 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.mano.plainclothes', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default manoPlainclothes;
