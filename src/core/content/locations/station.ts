import type { LocationDef } from '../../types.js';

/**
 * 车站附近。
 *
 * 不只是站台：站前的喫茶店、便利店、寄物柜都算在这一带，
 * 所以「约在车站附近」「拍摄之后去喫茶店」这类场景挂在这里是合理的，
 * 不必把所有城市活动都塞给商业街。
 */
const location: LocationDef = {
  id: 'station',
  name: '车站',
  description:
    '车站附近。站前有一排小店：喫茶店、便利店、寄物柜，等车的人比坐车的人多。晚班车还没有来。',
  kind: 'station',
  mapX: 190,
  mapY: 50,
};

export default location;
