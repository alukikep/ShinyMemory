import type { LocationDef } from '../../types.js';

/**
 * 望丘大学。
 *
 * 結華（大学一年）与霧子（想考医学部）都要用这里；学校（高中）仍然不可达，
 * 制作人只能在外面等。
 */
const location: LocationDef = {
  id: 'university',
  name: '望丘大学',
  description:
    '坡上的大学。正门到中庭是一段很长的银杏道，秋天会有人在那里拍照。',
  kind: 'place',
  mapX: 430,
  mapY: 50,
};

export default location;
