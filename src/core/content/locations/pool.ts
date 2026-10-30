import type { LocationDef } from '../../types.js';

/**
 * 郊外的泳池。
 *
 * 这个地点是为了卡面章「拍摄当天」（巡【夏に恋するピチカート！】/ 太陽のしずく）加的：
 * 原作的拍摄现场在室外泳池，地图上原本没有对应地点。
 * 见 playbook §4.9 的「卡面地点与地图不匹配」。
 */
const location: LocationDef = {
  id: 'pool',
  name: '泳池',
  description: '郊外的室外泳池。白瓷砖、遮阳伞，还有会起浪的那一池。',
  kind: 'place',
  mapX: 610,
  mapY: 300,
};

export default location;
