import type { StoryChainDef } from '../../types';

/**
 * hiori 的初始卡「柔らかな微笑み」——**一张卡就是一条剧情链**。
 *
 * 5 步 = 5 段 commu；每步自带地点、时间窗、对话、奖励和完成 flag。
 * 手册里因此只占一条，展开能看到 5 步的进度。
 *
 * 第一段藏起来（revealMode: 'triggered'）：靠地图提示被发现，触发后才进手册。
 */
const hioriSmileCard: StoryChainDef = {
  id: 'hiori-smile-card',
  idolId: 'hiori',
  title: '柔らかな微笑み',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '去面试会场的路上，她走得很快',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'hiori', status: 'recruited' },
  ],
  steps: [
    {
      id: 'hiori-smile',
      locationId: 'station',
      timeWindow: { fromMinute: 540, toMinute: 900 },
      dialogueId: 'dialogue.hiori.smile',
      actionLabel: '去面试会场的路上',
      when: [{"kind":"idolStatus","idolId":"hiori","status":"recruited"}, {"kind":"dayAtLeast","day":3}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
        { kind: 'flag', key: 'completed.hiori.smile', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hiori-support',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 1200, toMinute: 1380 },
      dialogueId: 'dialogue.hiori.support',
      actionLabel: '练习室的灯还亮着',
      when: [{"kind":"flag","key":"completed.hiori.smile","value":true}, {"kind":"dayAtLeast","day":6}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.hiori.support', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hiori-gift',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 660, toMinute: 1020 },
      dialogueId: 'dialogue.hiori.gift',
      actionLabel: '她说要找和小饰物',
      when: [{"kind":"flag","key":"completed.hiori.support","value":true}, {"kind":"dayAtLeast","day":9}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'attributeExp', ref: 'expression', tier: 1 },
        { kind: 'flag', key: 'completed.hiori.gift', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hiori-answer',
      locationId: 'office',
      timeWindow: { fromMinute: 900, toMinute: 1140 },
      dialogueId: 'dialogue.hiori.answer',
      actionLabel: '采访结束了',
      when: [{"kind":"flag","key":"completed.hiori.gift","value":true}, {"kind":"dayAtLeast","day":12}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -4 },
        { kind: 'flag', key: 'completed.hiori.answer', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'hiori-ideal',
      locationId: 'studio',
      timeWindow: { fromMinute: 960, toMinute: 1260 },
      dialogueId: 'dialogue.hiori.ideal',
      actionLabel: '演出结束了，她在喝水',
      when: [{"kind":"flag","key":"completed.hiori.answer","value":true}, {"kind":"dayAtLeast","day":15}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 5 },
        { kind: 'sharedStat', stat: 'stress', delta: -6 },
        { kind: 'flag', key: 'completed.hiori.ideal', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default hioriSmileCard;
