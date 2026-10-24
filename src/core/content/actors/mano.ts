import type { ActorDef } from '../../types';

const actor: ActorDef = {
  id: 'mano',
  name: '樱木真乃',
  role: 'idol',
  description: 'illumination STARS 的成员。温柔、认真，喜欢小动物。',
  color: '#f1b7c5',
  schedule: [
    { fromMinute: 8 * 60, toMinute: 14 * 60, locationId: 'practice_room' },
    { fromMinute: 14 * 60, toMinute: 20 * 60, locationId: 'studio' },
  ],
  topics: [],
};

export default actor;
