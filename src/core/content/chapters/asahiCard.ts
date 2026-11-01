import type { StoryChainDef } from '../../types';

/**
 * あさひ的卡面「見つけたもの」—— 公園のマジシャン、待ち伏せ、朝の練習室。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const asahiCard: StoryChainDef = {
  id: 'asahi-curious',
  idolId: 'asahi',
  title: '見つけたもの',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '公园里有人在打听什么',
  revealWhen: [{ kind: 'idolStatus', idolId: 'asahi', status: 'recruited' }],
  steps: [
    {
      id: 'asahi-magician',
      locationId: 'park',
      timeWindow: { fromMinute: 960, toMinute: 1200 },
      dialogueId: 'dialogue.asahi.magician',
      actionLabel: '她拦住路人问魔术师在哪',
      when: [
        { kind: 'idolStatus', idolId: 'asahi', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.asahi.magician', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'asahi-ambush',
      locationId: 'office',
      timeWindow: { fromMinute: 600, toMinute: 780 },
      dialogueId: 'dialogue.asahi.ambush',
      actionLabel: '她从背后冒出来',
      when: [
        { kind: 'flag', key: 'completed.asahi.magician', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.asahi.ambush', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'asahi-morning',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 720, toMinute: 900 },
      dialogueId: 'dialogue.asahi.morning',
      actionLabel: '清晨的练习室有人在呼吸',
      when: [
        { kind: 'flag', key: 'completed.asahi.ambush', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'dance', tier: 1 },
        { kind: 'flag', key: 'completed.asahi.morning', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default asahiCard;
