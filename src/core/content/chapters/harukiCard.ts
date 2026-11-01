import type { StoryChainDef } from '../../types';

/**
 * はるき 的卡面「【Hopeland】」。
 *
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五节：书店挑杂志 / 录音棚睡着 / 海边散步 / 签名会的信 / 名字。
 * 一条线：**她总想再多待一会儿**——多聊几句、多留一会儿、给每个人写一封信；
 * 最后一节才说出为什么：她一直不太喜欢自己的名字。
 *
 * 地点：商业街（书店与奶茶）→ 录音棚 → 滨风海岸 → 事务所（信）→ 会场（共演）。
 */
const harukiCard: StoryChainDef = {
  id: 'haruki-card',
  idolId: 'haruki',
  title: '【Hopeland】',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '桌上摞着三本没拆封的杂志',
  revealWhen: [{ kind: 'idolStatus', idolId: 'haruki', status: 'recruited' }],
  steps: [
    {
      id: 'haruki-books',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.haruki.books',
      actionLabel: '书店里她挑杂志挑了很久',
      source: '202800401',
      when: [
        { kind: 'idolStatus', idolId: 'haruki', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'flag', key: 'completed.haruki.books', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'haruki-nap',
      locationId: 'studio',
      timeWindow: { fromMinute: 14 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.haruki.nap',
      actionLabel: '棚里找不到人，她睡在地板上',
      source: '202800402',
      when: [
        { kind: 'flag', key: 'completed.haruki.books', value: true },
        { kind: 'dayAtLeast', day: 5 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: 4 },
        { kind: 'flag', key: 'completed.haruki.nap', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'haruki-seaside',
      locationId: 'park',
      timeWindow: { fromMinute: 16 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.haruki.seaside',
      actionLabel: '收工后，她想在海边多待一会儿',
      source: '202800403',
      when: [
        { kind: 'flag', key: 'completed.haruki.nap', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.haruki.seaside', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'haruki-letters',
      locationId: 'office',
      timeWindow: { fromMinute: 9 * 60, toMinute: 13 * 60 },
      dialogueId: 'dialogue.haruki.letters',
      actionLabel: '签名会前，她抱着一叠信',
      source: '202800404',
      when: [
        { kind: 'flag', key: 'completed.haruki.seaside', value: true },
        { kind: 'dayAtLeast', day: 9 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.haruki.letters', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'haruki-name',
      locationId: 'hall',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.haruki.name',
      actionLabel: '共演的后台，有人念错了她的名字',
      source: '202800411',
      when: [
        { kind: 'flag', key: 'completed.haruki.letters', value: true },
        { kind: 'dayAtLeast', day: 11 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 10 },
        { kind: 'flag', key: 'completed.haruki.name', value: true },
      ],
    },
  ],
};

export default harukiCard;
