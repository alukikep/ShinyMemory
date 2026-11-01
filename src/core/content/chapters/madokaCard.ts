import type { StoryChainDef } from '../../types';

/**
 * 円香的卡面「カラカラカラ」—— 拿错的咖啡、水边外景、练习室的毛布、签名、回程的车。
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五个小节：ニガニガ / 水、風、緑 / 掴もうとして / 手すりの錆 / エンジン。
 */
const madokaCard: StoryChainDef = {
  id: 'madoka-karakara',
  idolId: 'madoka',
  title: 'カラカラカラ',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的桌上放着一杯不是你的咖啡',
  revealWhen: [{ kind: 'idolStatus', idolId: 'madoka', status: 'recruited' }],
  steps: [
    {
      id: 'madoka-coffee',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.madoka.coffee',
      actionLabel: '她拿起桌上的咖啡',
      when: [
        { kind: 'idolStatus', idolId: 'madoka', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.madoka.coffee', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'madoka-walk',
      locationId: 'seaside',
      timeWindow: { fromMinute: 14 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.madoka.walk',
      actionLabel: '外景下见，她沿着水边走',
      when: [
        { kind: 'flag', key: 'completed.madoka.coffee', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.madoka.walk', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'madoka-blanket',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 18 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.madoka.blanket',
      actionLabel: '练习室的人走光了',
      when: [
        { kind: 'flag', key: 'completed.madoka.walk', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.madoka.blanket', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'madoka-sign',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.madoka.sign',
      actionLabel: '桌上放着一张签名的草稿',
      when: [
        { kind: 'flag', key: 'completed.madoka.blanket', value: true },
        { kind: 'dayAtLeast', day: 13 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.madoka.sign', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'madoka-exception',
      locationId: 'studio',
      timeWindow: { fromMinute: 17 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.madoka.exception',
      actionLabel: '收工之后，车还停在摄影棚外',
      when: [
        { kind: 'flag', key: 'completed.madoka.sign', value: true },
        { kind: 'dayAtLeast', day: 16 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 3 },
        { kind: 'flag', key: 'completed.madoka.exception', value: true },
      ],
    },
  ],
};

export default madokaCard;
