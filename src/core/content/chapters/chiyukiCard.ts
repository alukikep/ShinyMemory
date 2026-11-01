import type { StoryChainDef } from '../../types';

/**
 * 千雪的卡面「おいしい時間」—— 马克杯、牛丼、半額セール。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const chiyukiCard: StoryChainDef = {
  id: 'chiyuki-mug',
  idolId: 'chiyuki',
  title: 'おいしい時間',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所附近新开了一家杂货屋',
  revealWhen: [{ kind: 'idolStatus', idolId: 'chiyuki', status: 'recruited' }],
  steps: [
    {
      id: 'chiyuki-mug-step',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.chiyuki.mug',
      actionLabel: '新开的杂货屋里都是小东西',
      when: [
        { kind: 'idolStatus', idolId: 'chiyuki', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.chiyuki.mug', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'chiyuki-gyudon',
      locationId: 'station',
      timeWindow: { fromMinute: 1080, toMinute: 1260 },
      dialogueId: 'dialogue.chiyuki.gyudon',
      actionLabel: '收工很晚，她说想吃牛丼',
      when: [
        { kind: 'flag', key: 'completed.chiyuki.mug', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.chiyuki.gyudon', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'chiyuki-sale',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.chiyuki.sale',
      actionLabel: '那家杂货屋打半价了',
      when: [
        { kind: 'flag', key: 'completed.chiyuki.gyudon', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.chiyuki.sale', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default chiyukiCard;
