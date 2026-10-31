import type { StoryChainDef } from '../../types';

/**
 * 恋鐘的卡面「ばってん長崎恋岬」—— 她的手艺、她的故乡、她的凯旋 live。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const koganeCard: StoryChainDef = {
  id: 'kogane-nagasaki',
  idolId: 'kogane',
  title: 'ばってん長崎恋岬',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所飘出很香的味道',
  revealWhen: [{ kind: 'idolStatus', idolId: 'kogane', status: 'recruited' }],
  steps: [
    {
      id: 'kogane-cook',
      locationId: 'office',
      timeWindow: { fromMinute: 660, toMinute: 840 },
      dialogueId: 'dialogue.kogane.hand',
      actionLabel: '她说要用事务所的东西做饭',
      when: [
        { kind: 'idolStatus', idolId: 'kogane', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.kogane.cook', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'kogane-fair',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 780, toMinute: 1080 },
      dialogueId: 'dialogue.kogane.fair',
      actionLabel: '长崎物产展',
      when: [
        { kind: 'flag', key: 'completed.kogane.cook', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.kogane.fair', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'kogane-live',
      locationId: 'studio',
      timeWindow: { fromMinute: 1080, toMinute: 1320 },
      dialogueId: 'dialogue.kogane.live',
      actionLabel: 'live 结束以后',
      when: [
        { kind: 'flag', key: 'completed.kogane.fair', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.kogane.live', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default koganeCard;
