import type { ActorDef } from '../../types';

const actor: ActorDef = {
  id: 'meguru',
  name: '八宫巡',
  role: 'idol',
  description:
    'illumination STARS 的成员。开朗、行动力强，喜欢热闹和新鲜事物。',
  color: '#f2c35f',
  schedule: [
    {
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [1, 3, 5],
      label: '外出',
      visibility: 'private',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 20 * 60,
      locationId: 'studio',
      weekdays: [1, 3, 5],
      label: '收录',
    },
    {
      fromMinute: 8 * 60,
      toMinute: 10 * 60,
      locationId: 'school',
      weekdays: [2, 4],
      label: '上学',
      visibility: 'private',
    },
    {
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      locationId: 'practice_room',
      weekdays: [2, 4],
      label: '练习',
    },
    {
      fromMinute: 10 * 60,
      toMinute: 14 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      label: '练习',
    },
    {
      fromMinute: 14 * 60,
      toMinute: 20 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      label: '外出',
      visibility: 'private',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 18 * 60,
      weekdays: [0],
      label: '自由活动',
      visibility: 'private',
      protected: false,
    },
  ],
  topics: [],
};

export default actor;
