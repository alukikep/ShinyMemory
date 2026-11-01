import type { StoryChainDef } from '../../types';

/**
 * にちかの卡面「♡まっクろはムウサぎ♡」—— 禁区、没来陪的课、唱片店、
 * 冰箱上的名字、一栋"大家都回来"的家。
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五个小节：あたりますね / もっとあたりますね / あた / やばいいきもの笑 / 家。
 */
const nichikaCard: StoryChainDef = {
  id: 'nichika-kuro',
  idolId: 'nichika',
  title: '♡まっクろはムウサぎ♡',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的椅子围成了一个圈',
  revealWhen: [{ kind: 'idolStatus', idolId: 'nichika', status: 'recruited' }],
  steps: [
    {
      id: 'nichika-noentry',
      locationId: 'office',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.nichika.noentry',
      actionLabel: '她在地板上练步子',
      when: [
        { kind: 'idolStatus', idolId: 'nichika', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.nichika.noentry', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'nichika-alone',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 18 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.nichika.alone',
      actionLabel: '课结束了，她一个人收东西',
      when: [
        { kind: 'flag', key: 'completed.nichika.noentry', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: 3 },
        { kind: 'flag', key: 'completed.nichika.alone', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'nichika-call',
      locationId: 'record_shop',
      timeWindow: { fromMinute: 16 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.nichika.call',
      actionLabel: '手机连着三条『来一下』',
      when: [
        { kind: 'flag', key: 'completed.nichika.alone', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.nichika.call', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'nichika-rabbit',
      locationId: 'office',
      timeWindow: { fromMinute: 16 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.nichika.rabbit',
      actionLabel: '她在冰箱前拿着油性笔',
      when: [
        { kind: 'flag', key: 'completed.nichika.call', value: true },
        { kind: 'dayAtLeast', day: 13 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.nichika.rabbit', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'nichika-house',
      locationId: 'office_roof',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.nichika.house',
      actionLabel: '傍晚，她趴在屋顶的围栏上',
      when: [
        { kind: 'flag', key: 'completed.nichika.rabbit', value: true },
        { kind: 'dayAtLeast', day: 16 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 3 },
        { kind: 'flag', key: 'completed.nichika.house', value: true },
      ],
    },
  ],
};

export default nichikaCard;
