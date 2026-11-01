import type { StoryChainDef } from '../../types';

/**
 * 透的卡面「10個、光」—— 问卷、夜里的公交、练习室的电影、食堂、公园的星星。
 * 5 步 = 5 段 commu；第一段藏起来（revealMode: 'triggered'）。
 *
 * 首尾是一条线：「一生のうちにやりたい10のこと」在第一章提出，第五章她把星星加进去。
 */
const toruCard: StoryChainDef = {
  id: 'toru-light',
  idolId: 'toru',
  title: '10個、光',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的桌上摊着一张问卷',
  revealWhen: [{ kind: 'idolStatus', idolId: 'toru', status: 'recruited' }],
  steps: [
    {
      id: 'toru-questionnaire',
      locationId: 'office',
      timeWindow: { fromMinute: 19 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.toru.questionnaire',
      actionLabel: '她对着问卷想了很久',
      when: [
        { kind: 'idolStatus', idolId: 'toru', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.toru.questionnaire', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'toru-bus',
      locationId: 'station',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.toru.bus',
      actionLabel: '回程的公交上，她睡着了',
      when: [
        { kind: 'flag', key: 'completed.toru.questionnaire', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.toru.bus', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'toru-movie',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 16 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.toru.movie',
      actionLabel: '她坐在角落看手机里的电影',
      when: [
        { kind: 'flag', key: 'completed.toru.bus', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'expression', tier: 3 },
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'flag', key: 'completed.toru.movie', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'toru-wari',
      locationId: 'station',
      timeWindow: { fromMinute: 18 * 60, toMinute: 21 * 60 },
      dialogueId: 'dialogue.toru.wari',
      actionLabel: '她盯着账单不动',
      when: [
        { kind: 'flag', key: 'completed.toru.movie', value: true },
        { kind: 'dayAtLeast', day: 13 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'flag', key: 'completed.toru.wari', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'toru-star',
      locationId: 'park',
      timeWindow: { fromMinute: 16 * 60, toMinute: 19 * 60 },
      dialogueId: 'dialogue.toru.star',
      actionLabel: '傍晚的公园，她仰着头',
      when: [
        { kind: 'flag', key: 'completed.toru.wari', value: true },
        { kind: 'dayAtLeast', day: 16 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 3 },
        { kind: 'flag', key: 'completed.toru.star', value: true },
      ],
    },
  ],
};

export default toruCard;
