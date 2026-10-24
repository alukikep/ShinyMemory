import type { LocationDef } from '../../types';

const location: LocationDef = {
  id: 'practice_room',
  name: '练习室',
  description: '练习室。镜子里映着把杆、音箱和地板上磨白的记号。',
  openHours: [{ fromMinute: 8 * 60, toMinute: 22 * 60 }],
};

export default location;
