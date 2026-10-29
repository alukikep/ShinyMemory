import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'bond.mano.extra_practice',
  name: '陪她加练',
  description: '她想再练一遍刚才那个音。',
  kind: 'bond',
  target: 'present-idol',
  // 只有真乃有这个按钮；灯织的互动页看不到它。
  idolIds: ['mano'],
  locations: ['practice_room'],
  durationMinutes: 60,
  timeWindows: [{ fromMinute: 480, toMinute: 1200 }],
  cost: { stamina: 10 },
  effects: [
    { kind: 'attributeExp', ref: 'vocal', tier: 1 },
    { kind: 'attributeExp', ref: 'trust', tier: 3 },
    { kind: 'fans', value: 5 },
  ],
  resultTexts: ['她又唱了一遍，这次没有看谱。'],
};

export default card;
