import type { StoryChainDef } from '../../types';

/**
 * 冬優子的卡面「ふゆの素顔」—— 上课前赖着、限定徽章、ソロステージ。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const fuyukoCard: StoryChainDef = {
  id: 'fuyuko-trueface',
  idolId: 'fuyuko',
  title: 'ふゆの素顔',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '练习室里有人在抱怨',
  revealWhen: [{ kind: 'idolStatus', idolId: 'fuyuko', status: 'recruited' }],
  steps: [
    {
      id: 'fuyuko-lazy',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 720, toMinute: 1020 },
      dialogueId: 'dialogue.fuyuko.lazy',
      actionLabel: '她瘫在练习室的地板上',
      when: [
        { kind: 'idolStatus', idolId: 'fuyuko', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.fuyuko.lazy', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'fuyuko-badge',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.fuyuko.badge',
      actionLabel: '商店街排起了长队',
      when: [
        { kind: 'flag', key: 'completed.fuyuko.lazy', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.fuyuko.badge', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'fuyuko-solo',
      locationId: 'studio',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.fuyuko.solo',
      actionLabel: 'ソロステージ结束后的后台',
      when: [
        { kind: 'flag', key: 'completed.fuyuko.badge', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.fuyuko.solo', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default fuyukoCard;
