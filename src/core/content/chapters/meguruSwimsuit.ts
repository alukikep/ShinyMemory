import type { StoryChainDef } from '../../types';

/**
 * 卡面章「泳装的颜色」（巡）。
 *
 * 素材：P 卡【夏に恋するピチカート！】/ カラフルサマー.csv（62 行，含三选一并合流）
 * 改编级别：L1 压缩 + L2 补桥段。三条锚点登记在 chapterSources.ts。
 *
 * cadenceDays 2：剧情日每两天出现一次——试点用它验证"错过顺延一个周期"。
 * workPolicy 'open'：只挡剧情日那一天，玩家可以一边接活一边推进。
 *
 * 状态：**待接入**。4 段对话在审查台待审，通过后由 storyChains.ts 引入。
 */
const meguruSwimsuit: StoryChainDef = {
  id: 'meguru-swimsuit',
  idolId: 'meguru',
  title: '泳装的颜色',
  priority: 30,
  cadenceDays: 2,
  workPolicy: 'open',
  revealWhen: [{ kind: 'idolStatus', idolId: 'meguru', status: 'recruited' }],
  steps: [
    {
      id: 'swimsuit-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 10 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.meguru.swimsuit',
      actionLabel: '杂志那边约了新人特集',
      when: [
        { kind: 'flag', key: 'completed.meguru.swimsuit', value: true },
        { kind: 'dayAtLeast', day: 5 },
      ],
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: -5 },
        { kind: 'flag', key: 'completed.meguru.swimsuit', value: true },
      ],
      complete: { nextStepDelayDays: 2 },
    },
  ],
};


export default meguruSwimsuit;
