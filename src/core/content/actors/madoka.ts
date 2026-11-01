import type { ActorDef } from '../../types';

/**
 * 樋口円香的作息。
 *
 * 依据：
 * - 高二、和透同校同年级，平日上午是 protected 的学校时段 [madoka facts「学校」]。
 * - 她会一个人留在练习室反复练同一段 [202100403]；也会在事务所待到很晚 [202100404]。
 * - 放学路上常走水边（外景下见、差点摔倒那段）[202100402]。
 *
 * 一周不重样：练习室 4 天（周二/周四/周五/周六）；双周轮换用在周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'madoka',
  name: '樋口円香',
  role: 'idol',
  description: 'noctchill 的成员。说话冷、句尾带刺，对制作人一律ですます。',
  schedule: [
    // ── 平日：学校 ──
    {
      fromMinute: 8 * 60,
      toMinute: 16 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '上学',
      visibility: 'private',
      protected: true,
    },
    // 周一：站前的喫茶店（自习 / 等人）→ 事务所
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'station',
      weekdays: [1],
      label: '站前（喫茶店）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60 + 30,
      locationId: 'office',
      weekdays: [1],
      label: '事务所',
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
    // 周二：练习 → 商店街 → 回家
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
      label: '商店街',
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
    // 周三：直接回家（考试前）
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '回家',
      protected: false,
    },
    // 周四：水边绕路 → 一个人加练
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [4],
      label: '水边',
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
    // 周五：站前（喫茶店）→ 练习 → 回家
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'station',
      weekdays: [5],
      label: '站前（喫茶店）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
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
    // 周六：上午双周轮换（商店街 / 在家）→ 练习 → 水边
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
      label: '水边',
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
    // 周日：上午在家 → 下午双周轮换（站前 / 事务所）→ 傍晚水边
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
      label: '水边',
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
