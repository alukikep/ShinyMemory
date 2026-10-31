import type { LocationDef } from '../../types.js';

/**
 * 练习街区入口：练习室 + 录音棚。
 *
 * 两处原本就是同一栋楼的不同楼层；进楼 0 分钟，楼层之间也是 0 分钟。
 * 偶像的日程仍然写在 `practice_room` / `studio`，对引擎来说地点没有变。
 */
const location: LocationDef = {
  id: 'studio_district',
  name: '青叶练习街区',
  description:
    '一栋旧楼，楼下是练习室，楼上是录音棚。走廊里总有一股地板蜡和咖啡混在一起的味道。',
  kind: 'area',
  members: ['practice_room', 'studio'],
  mapX: 190,
  mapY: 130,
};

export default location;
