import type { StoryChainDef } from '../../types';

/**
 * 真乃的卡面第三章（剧本 200100403）。
 * 深夜她还在看宣传照；制作人说可爱，她说"和您说是不一样的"；三选一挑照片。
 * 状态：待接入——对话在审查台待审。
 */
const manoGrowth: StoryChainDef = {
  id: 'mano-growth',
  idolId: 'mano',
  title: '成長の証',
  kind: 'card',
  priority: 7,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.mano.plainclothes', value: true }],
  steps: [
    {
      id: 'mano-growth-1',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.mano.growth',
      actionLabel: '灯还亮着，她还在看照片',
      when: [
        { kind: 'flag', key: 'completed.mano.plainclothes', value: true },
        { kind: 'dayAtLeast', day: 9 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.mano.growth', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default manoGrowth;
