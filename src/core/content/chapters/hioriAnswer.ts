import type { StoryChainDef } from '../../types';

/**
 * 灯织的卡面章节（かつて夢見た眩しい姿）。
 * 状态：待接入——对话在审查台待审。
 */
const hioriAnswer: StoryChainDef = {
  id: 'hiori-answer',
  idolId: 'hiori',
  title: 'かつて夢見た眩しい姿',
  kind: 'card',
  priority: 8,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.hiori.gift', value: true }],
  steps: [
    {
      id: 'hiori-answer-1',
      locationId: 'office',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.hiori.answer',
      actionLabel: '采访结束了',
      when: [
        { kind: 'flag', key: 'completed.hiori.gift', value: true },
        { kind: 'dayAtLeast', day: 12 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.hiori.answer', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default hioriAnswer;
