import type { LocationDef } from '../../types.js';

/**
 * 海滨入口：公园 + 泳池 + 医院。
 *
 * 从坡道上下来就是海，几处都在步行范围内；进哪一处都是 0 分钟。
 */
const location: LocationDef = {
  id: 'seaside',
  name: '滨风海岸',
  description:
    '从坡道上下来就是海。长椅、喷泉、夏天才开的泳池，再往里是大学医院的白楼。风里一直有点咸味。',
  kind: 'area',
  members: ['park', 'pool', 'hospital'],
  mapX: 430,
  mapY: 130,
};

export default location;
