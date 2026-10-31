import type { StoryChainDef } from '../../types';

/**
 * 真乃的卡面第四章（剧本 200100404）。
 * 收工后她还想在太阳下走走；三选一决定去哪儿。
 * 状态：待接入——对话在审查台待审。
 */
const manoAfterglow: StoryChainDef = {
  id: 'mano-afterglow',
  idolId: 'mano',
  title: 'いつかの気持ち',
  kind: 'card',
  priority: 8,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.mano.growth', value: true }],
  steps: [
    {
      id: 'mano-afterglow-1',
      locationId: 'home',
      timeWindow: { fromMinute: 14 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.mano.afterglow',
      actionLabel: '收工了，她还想再待一会儿',
      when: [
        { kind: 'flag', key: 'completed.mano.growth', value: true },
        { kind: 'dayAtLeast', day: 12 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.mano.afterglow', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default manoAfterglow;
