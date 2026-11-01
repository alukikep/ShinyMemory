import type { StoryChainDef } from '../../types';

/**
 * 愛依的卡面「うちのペースで」—— 事务所的作业、接送、课题通过。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const meiCard: StoryChainDef = {
  id: 'mei-pace',
  idolId: 'mei',
  title: 'うちのペースで',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的桌子上摊着作业',
  revealWhen: [{ kind: 'idolStatus', idolId: 'mei', status: 'recruited' }],
  steps: [
    {
      id: 'mei-homework',
      locationId: 'office',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.mei.homework',
      actionLabel: '她在事务所摊开作业',
      when: [
        { kind: 'idolStatus', idolId: 'mei', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.mei.homework', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mei-drive',
      locationId: 'seaside',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.mei.drive',
      actionLabel: '今天的工作要开车去',
      when: [
        { kind: 'flag', key: 'completed.mei.homework', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.mei.drive', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mei-report',
      locationId: 'office',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.mei.report',
      actionLabel: '她跑进事务所喊"听我说"',
      when: [
        { kind: 'flag', key: 'completed.mei.drive', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.mei.report', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default meiCard;
