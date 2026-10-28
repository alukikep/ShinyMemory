import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  id: 'lesson_dance_advanced',
  name: '进阶舞蹈课',
  description: '镜墙前的编舞课，节拍比平时更快，要求也更细。',
  kind: 'training',
  locations: ['practice_room'],
  durationMinutes: 120,
  timeWindows: [{ fromMinute: 600, toMinute: 1200 }],
  cost: {
    money: 800,
    stamina: 25,
  },
  requires: [
    { kind: 'attributeAtLeast', ref: 'dance', rank: 'D' },
    { kind: 'flag', key: 'lesson_dance_advanced_done', value: false },
  ],
  effects: [
    { kind: 'attributeExp', ref: 'dance', tier: 5 },
    { kind: 'flag', key: 'lesson_dance_advanced_done', value: true },
  ],
  resultTexts: [
    '最后一个八拍结束时，她扶着膝盖喘气，还是抬头确认了镜子里的自己。',
    '老师把动作拆成三段，她终于把一直做错的转身接上了。',
  ],
};

export default card;
