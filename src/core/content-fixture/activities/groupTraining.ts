import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'group_training',
  name: '统一训练',
  description: '把在场的人叫到一起，同一套菜单，练满两个小时。',
  kind: 'training',
  target: 'all-present-idols',
  locations: ['practice_room'],
  durationMinutes: 120,
  timeWindows: [{ fromMinute: 480, toMinute: 1200 }],
  cost: {
    money: 2000,
    stamina: 30,
  },
  effects: [
    { kind: 'attributeExp', ref: 'vocal', tier: 1 },
    { kind: 'attributeExp', ref: 'dance', tier: 1 },
    { kind: 'attributeExp', ref: 'expression', tier: 1 },
    { kind: 'attributeExp', ref: 'trust', tier: 1 },
  ],
  resultTexts: [
    '同样的动作重复到第三遍，谁都没有喊停。',
    '练完之后房间里只剩呼吸声。',
  ],
};

export default card;
