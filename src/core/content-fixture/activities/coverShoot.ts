import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'cover_shoot',
  name: '杂志封面',
  description: '她得撑住镜头，你得撑住整场。两样缺一个都成不了。',
  kind: 'work',
  locations: ['studio'],
  durationMinutes: 210,
  timeWindows: [{ fromMinute: 9 * 60, toMinute: 19 * 60 }],
  cost: {
    stamina: 22,
  },
  effects: [{ kind: 'sharedStat', stat: 'stress', delta: 14 }],
  workReward: {
    baseMoney: 2600,
    combine: 'product',
    terms: [
      { ref: 'expression' },
      { ref: { scope: 'producer', key: 'photography' } },
    ],
  },
  workRisk: {
    // 不写 ref：对全部 terms 取最差的一项。
    minRank: 'F',
    safeRank: 'C',
  },
  resultTexts: [
    '封面样本送过来的时候，她盯着看了很久，什么也没说。',
    '编辑说这张不用修。你在旁边笑了一下。',
    '收工时已经很晚，她还穿着拍摄那套衣服。',
  ],
};

export default card;
