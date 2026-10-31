import type { StoryChainDef } from '../../types';

/**
 * 摩美々的卡面「まだ知らない one side」—— 一点一点露出她没说出口的部分。
 * 2 步 = 2 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const mamimiNatural: StoryChainDef = {
  id: 'mamimi-side',
  idolId: 'mamimi',
  title: 'まだ知らない one side',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '商业街的浴衣店门口，她在打量一件旧浴衣',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'mamimi', status: 'recruited' },
  ],
  steps: [
    {
      id: 'mamimi-yukata',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.mamimi.yukata',
      actionLabel: '她在改一件浴衣',
      when: [
        { kind: 'idolStatus', idolId: 'mamimi', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.mamimi.yukata', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mamimi-purple',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 660, toMinute: 1140 },
      dialogueId: 'dialogue.mamimi.purple',
      actionLabel: '她被粉丝叫住了',
      when: [
        { kind: 'flag', key: 'completed.mamimi.yukata', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.mamimi.purple', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default mamimiNatural;
