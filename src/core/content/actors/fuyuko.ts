import type { ActorDef } from '../../types';

/**
 * 黛冬優子的作息。
 *
 * 依据：
 * - **专门学校 1 年**（facts 第一行），平日上午有课 → protected 的 `school` 时段。
 * - 家离事务所远、回去晚（「家が遠いし、帰りが遅くなることも多い」）。
 * - 她上课前会在练习室赖着不动、抱怨 [201800301]；工作从不掉链子。
 * - 她是真偶像宅，会为限定徽章去排队 [201800302]。
 *
 * 一周不重样：练习室每周 5–6 天；双周轮换用在周三下午、周六、周日。
 */
const actor: ActorDef = {
  id: 'fuyuko',
  name: '黛冬優子',
  role: 'idol',
  description: "Straylight 的队长。专门学校 1 年，对外是可爱的ふゆ，对内嘴很毒。",
  schedule: [
    {
      fromMinute: 9 * 60,
      toMinute: 13 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '专门学校',
      visibility: 'private',
      protected: true,
    },
    // 练习：周一、周二、周五
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'practice_room',
      weekdays: [1, 2, 5],
      label: '练习',
      protected: false,
    },
    // 周一：练习 → 事务所 → 回家
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [1],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：练习 → 商店街（排队买限定）
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回家',
      protected: false,
    },
    // 周三：第 1 周收录，第 2 周练习
    {
      fromMinute: 14 * 60,
      toMinute: 17 * 60,
      locationId: 'studio',
      weekdays: [3],
      weekParity: 'first',
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      weekParity: 'second',
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'first',
      label: '回家',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'second',
      label: '回家',
      protected: false,
    },
    // 周四：收录 → 车站附近
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'studio',
      weekdays: [4],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'station',
      weekdays: [4],
      label: '车站附近',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回家',
      protected: false,
    },
    // 周五：练习 → 事务所
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（商店街 / 在家），下午练习，傍晚事务所
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
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'office',
      weekdays: [6],
      label: '事务所',
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
    // 周日：上午在家，下午双周轮换（商店街 / 公园）
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
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'first',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      weekParity: 'second',
      label: '公园',
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
