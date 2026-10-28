import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'group_greeting',
  name: '一起打个招呼',
  description: '朝在场的所有人挥挥手。',
  kind: 'bond',
  target: 'all-present-idols',
  locations: ['office', 'practice_room', 'studio'],
  durationMinutes: 30,
  timeWindows: [{ fromMinute: 480, toMinute: 1320 }],
  cost: {
    stamina: 5,
  },
  effects: [
    {
      kind: 'attributeExp',
      ref: 'trust',
      tier: 1,
    },
  ],
  resultTexts: [
    '你朝她们挥了挥手，几个人一起看了过来。',
    '谁都没有先开口，但气氛不算尴尬。',
  ],
};

export default card;
