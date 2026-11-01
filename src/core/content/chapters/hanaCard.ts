import type { StoryChainDef } from '../../types';

/**
 * 羽那 的卡面「【Scene With You】」。
 *
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五节：01 off-shot 的姿势 / 02 「ニュー・はなタウン」的委托 /
 * 03 开园前的大头贴 / 04 可丽饼 / TE 发烧。
 *
 * 一条线：**她一直在要"和你一起"的凭证**——合照、回忆、最后是"你来接我"。
 * 制作人从头到尾在推，她一句一句把它拽回来。
 *
 * 地点：录音棚（收录后拍 off-shot）→ 事务所（合作说明）→ 游乐园（两章）→ 事务所（TE）。
 */
const hanaCard: StoryChainDef = {
  id: 'hana-card',
  idolId: 'hana',
  title: '【Scene With You】',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '桌上摊着一份游乐场的合作方案',
  revealWhen: [{ kind: 'idolStatus', idolId: 'hana', status: 'recruited' }],
  steps: [
    {
      id: 'hana-offshot',
      locationId: 'studio',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.hana.offshot',
      actionLabel: '收录结束了，工作人员想拍 off-shot',
      source: '202700601',
      when: [
        { kind: 'idolStatus', idolId: 'hana', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'flag', key: 'completed.hana.offshot', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hana-park-offer',
      locationId: 'office',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.hana.parkoffer',
      actionLabel: '游乐场的合作说明会',
      source: '202700602',
      when: [
        { kind: 'flag', key: 'completed.hana.offshot', value: true },
        { kind: 'dayAtLeast', day: 5 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'flag', key: 'completed.hana.parkoffer', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hana-purikura',
      locationId: 'theme_park',
      timeWindow: { fromMinute: 8 * 60, toMinute: 11 * 60 },
      dialogueId: 'dialogue.hana.purikura',
      actionLabel: '开园前的园区，她说要拍大头贴',
      source: '202700603',
      when: [
        { kind: 'flag', key: 'completed.hana.parkoffer', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.hana.purikura', value: true },
      ],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'hana-crepe',
      locationId: 'theme_park',
      timeWindow: { fromMinute: 11 * 60, toMinute: 14 * 60 },
      dialogueId: 'dialogue.hana.crepe',
      actionLabel: '可丽饼摊前，她要你也吃一口',
      source: '202700604',
      when: [
        { kind: 'flag', key: 'completed.hana.purikura', value: true },
        { kind: 'dayAtLeast', day: 8 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -6 },
        { kind: 'flag', key: 'completed.hana.crepe', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hana-fever',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.hana.fever',
      actionLabel: '她烧得有点迷糊',
      source: '202700611',
      when: [
        { kind: 'flag', key: 'completed.hana.crepe', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.hana.fever', value: true },
      ],
    },
  ],
};

export default hanaCard;
