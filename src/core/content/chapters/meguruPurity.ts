import type { StoryChainDef } from '../../types';

/**
 * 卡面章「纯白」（巡）。
 * 素材：P 卡【夏に恋するピチカート！】，严格按 commu 序号接在上一章之后。
 * 状态：待接入——对话在审查台待审。
 */
const meguruPurity: StoryChainDef = {
  id: 'meguru-purity',
  idolId: 'meguru',
  title: '纯白',
  priority: 34,
  workPolicy: 'open',
  revealWhen: [
    { kind: 'flag', key: 'completed.meguru.sunshine', value: true },
    { kind: 'idolStatus', idolId: 'meguru', status: 'recruited' },
  ],
  steps: [
    {
      id: 'purity-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 8 * 60, toMinute: 12 * 60 },
      dialogueId: 'dialogue.meguru.purity.first',
      actionLabel: '她比集合时间早到',
      when: [
        { kind: 'flag', key: 'completed.meguru.sunshine', value: true },
        { kind: 'dayAtLeast', day: 12 },
      ],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'purity-2',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 8 * 60, toMinute: 12 * 60 },
      dialogueId: 'dialogue.meguru.purity.question',
      actionLabel: '恋爱是什么',
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'purity-3',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 8 * 60, toMinute: 12 * 60 },
      dialogueId: 'dialogue.meguru.purity.dance',
      actionLabel: '要好好看着我',
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.meguru.purity', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default meguruPurity;
