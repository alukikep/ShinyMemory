import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'demo_recording',
  name: '录音小样',
  description: '只录一段试唱，能不能过全看这一条嗓子。',
  kind: 'work',
  locations: ['studio'],
  durationMinutes: 120,
  timeWindows: [{ fromMinute: 10 * 60, toMinute: 22 * 60 }],
  cost: {
    stamina: 15,
  },
  effects: [{ kind: 'sharedStat', stat: 'stress', delta: 8 }],
  workReward: {
    baseMoney: 1800,
    terms: [{ ref: 'vocal' }],
  },
  workRisk: {
    ref: 'vocal',
    minRank: 'F',
    safeRank: 'C',
  },
  resultTexts: [
    '一条过。对面的人摘下耳机，说“可以了”。',
    '录了三遍，最后用的是第一遍。',
    '她唱完没有抬头，等着耳机里那句评价。',
  ],
};

export default card;
