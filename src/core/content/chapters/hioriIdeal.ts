import type { StoryChainDef } from '../../types';

/**
 * 灯织的卡面章节（歩む先には理想の自分）。
 * 状态：待接入——对话在审查台待审。
 */
const hioriIdeal: StoryChainDef = {
  id: 'hiori-ideal',
  idolId: 'hiori',
  title: '歩む先には理想の自分',
  kind: 'card',
  priority: 9,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.hiori.answer', value: true }],
  steps: [
    {
      id: 'hiori-ideal-1',
      locationId: 'studio',
      timeWindow: { fromMinute: 16 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.hiori.ideal',
      actionLabel: '演出结束了，她在喝水',
      when: [
        { kind: 'flag', key: 'completed.hiori.answer', value: true },
        { kind: 'dayAtLeast', day: 15 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -6 },
        { kind: 'flag', key: 'completed.hiori.ideal', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default hioriIdeal;
