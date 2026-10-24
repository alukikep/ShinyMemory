import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'sleep',
  name: '睡觉',
  description: '晚上 20:00 后可以睡到早上 8 点。睡多久，就恢复多少体力。',
  kind: 'sleep',
  locations: ['home'],
  durationMinutes: 0,
  cost: {},
  effects: [],
  requires: [
    { kind: 'timeWindow', fromMinute: 20 * 60, toMinute: 6 * 60 },
  ],
  resultTexts: ['你睡到早上 8 点。'],
};

export default card;
