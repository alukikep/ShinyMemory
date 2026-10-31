import type { StoryChainDef } from '../../types';

/**
 * 灯织的卡面章节（幸福に満ちる）。
 * 状态：待接入——对话在审查台待审。
 */
const hioriGift: StoryChainDef = {
  id: 'hiori-gift',
  idolId: 'hiori',
  title: '幸福に満ちる',
  kind: 'card',
  priority: 7,
  workPolicy: 'open',
  revealWhen: [{ kind: 'flag', key: 'completed.hiori.support', value: true }],
  steps: [
    {
      id: 'hiori-gift-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 11 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.hiori.gift',
      actionLabel: '她说要找和小饰物',
      when: [
        { kind: 'flag', key: 'completed.hiori.support', value: true },
        { kind: 'dayAtLeast', day: 9 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.hiori.gift', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default hioriGift;
