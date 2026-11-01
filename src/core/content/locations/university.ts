import type { LocationDef } from '../../types.js';

/**
 * 望丘大学。
 *
 * 入口是「望丘台」（university_district），进校门 0 分钟。
 * 結華（大学一年）平日白天在这里上课；霧子说要考医学部，但那是她的私事，暂时不挂日程。
 * 学校（高中）仍然不可达，制作人只能在外面等。
 */
const location: LocationDef = {
  id: 'university',
  name: '望丘大学',
  description:
    '坡上的大学。正门到中庭是一段很长的银杏道，秋天会有人在那里拍照。',
  // 成员地点不单独画在地图上，坐标只作参考。
  kind: 'place',
  mapX: 430,
  mapY: 50,
};

export default location;
