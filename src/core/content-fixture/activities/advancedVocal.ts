import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'lesson_vocal_advanced',
  name: '进阶声乐课',
  description: '一次小班课，老师会逐句纠正呼吸和共鸣。',
  kind: 'training',
  locations: ['practice_room'],
  durationMinutes: 120,
  timeWindows: [{ fromMinute: 600, toMinute: 1200 }],
  cost: {
    money: 800,
    stamina: 20,
  },
  requires: [
    { kind: 'rankAtLeast', attribute: 'vocal', rank: 'D' },
    { kind: 'flag', key: 'lesson_vocal_advanced_done', value: false },
  ],
  effects: [
    { kind: 'idolExp', attribute: 'vocal', tier: 5 },
    { kind: 'flag', key: 'lesson_vocal_advanced_done', value: true },
  ],
  resultTexts: [
    '老师让她把同一句唱了七遍。最后一次，她没有再躲高音。',
    '课结束后，她嗓子有点哑，但把谱子收得很仔细。',
  ],
};

export default card;
