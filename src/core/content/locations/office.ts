import type { LocationDef } from '../../types';

const location: LocationDef = {
  id: 'office',
  name: '事务所',
  description: '事务所的会议室兼休息室。桌上堆着台本和没喝完的茶。',
  isStart: true,
  openHours: [{ fromMinute: 8 * 60, toMinute: 22 * 60 }],
};

export default location;
