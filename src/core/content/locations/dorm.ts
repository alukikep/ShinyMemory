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
 * 宿舍是事务所一带的独立楼：步行 5 分钟（设计值；资料只支持「同一片街区」，
 * 没有原文给出精确分钟）。作为办公室的成员，不单独画在地图上。
 */
const location: LocationDef = {
  id: 'dorm',
  name: '事务所宿舍',
  description:
    '事务所附近的宿舍楼。玄关摆着一排拖鞋，食堂的灯总是亮的，走廊尽头是共用的洗衣机。',
  kind: 'place',
  mapX: 250,
  mapY: 215,
};

export default location;
