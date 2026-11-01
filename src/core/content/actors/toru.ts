import type { ActorDef } from '../../types';

/**
 * 浅倉透的作息。
 *
 * 依据：
 * - 高二，平日上午是 protected 的学校时段 [toru facts「学校」]；她常补课、上课会睡着。
 * - 她放学后不直接回家：绕公园、在车站等公交、去事务所写日誌 [202000401/402/411]。
 * - 练习室每周 5 天（平日 4 天 + 周六下午），训练课与课后事件都挂在这里。
 *
 * 一周不重样：练习室 5 天；双周轮换用在周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'toru',
  name: '浅倉透',
  role: 'idol',
  description: 'noctchill 的成员。说话短、常倒装，对什么都不太在意，只有看见光这件事会认真。',
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
    // 周一：练习 → 事务所（写日誌，专属行动也在这里）
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 21 * 60,
      locationId: 'office',
      weekdays: [1],
      label: '事务所（写日誌）',
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
    // 周二：站前等公交 → 商店街 → 回家
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'station',
      weekdays: [2],
      label: '站前（等公交）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 19 * 60 + 30,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 20 * 60,
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
    // 周四：绕公园 → 练习 → 回家
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [4],
      label: '公园（绕远路）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回家',
      protected: false,
    },
    // 周五：练习 → 事务所（面谈） → 回家
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 20 * 60 + 30,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
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
    // 周六：上午双周轮换（商店街 / 在家）→ 下午练习 → 公园
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
      toMinute: 15 * 60 + 30,
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
    // 周日：上午在家 → 下午双周轮换（站前 / 商店街）→ 傍晚公园
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
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'second',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 19 * 60,
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
