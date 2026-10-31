import type { StoryChainDef } from '../../types';

/**
 * mano 的初始卡「ほわっとスマイル」——**一张卡就是一条剧情链**。
 *
 * 5 步 = 5 段 commu；每步自带地点、时间窗、对话、奖励和完成 flag。
 * 手册里因此只占一条，展开能看到 5 步的进度。
 *
 * 第一段藏起来（revealMode: 'triggered'）：靠地图提示被发现，触发后才进手册。
 */
const manoSmile: StoryChainDef = {
  id: 'mano-smile',
  idolId: 'mano',
  title: 'ほわっとスマイル',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '公园里有鸽子聚过来',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
  ],
  steps: [
    {
      id: 'mano-hover',
      locationId: 'park',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.mano.hover',
      actionLabel: '公园里有鸽子在聚',
      when: [{"kind":"idolStatus","idolId":"mano","status":"recruited"}, {"kind":"dayAtLeast","day":3}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.mano.hover', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mano-plainclothes',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 720, toMinute: 1080 },
      dialogueId: 'dialogue.mano.plainclothes',
      actionLabel: '真乃在和谁说话',
      when: [{"kind":"flag","key":"completed.mano.hover","value":true}, {"kind":"dayAtLeast","day":6}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.mano.plainclothes', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mano-growth',
      locationId: 'office',
      timeWindow: { fromMinute: 1080, toMinute: 1320 },
      dialogueId: 'dialogue.mano.growth',
      actionLabel: '灯还亮着，她还在看照片',
      when: [{"kind":"flag","key":"completed.mano.plainclothes","value":true}, {"kind":"dayAtLeast","day":9}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.mano.growth', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mano-afterglow',
      locationId: 'home',
      timeWindow: { fromMinute: 840, toMinute: 1140 },
      dialogueId: 'dialogue.mano.afterglow',
      actionLabel: '收工了，她还想再待一会儿',
      when: [{"kind":"flag","key":"completed.mano.growth","value":true}, {"kind":"dayAtLeast","day":12}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.mano.afterglow', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'mano-dream',
      locationId: 'park',
      timeWindow: { fromMinute: 900, toMinute: 1200 },
      dialogueId: 'dialogue.mano.dream',
      actionLabel: '她在长椅上睡着了',
      when: [{"kind":"flag","key":"completed.mano.afterglow","value":true}, {"kind":"dayAtLeast","day":15}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -6 },
        { kind: 'flag', key: 'completed.mano.dream', value: true },
      ],
      complete: { nextStepDelayDays: 3 },
    },
  ],
};

export default manoSmile;
