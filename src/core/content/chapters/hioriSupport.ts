import type { StoryChainDef } from '../../types';

/**
 * 灯织的卡面章节（支えていきたい）。
 * 状态：待接入——对话在审查台待审。
 */
const hioriSupport: StoryChainDef = {
  id: 'hiori-support',
  idolId: 'hiori',
  title: '支えていきたい',
  kind: 'card',
  priority: 6,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.hiori.smile', value: true }],
  steps: [
    {
      id: 'hiori-support-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 20 * 60, toMinute: 23 * 60 },
      dialogueId: 'dialogue.hiori.support',
      actionLabel: '练习室的灯还亮着',
      when: [
        { kind: 'flag', key: 'completed.hiori.smile', value: true },
        { kind: 'dayAtLeast', day: 6 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.hiori.support', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default hioriSupport;
