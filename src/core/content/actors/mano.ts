import type { ActorDef } from '../../types';

const actor: ActorDef = {
  id: 'mano',
  name: '樱木真乃',
  role: 'idol',
  description: 'illumination STARS 的成员。温柔、认真，喜欢小动物。',
  color: '#f1b7c5',
  schedule: [
    {
      fromMinute: 8 * 60,
      toMinute: 14 * 60,
      locationId: 'practice_room',
      weekdays: [1, 2, 3, 4, 5],
      label: '练习',
    },
    {
      fromMinute: 14 * 60,
      toMinute: 20 * 60,
      locationId: 'studio',
      weekdays: [1, 2, 3, 4, 5],
      label: '收录',
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
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [6],
      label: '收录',
    },
    {
      fromMinute: 10 * 60,
      toMinute: 18 * 60,
      weekdays: [0],
      label: '自由活动',
      visibility: 'private',
    },
    {
      fromMinute: 18 * 60,
      toMinute: 20 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '自由活动',
      visibility: 'private',
    },
  ],
  topics: [],
};

export default actor;
