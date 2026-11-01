import type { StoryChainDef } from '../../types';

/**
 * 智代子的卡面「純真チョコレート」—— 甜品巡礼、喫茶店的钢琴、收工后的巧克力。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const chiyokoCard: StoryChainDef = {
  id: 'chiyoko-choco',
  idolId: 'chiyoko',
  title: '純真チョコレート',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealWhen: [{ kind: 'idolStatus', idolId: 'chiyoko', status: 'recruited' }],
  revealMode: 'triggered',
  hint: '甜品店那边好像很热闹',
  steps: [
    {
      id: 'chiyoko-sweets',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.chiyoko.sweets',
      actionLabel: '甜品店里有人在拍照',
      when: [
        { kind: 'idolStatus', idolId: 'chiyoko', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.chiyoko.sweets', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'chiyoko-piano',
      locationId: 'station',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.chiyoko.piano',
      actionLabel: '拍摄结束后的喫茶店',
      when: [
        { kind: 'flag', key: 'completed.chiyoko.sweets', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.chiyoko.piano', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'chiyoko-gift',
      locationId: 'office',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.chiyoko.gift',
      actionLabel: '收工后她叫住我',
      when: [
        { kind: 'flag', key: 'completed.chiyoko.piano', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.chiyoko.gift', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default chiyokoCard;
