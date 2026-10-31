import type { StoryChainDef } from '../../types';

/**
 * 真乃的第二张卡「ナチュラルモード」——一张卡就是一条剧情链。
 *
 * 3 步 = 3 段 commu：逛街买包 → 远足落水 → 送玛瑙挂饰。
 * 第一段藏起来（revealMode: 'triggered'），靠地图提示被发现。
 */
const manoNatural: StoryChainDef = {
  id: 'mano-natural',
  idolId: 'mano',
  title: 'ナチュラルモード',
  kind: 'card',
  priority: 4,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '商业街的包店前，她在橱窗前站住了',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
  ],
  steps: [
    {
      id: 'mano-shopping',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 600, toMinute: 1200 },
      dialogueId: 'dialogue.mano.shopping',
      actionLabel: '她说想逛逛店',
      when: [
        { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
        { kind: 'dayAtLeast', day: 3 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.mano.shopping', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mano-hiking',
      locationId: 'park',
      timeWindow: { fromMinute: 540, toMinute: 900 },
      dialogueId: 'dialogue.mano.hiking',
      actionLabel: '大家一起去远足',
      when: [
        { kind: 'flag', key: 'completed.mano.shopping', value: true },
        { kind: 'dayAtLeast', day: 6 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -6 },
        { kind: 'flag', key: 'completed.mano.hiking', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mano-thanks',
      locationId: 'studio',
      timeWindow: { fromMinute: 900, toMinute: 1260 },
      dialogueId: 'dialogue.mano.thanks',
      actionLabel: '她一个人上大舞台',
      when: [
        { kind: 'flag', key: 'completed.mano.hiking', value: true },
        { kind: 'dayAtLeast', day: 9 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.mano.thanks', value: true },
      ],
      complete: { nextStepDelayDays: 3 },
    },
  ],
};

export default manoNatural;
