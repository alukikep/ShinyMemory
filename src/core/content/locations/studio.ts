import type { LocationDef } from '../../types';

const location: LocationDef = {
  id: 'studio',
  name: '录音棚',
  description: '录音棚。隔音门一关上，外面的声音就全没了。',
  openHours: [{ fromMinute: 10 * 60, toMinute: 23 * 60 + 59 }],
};

export default location;
