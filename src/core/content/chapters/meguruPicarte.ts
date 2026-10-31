import type { StoryChainDef } from '../../types';

/**
 * meguru 的初始卡「夏に恋するピチカート！」——**一张卡就是一条剧情链**。
 *
 * 5 步 = 5 段 commu；每步自带地点、时间窗、对话、奖励和完成 flag。
 * 手册里因此只占一条，展开能看到 5 步的进度。
 *
 * 第一段藏起来（revealMode: 'triggered'）：靠地图提示被发现，触发后才进手册。
 */
const meguruPicarte: StoryChainDef = {
  id: 'meguru-picarte',
  idolId: 'meguru',
  title: '夏に恋するピチカート！',
  kind: 'card',
  priority: 5,
  cadenceDays: 1,
  workPolicy: 'open',
  revealMode: 'triggered',
  hint: '商业街的杂志摊前有人在翻版样',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'meguru', status: 'recruited' },
  ],
  steps: [
    {
      id: 'meguru-swimsuit',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 600, toMinute: 1200 },
      dialogueId: 'dialogue.meguru.swimsuit',
      actionLabel: '杂志那边约了新人特集',
      when: [{"kind":"idolStatus","idolId":"meguru","status":"recruited"}, {"kind":"dayAtLeast","day":5}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.swimsuit', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'meguru-sunshine',
      locationId: 'pool',
      timeWindow: { fromMinute: 600, toMinute: 1200 },
      dialogueId: 'dialogue.meguru.sunshine',
      actionLabel: '拍摄结束了',
      when: [{"kind":"flag","key":"completed.meguru.swimsuit","value":true}, {"kind":"dayAtLeast","day":8}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.sunshine', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'meguru-purity',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 480, toMinute: 720 },
      dialogueId: 'dialogue.meguru.purity',
      actionLabel: '她比集合时间早到',
      when: [{"kind":"flag","key":"completed.meguru.sunshine","value":true}, {"kind":"dayAtLeast","day":12}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.purity', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'meguru-coffee',
      locationId: 'office',
      timeWindow: { fromMinute: 1080, toMinute: 1320 },
      dialogueId: 'dialogue.meguru.coffee',
      actionLabel: '有人把你叫醒',
      when: [{"kind":"flag","key":"completed.meguru.purity","value":true}, {"kind":"dayAtLeast","day":14}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.coffee', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
    {
      id: 'meguru-stars',
      locationId: 'park',
      timeWindow: { fromMinute: 1140, toMinute: 1380 },
      dialogueId: 'dialogue.meguru.stars',
      actionLabel: '她抬头看星星',
      when: [{"kind":"flag","key":"completed.meguru.coffee","value":true}, {"kind":"dayAtLeast","day":16}],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.stars', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default meguruPicarte;
