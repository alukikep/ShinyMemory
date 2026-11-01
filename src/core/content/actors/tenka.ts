import type { ActorDef } from '../../types';

/**
 * 大崎甜花的作息。
 *
 * 依据：
 * - 高二，和甘奈同一所高中；放学后才有工作 [facts]。
 * - 她宅：在家躺着上网、打游戏；常睡过头、靠甘奈叫醒 [201500301]。
 * - 工作多了之后她会自己把日程记好，不再迟到 [201500302]。
 * - 她也会主动待在事务所（台本、茶水间泡咖啡）[201500311]。
 *
 * 一周不重样：练习室每周 6 天；双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'tenka',
  name: '大崎甜花',
  role: 'idol',
  description: "ALSTROEMERIA 的双胞胎姐姐。说话慢、怕生，被妹妹照顾着。",
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
    // 练习：周一、周二、周五固定
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1, 5],
      label: '练习',
      protected: false,
    },
    // 周一：练习 → 回家
    {
      fromMinute: 17 * 60 + 30,
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
    // 周三：第 1 周加练，第 2 周直接回家躺着
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
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'second',
      label: '在家',
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
    // 周四：练习（晚一点）
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
    // 周六：上午在家（双周轮换去商店街），下午练习，傍晚商店街
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
    // 周日：上午下午都在家（双周轮换下午去车站附近）
    {
      fromMinute: 9 * 60,
      toMinute: 14 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '在家',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 17 * 60,
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'first',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 17 * 60,
      locationId: 'station',
      weekdays: [0],
      weekParity: 'second',
      label: '车站附近',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
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
