import type { LocationDef } from '../../types.js';

/**
 * 站前入口：车站 + 商店街。
 *
 * 入口只负责"这一带有什么"和进门；进入里面的地点是 0 分钟移动。
 * 公共交通改成全图可用（15 分钟任意地点）之后，车站不再是交通枢纽，
 * 只作为一个人流多的地点保留（跑腿、街拍）。
 */
const location: LocationDef = {
  id: 'ekimae',
  name: '朝雾站前',
  description:
    '车站出来就是商店街。白天人声很吵，晚上只剩自动贩卖机的灯和拉下卷帘的橱窗。',
  kind: 'area',
  members: ['station', 'shopping_street', 'record_shop'],
  mapX: 190,
  mapY: 50,
};

export default location;
