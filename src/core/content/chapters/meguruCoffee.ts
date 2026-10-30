import type { StoryChainDef } from '../../types';

/**
 * 卡面章「一杯咖啡」（巡）。
 * 素材：P 卡【夏に恋するピチカート！】，严格按 commu 序号接在上一章之后。
 * 状态：待接入——对话在审查台待审。
 */
const meguruCoffee: StoryChainDef = {
  id: 'meguru-coffee',
  idolId: 'meguru',
  title: '一杯咖啡',
  priority: 36,
  workPolicy: 'open',
  revealWhen: [
    { kind: 'flag', key: 'completed.meguru.purity', value: true },
    { kind: 'idolStatus', idolId: 'meguru', status: 'recruited' },
  ],
  steps: [
    {
      id: 'coffee-1',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.meguru.coffee.first',
      actionLabel: '有人把你叫醒',
      when: [
        { kind: 'flag', key: 'completed.meguru.purity', value: true },
        { kind: 'dayAtLeast', day: 14 },
      ],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'coffee-2',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.meguru.coffee.worry',
      actionLabel: '不是你的错',
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'coffee-3',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.meguru.coffee.cup',
      actionLabel: '砂糖和牛奶',
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -8 },
        { kind: 'flag', key: 'completed.meguru.coffee', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default meguruCoffee;
