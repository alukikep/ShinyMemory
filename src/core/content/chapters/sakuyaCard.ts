import type { StoryChainDef } from '../../types';

/**
 * 咲耶的卡面「秘めやかファンサービス」—— 粉丝、人潮、只剩两个人的夜。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const sakuyaCard: StoryChainDef = {
  id: 'sakuya-fanservice',
  idolId: 'sakuya',
  title: '秘めやかファンサービス',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '商店街那边围了一圈人',
  revealWhen: [{ kind: 'idolStatus', idolId: 'sakuya', status: 'recruited' }],
  steps: [
    {
      id: 'sakuya-fans',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 780, toMinute: 1080 },
      dialogueId: 'dialogue.sakuya.fans',
      actionLabel: '她被一群女孩子围着',
      when: [
        { kind: 'idolStatus', idolId: 'sakuya', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.sakuya.fans', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'sakuya-crowd',
      locationId: 'station',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.sakuya.crowd',
      actionLabel: '人潮里她找不到你',
      when: [
        { kind: 'flag', key: 'completed.sakuya.fans', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.sakuya.crowd', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'sakuya-night',
      locationId: 'park',
      timeWindow: { fromMinute: 1140, toMinute: 1320 },
      dialogueId: 'dialogue.sakuya.night',
      actionLabel: '演出结束以后',
      when: [
        { kind: 'flag', key: 'completed.sakuya.crowd', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.sakuya.night', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default sakuyaCard;
