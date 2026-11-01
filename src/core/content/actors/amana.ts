import type { ActorDef } from '../../types';

/**
 * 大崎甘奈的作息。
 *
 * 依据：
 * - 高二，学校和甜花同一所；放学后才是工作 [facts]。
 * - 她爱逛街、看杂志、做美甲、自拍；也常留在事务所翻杂志 [201400301]。
 * - 她给家里做晚饭、给甜花做早饭，晚上回家早不了太久 [facts]。
 *
 * 一周不重样：练习室每周 6 天；双周轮换用在周三下午、周六、周日下午。
 */
const actor: ActorDef = {
  id: 'amana',
  name: '大崎甘奈',
  role: 'idol',
  description: "ALSTROEMERIA 的双胞胎妹妹。辣妹打扮，句尾带星号，想和姐姐一起闪耀。",
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
    // 练习：周一、周五固定（周二在事务所之后）
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1, 5],
      label: '练习',
      protected: false,
    },
    // 周一：练习 → 商店街
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
      label: '回家',
      protected: false,
    },
    // 周二：先事务所，再练习
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
      label: '回家',
      protected: false,
    },
    // 周三：第 1 周加练，第 2 周去商店街
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
      locationId: 'shopping_street',
      weekdays: [3],
      weekParity: 'second',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'first',
      label: '回家',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'second',
      label: '回家',
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
      label: '回家',
      protected: false,
    },
    // 周五：练习 → 车站附近
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'station',
      weekdays: [5],
      label: '车站附近',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（家里 / 商店街），下午练习，傍晚商店街
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'home',
      weekdays: [6],
      weekParity: 'first',
      label: '在家',
      protected: false,
    },
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'second',
      label: '商店街',
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
      locationId: 'home',
      weekdays: [6],
      label: '回家',
      protected: false,
    },
    // 周日：上午在家，下午双周轮换（商店街 / 事务所）
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
      locationId: 'office',
      weekdays: [0],
      weekParity: 'second',
      label: '事务所',
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
