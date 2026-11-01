import type { StoryChainDef } from '../../types';

/**
 * ルカ 的卡面「【broken shout】」——移籍之后工作断掉的那一段。
 *
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五节：割れたまま / 無防備 / 残痕 / 生身 / むき出し。
 * 时间线接在她的招募之后：她刚进 283，前事务所的工作全断了，
 * 采访说不出话，最后在一场音响全坏的 live 上一个人喊完。
 *
 * 地点每一步都换：事务所（跑电视台的成果）→ 站前（她常去的喫茶店）
 * → 录音棚（采访）→ 会场（live）→ 会场（第二天的收尾）。
 */
const lucaCard: StoryChainDef = {
  id: 'luca-card',
  idolId: 'luca',
  title: '【broken shout】',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的桌上摊着一份没人接的委托表',
  revealWhen: [{ kind: 'idolStatus', idolId: 'luca', status: 'recruited' }],
  steps: [
    {
      id: 'luca-broken',
      locationId: 'office',
      timeWindow: { fromMinute: 17 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.luca.broken',
      actionLabel: '她跟着跑完了一整天的电视台',
      source: '202600401',
      when: [
        { kind: 'idolStatus', idolId: 'luca', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'flag', key: 'completed.luca.broken', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'luca-cafe',
      locationId: 'station',
      timeWindow: { fromMinute: 15 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.luca.cafe',
      actionLabel: '站前的喫茶店里，她一个人坐着',
      source: '202600402',
      when: [
        { kind: 'flag', key: 'completed.luca.broken', value: true },
        { kind: 'dayAtLeast', day: 5 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: 4 },
        { kind: 'flag', key: 'completed.luca.cafe', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'luca-interview',
      locationId: 'studio',
      timeWindow: { fromMinute: 14 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.luca.interview',
      actionLabel: '采访中途，她停住了',
      source: '202600403',
      when: [
        { kind: 'flag', key: 'completed.luca.cafe', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: 6 },
        { kind: 'flag', key: 'completed.luca.interview', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'luca-live',
      locationId: 'hall',
      timeWindow: { fromMinute: 17 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.luca.live',
      actionLabel: '小型 live，音响全坏了',
      source: '202600404',
      when: [
        { kind: 'flag', key: 'completed.luca.interview', value: true },
        { kind: 'dayAtLeast', day: 9 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -8 },
        { kind: 'flag', key: 'completed.luca.live', value: true },
      ],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'luca-bare',
      locationId: 'hall',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.luca.bare',
      actionLabel: '第二天的会场，她来得比谁都晚',
      source: '202600411',
      when: [
        { kind: 'flag', key: 'completed.luca.live', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.luca.bare', value: true },
      ],
    },
  ],
};

export default lucaCard;
