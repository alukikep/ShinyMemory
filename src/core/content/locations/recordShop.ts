import type { LocationDef } from '../../types.js';

/**
 * 唱片店。
 *
 * 挂在站前一带（`ekimae` 的成员，进店 0 分钟），商业街隔壁。
 *
 * 为什么值得单独建：这里不是"路过的店"，是にちか打工的地方——
 * - 她被拖进后场求制作人看她的歌和舞 [102400101]
 * - 楼层经理训她、前辈们叫她「にっちー」、她在店里有自尊 [202400402/403]
 * - 偶像宅的底色全在这家店里（新碟到货、写推荐 POP）
 *
 * 不需要别的东西：店里只有柜台、一墙的 CD、和一排能趴着写 POP 的桌子。
 */
const location: LocationDef = {
  id: 'record_shop',
  name: '唱片店',
  description:
    '站前商店街拐角的唱片店。门边堆着新到的纸箱，柜台后面一墙 CD，试听机前排着两三个人。',
  kind: 'place',
  mapX: 120,
  mapY: 130,
};

export default location;
