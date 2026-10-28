import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'photo_shoot',
  name: '摄影棚拍摄',
  description: '灯位、构图、按下快门。偶像只要站在那里，成片取决于镜头后面的人。',
  kind: 'work',
  locations: ['studio'],
  durationMinutes: 150,
  timeWindows: [{ fromMinute: 9 * 60, toMinute: 20 * 60 }],
  cost: {
    stamina: 10,
  },
  effects: [{ kind: 'sharedStat', stat: 'stress', delta: 6 }],
  workReward: {
    baseMoney: 1600,
    terms: [{ ref: { scope: 'producer', key: 'photography' } }],
  },
  workRisk: {
    ref: { scope: 'producer', key: 'photography' },
    minRank: 'F',
    safeRank: 'D',
  },
  resultTexts: [
    '快门声停下的那一刻，你大概知道哪一张能用。',
    '她不太习惯被拍，但你没有让她摆姿势。',
    '灯关了之后，她凑过来看了一眼屏幕。',
  ],
};

export default card;
