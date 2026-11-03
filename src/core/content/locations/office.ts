import type { LocationDef } from '../../types.js';

/**
 * 事务所（area）。
 *
 * 办公室本身仍然承载行动/剧情/工作，同时把同一栋楼的屋顶和附近的宿舍
 * 收成成员：屋顶 0 分钟，宿舍 5 分钟。
 *
 * 这是有意的例外：常驻枢纽允许作为 area 同时承载内容，避免每次回事务所
 * 都要先经过一个空的“地区页”。
 */
const location: LocationDef = {
  id: 'office',
  name: '事务所',
  description: '事务所的会议室兼休息室。桌上堆着台本和没喝完的茶。',
  isStart: true,
  kind: 'area',
  members: ['office_roof', 'dorm'],
  mapX: 310,
  mapY: 50,
};

export default location;
