import type { StoryChainDef } from '../../types';

/**
 * 卡面章 ② 拍摄当天（巡）。
 *
 * 素材：P 卡【夏に恋するピチカート！】/ 太陽のしずく.csv（commu 序号 02，前篇 01 的后篇）
 * 改编级别：L1 压缩 + L2 补桥段。
 *
 * 地点：泳池（为这一章新增的地点，原作拍摄现场就是室外泳池）。
 * 顺序：严格接在章 ① 之后（flag completed.meguru.swimsuit）。
 * 状态：待接入——对话在审查台待审。
 */
const meguruSunshine: StoryChainDef = {
  id: 'meguru-sunshine',
  idolId: 'meguru',
  title: '拍摄当天',
  priority: 32,
  workPolicy: 'open',
  revealWhen: [
    { kind: 'flag', key: 'completed.meguru.swimsuit', value: true },
    { kind: 'idolStatus', idolId: 'meguru', status: 'recruited' },
  ],
  steps: [
    {
      id: 'sunshine-1',
      locationId: 'pool',
      timeWindow: { fromMinute: 10 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.meguru.sunshine',
      actionLabel: '拍摄结束了',
      when: [
        { kind: 'flag', key: 'completed.meguru.swimsuit', value: true },
        { kind: 'dayAtLeast', day: 8 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.sunshine', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};

export default meguruSunshine;
