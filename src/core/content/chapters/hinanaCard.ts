import type { StoryChainDef } from '../../types';

/**
 * 雛菜的卡面「HAPPY-!NG」—— 折纸的进路调查、站台的果汁、
 * 放错地方的调查表、杂志采访、喫茶店的马卡龙。
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五个小节：END!NG / P-each / XOXO / Inter♡iew / CherryPick!NG。
 */
const hinanaCard: StoryChainDef = {
  id: 'hinana-happy',
  idolId: 'hinana',
  title: 'HAPPY-!NG',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的桌上落着一张折成心形的纸',
  revealWhen: [{ kind: 'idolStatus', idolId: 'hinana', status: 'recruited' }],
  steps: [
    {
      id: 'hinana-origami',
      locationId: 'office',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.hinana.origami',
      actionLabel: '她低着头折着什么',
      when: [
        { kind: 'idolStatus', idolId: 'hinana', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.hinana.origami', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hinana-juice',
      locationId: 'station',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.hinana.juice',
      actionLabel: '站台等电车，她说想喝果汁',
      when: [
        { kind: 'flag', key: 'completed.hinana.origami', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.hinana.juice', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hinana-paper',
      locationId: 'office',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.hinana.paper',
      actionLabel: '手机上连着三条消息',
      when: [
        { kind: 'flag', key: 'completed.hinana.juice', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.hinana.paper', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hinana-interview',
      locationId: 'studio',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.hinana.interview',
      actionLabel: '杂志拍摄之后的采访',
      when: [
        { kind: 'flag', key: 'completed.hinana.paper', value: true },
        { kind: 'dayAtLeast', day: 13 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 3 },
        { kind: 'flag', key: 'completed.hinana.interview', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hinana-macaron',
      locationId: 'station',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.hinana.macaron',
      actionLabel: '喫茶店的桌子被点心占满',
      when: [
        { kind: 'flag', key: 'completed.hinana.interview', value: true },
        { kind: 'dayAtLeast', day: 16 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.hinana.macaron', value: true },
      ],
    },
  ],
};

export default hinanaCard;
