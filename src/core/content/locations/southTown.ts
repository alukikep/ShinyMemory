import type { LocationDef } from '../../types.js';

/**
 * 南町。
 *
 * 家与站前之间往南的一带：旧公寓的走廊和主题公园的入口都在这里。
 * 两个成员都是 0 分钟——地图上只画一个“南町”，玩家进地区后再选去哪边。
 *
 * 位置放在公寓原来的西南角，所以：
 * - 家 → 南町 10 分钟（南町公寓还是 10 分钟）
 * - 站前 → 南町 15 分钟（游乐园还是 15 分钟）
 */
const location: LocationDef = {
  id: 'south_town',
  name: '南町',
  description:
    '家与站前之间往南的一带。旧公寓的走廊和主题公园的入口，都在同一条坡道尽头。',
  kind: 'area',
  members: ['apartment', 'theme_park'],
  mapX: 70,
  mapY: 140,
};

export default location;
