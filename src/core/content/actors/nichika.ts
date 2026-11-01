import type { ActorDef } from '../../types';

/**
 * 七草にちか的作息。
 *
 * 依据：
 * - 高校 1 年，平日上午是 protected 的学校时段 [nichika facts「学校」]。
 * - 她在唱片店打工（排班少了但还在）[nichika facts 唱片店的打工]；
 *   店在站前一带，放学后先去店里、再去练习室。
 * - 事务所她也会待（写 POP、赶作业、冰箱贴名字）[202400401/202400404]。
 *
 * 一周不重样：练习室 5 天；双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'nichika',
  name: '七草にちか',
  role: 'idol',
  description: 'SHHis 的成员。ですます＋拖长的句尾＋带刺；偶像宅、唱片店店员。',
  schedule: [
    // ── 平日：学校 ──
    {
      fromMinute: 8 * 60 + 30,
      toMinute: 16 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '上学',
      visibility: 'private',
      protected: true,
    },
    // 周一：唱片店 → 练习室
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'record_shop',
      weekdays: [1],
      label: '唱片店（打工）',
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
    // 周二：练习 → 商店街（买菜）→ 回家
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 20 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '商店街（买菜）',
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
    // 周三：第 1 周唱片店，第 2 周事务所（写 POP）
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'record_shop',
      weekdays: [3],
      weekParity: 'first',
      label: '唱片店（打工）',
      protected: false,
    },
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [3],
      weekParity: 'second',
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '回家',
      protected: false,
    },
    // 周四：练习 → 屋顶（一个人待着）→ 回家
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 19 * 60 + 30,
      locationId: 'office_roof',
      weekdays: [4],
      label: '事务所屋顶',
      protected: false,
    },
    {
      fromMinute: 20 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回家',
      protected: false,
    },
    // 周五：事务所（赶作业）→ 练习
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [5],
      label: '事务所（赶作业）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（唱片店 / 在家）→ 练习 → 商店街
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'record_shop',
      weekdays: [6],
      weekParity: 'first',
      label: '唱片店（打工）',
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
      locationId: 'shopping_street',
      weekdays: [6],
      label: '商店街',
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
    // 周日：上午在家 → 下午双周轮换（事务所 / 唱片店）→ 傍晚公园
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
      locationId: 'office',
      weekdays: [0],
      weekParity: 'first',
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'record_shop',
      weekdays: [0],
      weekParity: 'second',
      label: '唱片店',
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
