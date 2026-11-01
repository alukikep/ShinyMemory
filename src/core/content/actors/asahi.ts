import type { ActorDef } from '../../types';

/**
 * 芹沢あさひ的作息。
 *
 * 依据：
 * - 初中 2 年，学校是 protected；放学后到处跑 [asahi facts]。
 * - 她"一直在找有趣的事"：公园（魔术师、观察人）、街上（大屏、新店）[201700301]。
 * - 第一次课她提前到、自己先跳 [101700102]；早晨也在练习室 [201700311]。
 * - 她住自己家（不是宿舍）：facts 里没有宿舍的描写。
 *
 * 一周不重样：练习室每周 5–6 天；双周轮换用在周三下午、周六、周日。
 */
const actor: ActorDef = {
  id: 'asahi',
  name: '芹沢あさひ',
  role: 'idol',
  description: "Straylight 的センター。初中 2 年，好奇心比纪律先动。",
  schedule: [
    {
      fromMinute: 8 * 60,
      toMinute: 15 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '上学',
      visibility: 'private',
      protected: true,
    },
    // 练习：周一、周二、周四、周五
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1, 2, 4, 5],
      label: '练习',
      protected: false,
    },
    // 周一：练习 → 公园
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'park',
      weekdays: [1],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：练习 → 商业街
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '街上',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回家',
      protected: false,
    },
    // 周三：第 1 周练习，第 2 周去公园找人聊天
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      weekParity: 'first',
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'park',
      weekdays: [3],
      weekParity: 'second',
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'first',
      label: '回家',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'second',
      label: '回家',
      protected: false,
    },
    // 周四：练习 → 车站附近
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'station',
      weekdays: [4],
      label: '车站附近',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回家',
      protected: false,
    },
    // 周五：练习 → 回家
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（公园 / 商业街），下午练习，傍晚公园
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'park',
      weekdays: [6],
      weekParity: 'first',
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'second',
      label: '街上',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 15 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'park',
      weekdays: [6],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [6],
      label: '回家',
      protected: false,
    },
    // 周日：上午在家，下午双周轮换（公园 / 街上）
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '在家',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      weekParity: 'first',
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'second',
      label: '街上',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '回家',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
