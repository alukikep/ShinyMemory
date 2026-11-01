import type { ActorDef } from '../../types';

/**
 * 福丸小糸的作息。
 *
 * 依据：
 * - 高校 1 年，平日上午是 protected 的学校时段 [koito facts「学校」]。
 * - 她习惯提早到校、也常一个人在练习室补进度 [202200403]。
 * - 现在会去公园了（小时候摔过一次、一直躲着）[202200404]。
 *
 * 一周不重样：练习室 5 天（周一/周二/周三/周四/周六）；双周轮换用在周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'koito',
  name: '福丸小糸',
  role: 'idol',
  description: 'noctchill 的成员。个子最小、声音也小，随身带着糖。',
  schedule: [
    // ── 平日：学校 ──
    {
      fromMinute: 7 * 60 + 30,
      toMinute: 16 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '上学（提早到校）',
      visibility: 'private',
      protected: true,
    },
    // 周一：事务所作笔记 → 练习
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [1],
      label: '事务所（写作业）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：商店街（咖啡店复习，专属行动）→ 练习
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '商店街（咖啡店复习）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回家',
      protected: false,
    },
    // 周三：练习 → 回家
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
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '回家',
      protected: false,
    },
    // 周四：河边跑步 → 练习
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [4],
      label: '河边跑步',
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
    // 周五：事务所 → 回家（家教日）
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家（学习）',
      protected: false,
    },
    // 周六：上午双周轮换（商店街 / 在家）→ 练习 → 公园
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
      locationId: 'park',
      weekdays: [6],
      label: '公园',
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
    // 周日：上午在家 → 下午双周轮换（站前 / 办公室）→ 傍晚公园
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
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
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
