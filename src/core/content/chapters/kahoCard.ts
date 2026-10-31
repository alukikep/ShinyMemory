import type { StoryChainDef } from '../../types';

/**
 * 果穂的卡面「マメ丸と一緒！」—— 柴犬、下校路、英雄秀的红战士。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const kahoCard: StoryChainDef = {
  id: 'kaho-mamemaru',
  idolId: 'kaho',
  title: 'マメ丸と一緒！',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '收工路上有人在遛狗',
  revealWhen: [{ kind: 'idolStatus', idolId: 'kaho', status: 'recruited' }],
  steps: [
    {
      id: 'kaho-walk',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.kaho.walk',
      actionLabel: '收工路上遇到一只小狗',
      when: [
        { kind: 'idolStatus', idolId: 'kaho', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.kaho.walk', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'kaho-home',
      locationId: 'park',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.kaho.home',
      actionLabel: '下校路上她背着书包',
      when: [
        { kind: 'flag', key: 'completed.kaho.walk', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.kaho.home', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'kaho-red',
      locationId: 'studio',
      timeWindow: { fromMinute: 840, toMinute: 1140 },
      dialogueId: 'dialogue.kaho.red',
      actionLabel: '英雄秀开演前',
      when: [
        { kind: 'flag', key: 'completed.kaho.home', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.kaho.red', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default kahoCard;
