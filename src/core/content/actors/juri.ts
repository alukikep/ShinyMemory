import type { ActorDef } from '../../types';

/**
 * 西城樹里的作息。
 *
 * 依据：
 * - 高中二年级，学校是 protected；放学后才来练习室。
 * - 她喜欢跑步和篮球，会去公园/野球场 [101100502]；
 *   所以公园既有"慢跑"，也有"练投篮"的时段。
 * - 她常逛商店街（肉铺的可乐饼）。
 *
 * 一周不重样：练习室每周 4 天，其余按天分开；
 * 双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'juri',
  name: '西城樹里',
  role: 'idol',
  description: "放学后 Climax Girls 的成员。金发、说话冲，被夸就会结巴。",
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
      weekdays: [1, 2],
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
      locationId: 'dorm',
      weekdays: [1],
      label: '回宿舍',
      protected: false,
    },
    // 周二：练习 → 公园慢跑
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'park',
      weekdays: [2],
      label: '慢跑',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [2, 4],
      label: '回宿舍',
      protected: false,
    },
    // 周三：第 1 周练习到 18 点，第 2 周改去公园跑一圈
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
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [3],
      weekParity: 'second',
      label: '慢跑',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [3],
      label: '回宿舍',
      protected: false,
    },
    // 周四：先逛商店街，再回练习室
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
    // 周五：事务所 → 回宿舍
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [5],
      label: '回宿舍',
      protected: false,
    },
    // 周六：上午双周轮换（公园 / 加练），下午练习，傍晚商店街
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'park',
      weekdays: [6],
      weekParity: 'first',
      label: '练投篮',
      protected: false,
    },
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      weekParity: 'second',
      label: '练习',
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
      locationId: 'shopping_street',
      weekdays: [6],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [6],
      label: '回宿舍',
      protected: false,
    },
    // 周日：上午在宿舍休息，下午双周轮换（公园 / 商店街）
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
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
      weekParity: 'first',
      label: '练投篮',
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
      locationId: 'dorm',
      weekdays: [0],
      label: '回宿舍',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
