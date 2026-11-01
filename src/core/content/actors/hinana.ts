import type { ActorDef } from '../../types';

/**
 * 市川雛菜的作息。
 *
 * 依据：
 * - 高校 1 年，平日上午是 protected 的学校时段 [hinana facts「学校」]。
 * - 她常迟到、但舞蹈课从不缺；练习室每周 5 天以上。
 * - 事务所的沙发是她的"特等席"，放学后会先去躺着 [hinana facts 事务所的沙发]。
 *
 * 一周不重样：练习室 6 天；双周轮换用在周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'hinana',
  name: '市川雛菜',
  role: 'idol',
  description: 'noctchill 的成员。用自己的名字自称，句子尾巴永远拖长。',
  schedule: [
    // ── 平日：学校 ──
    {
      fromMinute: 8 * 60 + 30,
      toMinute: 16 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '上学（常赶不上第一节课）',
      visibility: 'private',
      protected: true,
    },
    // 周一：事务所的沙发 → 练习
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [1],
      label: '事务所（特等席）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：商店街（吃甜的，专属行动）→ 练习
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '商店街（吃甜的）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回家',
      protected: false,
    },
    // 周三：练习 → 站前喫茶店（甜点）
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 20 * 60 + 30,
      locationId: 'station',
      weekdays: [3],
      label: '站前（喫茶店）',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '回家',
      protected: false,
    },
    // 周四：事务所 → 练习
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [4],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回家',
      protected: false,
    },
    // 周五：练习 → 商店街 → 回家
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'shopping_street',
      weekdays: [5],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（商店街 / 在家）→ 练习 → 站前
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'first',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'home',
      weekdays: [6],
      weekParity: 'second',
      label: '在家',
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
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'station',
      weekdays: [6],
      label: '站前',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [6],
      label: '回家',
      protected: false,
    },
    // 周日：上午在家 → 下午双周轮换（站前 / 事务所）→ 傍晚公园
    {
      fromMinute: 10 * 60,
      toMinute: 13 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '在家',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'station',
      weekdays: [0],
      weekParity: 'first',
      label: '站前',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'office',
      weekdays: [0],
      weekParity: 'second',
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60 + 30,
      locationId: 'park',
      weekdays: [0],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 23 * 60,
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
