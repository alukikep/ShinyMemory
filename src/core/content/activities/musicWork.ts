import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'music_work',
  name: '大型音乐节目',
  description: '只有具备足够歌唱实力的人才能站上的舞台。',
  kind: 'work',
  locations: ['studio'],
  durationMinutes: 240,
  timeWindows: [{ fromMinute: 10 * 60, toMinute: 1439 }],
  cost: {
    stamina: 20,
  },
  effects: [
    { kind: 'sharedStat', stat: 'stress', delta: 12 },
  ],
  workReward: {
    baseMoney: 3000,
    checks: [
      { attribute: 'vocal', weight: 0.8 },
      { attribute: 'trust', weight: 0.2 },
    ],
  },
  workRisk: {
    attribute: 'vocal',
    minRank: 'B',
    safeRank: 'B',
  },
  resultTexts: [
    '她站在灯光中央，第一句出来时，台下安静了一瞬。',
    '节目播出后，事务所收到了一封陌生的夸奖邮件。',
    '收工时已经很晚。她把节目组的纪念牌放进包里，动作很轻。',
  ],
};

export default card;
