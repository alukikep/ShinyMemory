import type { StoryChainDef } from '../../types';

/**
 * 甘奈的卡面「パーフェクト・スマイル」—— 事务所的杂志、街头没买的那件、男装店。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const amanaCard: StoryChainDef = {
  id: 'amana-smile',
  idolId: 'amana',
  title: 'パーフェクト・スマイル',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '事务所的沙发上摊着杂志',
  revealWhen: [{ kind: 'idolStatus', idolId: 'amana', status: 'recruited' }],
  steps: [
    {
      id: 'amana-magazine',
      locationId: 'office',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.amana.magazine',
      actionLabel: '她留在事务所翻杂志',
      when: [
        { kind: 'idolStatus', idolId: 'amana', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.amana.magazine', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'amana-window',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 780, toMinute: 1020 },
      dialogueId: 'dialogue.amana.window',
      actionLabel: '她在店门口看了很久',
      when: [
        { kind: 'flag', key: 'completed.amana.magazine', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.amana.window', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'amana-menswear',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.amana.menswear',
      actionLabel: '她拉你去一家男装店',
      when: [
        { kind: 'flag', key: 'completed.amana.window', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.amana.menswear', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default amanaCard;
