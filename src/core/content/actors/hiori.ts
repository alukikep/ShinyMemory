import type { ActorDef } from '../../types';

const actor: ActorDef = {
  id: 'hiori',
  name: '风野灯织',
  role: 'idol',
  description: 'illumination STARS 的成员。冷静、认真，对自己要求很高。',
  color: '#8fa8d8',
  schedule: [
    {
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      locationId: 'practice_room',
      weekdays: [1, 3, 5],
      label: '练习',
    },
    {
      fromMinute: 16 * 60,
      toMinute: 22 * 60,
      locationId: 'studio',
      weekdays: [1, 3, 5],
      label: '收录',
    },
    {
      fromMinute: 10 * 60,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [2, 4],
      label: '练习',
    },
    {
      fromMinute: 12 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [6],
      label: '收录',
    },
    {
      fromMinute: 10 * 60,
      toMinute: 18 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '休息',
    },
  ],
  topics: [],
};

export default actor;
