import type { StoryChainDef } from '../../types';

/**
 * 樹里的卡面「バッドガールの羽ばたき」—— 服屋前、粉丝信、旧照片。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const juriCard: StoryChainDef = {
  id: 'juri-look',
  idolId: 'juri',
  title: 'バッドガールの羽ばたき',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '服屋前面有人一直在转',
  revealWhen: [{ kind: 'idolStatus', idolId: 'juri', status: 'recruited' }],
  steps: [
    {
      id: 'juri-shop',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.juri.shop',
      actionLabel: '她在服屋前转来转去',
      when: [
        { kind: 'idolStatus', idolId: 'juri', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.juri.shop', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'juri-letter',
      locationId: 'studio',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.juri.letter',
      actionLabel: '拍摄前她坐在走廊上',
      when: [
        { kind: 'flag', key: 'completed.juri.shop', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.juri.letter', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'juri-photo',
      locationId: 'office',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.juri.photo',
      actionLabel: '她把旧照片摊在桌上',
      when: [
        { kind: 'flag', key: 'completed.juri.letter', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.juri.photo', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default juriCard;
