import type { StoryChainDef } from '../../types';

/**
 * 霧子的卡面「包・帯・組・曲」—— 她照顾人的方式，和一张写着你名字的创可贴。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const kirikoCard: StoryChainDef = {
  id: 'kiriko-bandage',
  idolId: 'kiriko',
  title: '包・帯・組・曲',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所里，她在为周边贩卖会做准备',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'kiriko', status: 'recruited' },
  ],
  steps: [
    {
      id: 'kiriko-hand',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.kiriko.hand',
      actionLabel: '她在为贩卖会摆花',
      when: [
        { kind: 'idolStatus', idolId: 'kiriko', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.kiriko.hand', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'kiriko-worry',
      locationId: 'office',
      timeWindow: { fromMinute: 540, toMinute: 720 },
      dialogueId: 'dialogue.kiriko.worry',
      actionLabel: '她看出你有点累',
      when: [
        { kind: 'flag', key: 'completed.kiriko.hand', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.kiriko.worry', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'kiriko-charm',
      locationId: 'studio',
      timeWindow: { fromMinute: 1080, toMinute: 1320 },
      dialogueId: 'dialogue.kiriko.charm',
      actionLabel: '交流会结束以后',
      when: [
        { kind: 'flag', key: 'completed.kiriko.worry', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.kiriko.charm', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default kirikoCard;
