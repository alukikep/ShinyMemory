import type { LocationDef } from '../../types.js';

/**
 * 事务所宿舍。
 *
 * 住宿舍的偶像（剧情里有出处）：樹里、凛世、咲耶、恋鐘、千雪。
 * - 「アタシと凛世は寮だし」[juri facts]
 * - 「寮へ帰るところさ」[sakuya facts]
 * - 「寮に帰る」[kogane facts]
 * - 「私、今住んでるの事務所の寮なの」[chiyuki facts]
 *
 * 霧子住的是大学医院的宿舍（家里在那边），果穂住自己家、摩美々没明说——这三个人不挂这里。
 * 宿舍离事务所步行 5 分钟：下班直接回去、或者早上一起出门。
 */
const location: LocationDef = {
  id: 'dorm',
  name: '事务所宿舍',
  description:
    '事务所旁边的宿舍楼。玄关摆着一排拖鞋，食堂的灯总是亮的，走廊尽头是共用的洗衣机。',
  kind: 'place',
  mapX: 250,
  mapY: 215,
};

export default location;
