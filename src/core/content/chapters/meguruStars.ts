import type { StoryChainDef } from '../../types';

/**
 * 卡面章「星空」（巡）。
 * 素材：P 卡【夏に恋するピチカート！】，严格按 commu 序号接在上一章之后。
 * 状态：待接入——对话在审查台待审。
 */
const meguruStars: StoryChainDef = {
  id: 'meguru-stars',
  idolId: 'meguru',
  title: '星空',
  priority: 38,
  workPolicy: 'open',
  revealWhen: [
    { kind: 'flag', key: 'completed.meguru.coffee', value: true },
    { kind: 'idolStatus', idolId: 'meguru', status: 'recruited' },
  ],
  steps: [
    {
      id: 'stars-1',
      locationId: 'park',
      timeWindow: { fromMinute: 19 * 60, toMinute: 23 * 60 },
      dialogueId: 'dialogue.meguru.stars',
      actionLabel: '她抬头看星星',
      when: [
        { kind: 'flag', key: 'completed.meguru.coffee', value: true },
        { kind: 'dayAtLeast', day: 16 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.stars', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default meguruStars;
