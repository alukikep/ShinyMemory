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
      dialogueId: 'dialogue.meguru.purity',
      actionLabel: '她比集合时间早到',
      when: [
        { kind: 'flag', key: 'completed.meguru.sunshine', value: true },
        { kind: 'dayAtLeast', day: 12 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.purity', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default meguruPurity;
