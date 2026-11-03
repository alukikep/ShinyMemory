import type { LocationDef } from '../../types.js';

/**
 * 事务所屋顶。
 *
 * `office` 的成员：同一栋楼，从办公室上去 0 分钟（不单独画在地图上）。
 *
 * 为什么单独建：屋顶在にちか这条线里不是「事务所的一部分」，是一个能喊话的地方——
 * - 她在屋顶喊「七草にちか、ごーうーかーくー」 [102400101]
 * - 「事務所の屋上で、ここでアイドルになるって大声出したのは、にちかだ」 [202400411]
 * 这两处的重量都在"声音传出去"上，塞进室内就没了。
 */
const location: LocationDef = {
  id: 'office_roof',
  name: '事务所屋顶',
  description:
    '事务所楼顶。铁门后面是水塔和一片水泥地，围栏外能看见整条街，喊一声会有回声。',
  kind: 'place',
  mapX: 310,
  mapY: 20,
};

export default location;
