import type { LocationDef } from '../../types.js';

/**
 * 制作人的家。
 *
 * 偶像日程里的 `locationId: 'home'` 表示“她自己的家”，不是这里；
 * 引擎会把它当成私有地点，不会让偶像出现在制作人家中。
 */
const location: LocationDef = {
  id: 'home',
  name: '家',
  description: '家。离事务所两站电车，冰箱上贴着没写完的购物清单。',
  kind: 'place',
  mapX: 70,
  mapY: 50,
};

export default location;
