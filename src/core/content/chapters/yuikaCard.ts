import type { StoryChainDef } from '../../types';

/**
 * 結華的卡面「カラフルメタモルフォーゼ」—— 眼镜、藏起来的东西、优胜后的道谢。
 * 3 步 = 3 段 commu；第一段藏起来（revealMode: 'triggered'）。
 */
const yuikaCard: StoryChainDef = {
  id: 'yuika-megane',
  idolId: 'yuika',
  title: 'カラフルメタモルフォーゼ',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '商店街新开了家杂货铺',
  revealWhen: [{ kind: 'idolStatus', idolId: 'yuika', status: 'recruited' }],
  steps: [
    {
      id: 'yuika-shop',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 780, toMinute: 1140 },
      dialogueId: 'dialogue.yuika.shop',
      actionLabel: '她说要带我去挑眼镜',
      when: [
        { kind: 'idolStatus', idolId: 'yuika', status: 'recruited' },
        { kind: 'dayAtLeast', day: 4 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.yuika.shop', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'yuika-hide',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 1140, toMinute: 1320 },
      dialogueId: 'dialogue.yuika.hide',
      actionLabel: '练习室里有人在听 CD',
      when: [
        { kind: 'flag', key: 'completed.yuika.shop', value: true },
        { kind: 'dayAtLeast', day: 7 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.yuika.hide', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'yuika-live',
      locationId: 'studio',
      timeWindow: { fromMinute: 1020, toMinute: 1260 },
      dialogueId: 'dialogue.yuika.live',
      actionLabel: '优胜之后她还有工作',
      when: [
        { kind: 'flag', key: 'completed.yuika.hide', value: true },
        { kind: 'dayAtLeast', day: 10 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.yuika.live', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default yuikaCard;
