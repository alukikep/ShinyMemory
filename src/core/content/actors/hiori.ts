import type { ActorDef } from '../../types';

const actor: ActorDef = {
  id: 'hiori',
  name: '风野灯织',
  role: 'idol',
  description: 'illumination STARS 的成员。冷静、认真，对自己要求很高。',
  color: '#8fa8d8',
  schedule: [
    { fromMinute: 10 * 60, toMinute: 16 * 60, locationId: 'practice_room' },
    { fromMinute: 16 * 60, toMinute: 22 * 60, locationId: 'studio' },
  ],
  topics: [],
};

export default actor;
