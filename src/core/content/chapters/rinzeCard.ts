import type { StoryChainDef } from '../../types';

/**
 * 凛世的卡面「凛世、まいります」—— 日本家屋的拍摄、躲雨、接大衣。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const rinzeCard: StoryChainDef = {
  id: 'rinze-lesson',
  idolId: 'rinze',
  title: '凛世、まいります',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '今天有一场和风外景',
  revealWhen: [{ kind: 'idolStatus', idolId: 'rinze', status: 'recruited' }],
  steps: [
    {
      id: 'rinze-shoot',
      locationId: 'studio',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.rinze.shoot',
      actionLabel: '和风外景的控え室',
      when: [
        { kind: 'idolStatus', idolId: 'rinze', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.rinze.shoot', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'rinze-rain',
      locationId: 'station',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.rinze.rain',
      actionLabel: '站前突然下起雨',
      when: [
        { kind: 'flag', key: 'completed.rinze.shoot', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.rinze.rain', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'rinze-letter',
      locationId: 'office',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.rinze.letter',
      actionLabel: '她接过你的大衣',
      when: [
        { kind: 'flag', key: 'completed.rinze.rain', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.rinze.letter', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default rinzeCard;
