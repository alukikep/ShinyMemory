import type { ActorDef } from '../../types';

/**
 * 白瀬咲耶的作息。
 *
 * 依据：
 * - 高中三年级的在校生，从高一就一直在接模特工作 [1006005030080]；
 *   平日白天在学校（protected），放学后才能来练习室/录音棚。
 * - 她总是最早到事务所 [1006005060100]，还会在路上买点心 [1006005060120]，
 *   所以傍晚在商店街留一段（专属行动的挂载点）。
 * - 周末她喜欢到处走（API interest「色々な所に出かける」），傍晚在公园。
 *
 * 一周不重样：放学的练习是核心，正课之后按天分开——
 * 周一收录+顺路、周二收录（第 2 周改成顺路）、周三早收工、
 * 周四收录+点心、周五散步+收录；双周轮换只用在"周二傍晚"。
 */
const actor: ActorDef = {
  id: 'sakuya',
  name: '白瀬咲耶',
  role: 'idol',
  description: "L'Antica 的成员。模特出身，被人叫作「咲耶様」。说话礼貌、带着一点戏，最怕被人只当成「帅」。",
  schedule: [
    {
      fromMinute: 8 * 60,
      toMinute: 15 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '学校',
      visibility: 'private',
      protected: true,
    },
    // 周一：练习 → 收录 → 顺路买点心
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'practice_room',
      weekdays: [1, 2, 4, 5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 19 * 60,
      locationId: 'studio',
      weekdays: [1, 4],
      label: '收录',
      protected: false,
    },
    {
      // 周二第 1 周收录，第 2 周改成顺路（双周轮换）。
      fromMinute: 17 * 60,
      toMinute: 19 * 60,
      locationId: 'studio',
      weekdays: [2],
      weekParity: 'first',
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 21 * 60,
      locationId: 'shopping_street',
      weekdays: [1, 4],
      label: '顺路',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'dorm',
      weekdays: [1, 4],
      label: '回家',
      protected: false,
    },
    // 周二：第 1 周收录，第 2 周顺路（双周轮换）
    {
      fromMinute: 17 * 60,
      toMinute: 19 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      weekParity: 'second',
      label: '顺路',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 23 * 60,
      locationId: 'dorm',
      weekdays: [2],
      label: '回家',
      protected: false,
    },
    // 周三：练习到 18 点就收工，回家休息
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'dorm',
      weekdays: [3],
      label: '休息',
      protected: false,
    },
    // 周五：练习 → 公园 → 收录
    {
      fromMinute: 17 * 60,
      toMinute: 18 * 60 + 30,
      locationId: 'park',
      weekdays: [5],
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'studio',
      weekdays: [5],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 20 * 60,
      toMinute: 23 * 60,
      locationId: 'dorm',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：逛街 → 收录 → 公园
    {
      fromMinute: 11 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      label: '逛街',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [6],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'park',
      weekdays: [6],
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'dorm',
      weekdays: [6],
      label: '回家',
      protected: false,
    },
    // 周日：在家待半天，下午出门
    {
      fromMinute: 10 * 60,
      toMinute: 13 * 60,
      locationId: 'dorm',
      weekdays: [0],
      label: '休息',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [0],
      label: '逛街',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [0],
      label: '回家',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
