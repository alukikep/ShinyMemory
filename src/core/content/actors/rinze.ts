import type { ActorDef } from '../../types';

/**
 * 杜野凛世的作息。
 *
 * 依据：
 * - 高一，学校是 protected；放学后才来练习室。
 * - 她住宿舍（和室），常和樹里一起去商店街（肉店可乐饼）[101200101]。
 * - 练习室是她待得最久的地方：第一次课后、舞蹈课都在这里 [101200102]。
 * - 她也会来事务所（接大衣、泡茶、报告）[201200311]。
 *
 * 一周不重样：练习室每周 6 天，其余按天分开；
 * 双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'rinze',
  name: '杜野凛世',
  role: 'idol',
  description: "放学后 Climax Girls 的成员。穿和服、说话慢，用名字自称。",
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
    // 周一：练习 → 商店街
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'shopping_street',
      weekdays: [1],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回宿舍',
      protected: false,
    },
    // 周二：事务所 → 练习
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'office',
      weekdays: [2],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回宿舍',
      protected: false,
    },
    // 周三：第 1 周加练，第 2 周去公园散步
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
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'first',
      label: '回宿舍',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'second',
      label: '回宿舍',
      protected: false,
    },
    // 周四：先商店街，再练习
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60,
      locationId: 'shopping_street',
      weekdays: [4],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 19 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回宿舍',
      protected: false,
    },
    // 周五：练习 → 事务所
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回宿舍',
      protected: false,
    },
    // 周六：上午双周轮换（商店街 / 宿舍折纸），下午练习，傍晚公园
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'first',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'home',
      weekdays: [6],
      weekParity: 'second',
      label: '折纸',
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
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [6],
      label: '回宿舍',
      protected: false,
    },
    // 周日：上午宿舍，下午双周轮换（公园 / 商店街）
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '梳妆',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      weekParity: 'first',
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'second',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '回宿舍',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
