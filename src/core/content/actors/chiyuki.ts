import type { ActorDef } from '../../types';

/**
 * 桑山千雪的作息。
 *
 * 依据：
 * - 全职偶像：先辞了杂货店的工作，白天排的是练习、收录、事务所 [chiyuki facts]。
 * - 她住**事务所宿舍**（「私、今住んでるの事務所の寮なの」）。
 * - 早上会去跑步；晚上回宿舍摆弄杂货、做手工。
 *
 * 一周不重样：练习室每周 6 天；双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'chiyuki',
  name: '桑山千雪',
  role: 'idol',
  description: "ALSTROEMERIA 的年长成员。事务所的姐姐，会缝东西，笑起来很温柔。",
  schedule: [
    // 周一：练习 → 事务所 → 收录
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 12 * 60,
      toMinute: 15 * 60,
      locationId: 'office',
      weekdays: [1],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [1],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [1],
      label: '回宿舍',
      protected: false,
    },
    // 周二：事务所 → 练习 → 商店街
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'office',
      weekdays: [2],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 15 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [2],
      label: '回宿舍',
      protected: false,
    },
    // 周三：练习 → 事务所（第 2 周下午去收录）
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'office',
      weekdays: [3],
      weekParity: 'first',
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'studio',
      weekdays: [3],
      weekParity: 'second',
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [3],
      label: '回宿舍',
      protected: false,
    },
    // 周四：收录 → 练习 → 公园跑步
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'studio',
      weekdays: [4],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 15 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'park',
      weekdays: [4],
      label: '跑步',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [4],
      label: '回宿舍',
      protected: false,
    },
    // 周五：练习 → 事务所 → 商店街
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [5],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'dorm',
      weekdays: [5],
      label: '回宿舍',
      protected: false,
    },
    // 周六：上午双周轮换（宿舍做手工 / 公园跑步），下午练习，傍晚商店街
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'dorm',
      weekdays: [6],
      weekParity: 'first',
      label: '做手工',
      protected: false,
    },
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'park',
      weekdays: [6],
      weekParity: 'second',
      label: '跑步',
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
    // 周日：上午宿舍，下午双周轮换（公园 / 商店街）
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'dorm',
      weekdays: [0],
      label: '做手工',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      weekParity: 'first',
      label: '跑步',
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
