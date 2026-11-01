import type { StoryChainDef } from '../../types';

/**
 * 小糸的卡面「ポシェットの中には」—— 作业、清早、落选、公园、第一次进摄影棚。
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 原作五个小节：絡まる糸を解くように / 運転手さんあのね / 花丸かくれんぼ /
 * 公園うさぎはとべない / 或いは編むように。
 */
const koitoCard: StoryChainDef = {
  id: 'koito-pochette',
  idolId: 'koito',
  title: 'ポシェットの中には',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的桌上摊着一本写满的笔记本',
  revealWhen: [{ kind: 'idolStatus', idolId: 'koito', status: 'recruited' }],
  steps: [
    {
      id: 'koito-homework',
      locationId: 'office',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.koito.homework',
      actionLabel: '她趴在桌上写作业',
      when: [
        { kind: 'idolStatus', idolId: 'koito', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.koito.homework', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'koito-notebook',
      locationId: 'office',
      timeWindow: { fromMinute: 6 * 60, toMinute: 8 * 60 },
      dialogueId: 'dialogue.koito.notebook',
      actionLabel: '清早，事务所的门还没开',
      when: [
        { kind: 'flag', key: 'completed.koito.homework', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.koito.notebook', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'koito-fail',
      locationId: 'office',
      timeWindow: { fromMinute: 15 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.koito.fail',
      actionLabel: '她低着头走进事务所',
      when: [
        { kind: 'flag', key: 'completed.koito.notebook', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: 3 },
        { kind: 'flag', key: 'completed.koito.fail', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'koito-park',
      locationId: 'park',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.koito.park',
      actionLabel: '傍晚的公园，她站在游乐设施前',
      when: [
        { kind: 'flag', key: 'completed.koito.fail', value: true },
        { kind: 'dayAtLeast', day: 13 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.koito.park', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'koito-studio',
      locationId: 'studio',
      timeWindow: { fromMinute: 9 * 60, toMinute: 12 * 60 },
      dialogueId: 'dialogue.koito.studio',
      actionLabel: '第一次进摄影棚',
      when: [
        { kind: 'flag', key: 'completed.koito.park', value: true },
        { kind: 'dayAtLeast', day: 16 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 3 },
        { kind: 'flag', key: 'completed.koito.studio', value: true },
      ],
    },
  ],
};

export default koitoCard;
