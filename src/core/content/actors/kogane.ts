import type { ActorDef } from '../../types';

/**
 * 月岡恋鐘的作息。
 *
 * 依据：
 * - 已上京、住宿舍（S.T.E.P. 待核），没有学校时段。
 * - 她会用事务所现有的材料做饭 [2004003010010][2004003010020]，
 *   所以中午与傍晚在事务所各留一段。
 * - W.I.N.G. 第一次工作是キャンペーンガール [100400102]，收录在录音棚。
 *
 * 一周不重样：练习与收录是核心，另外按天分开——
 * 周一买菜、周二事务所做饭、周三补觉、周五散步、周末逛街；
 * 双周轮换只用在"周三上午"（练习室 vs 早市）。
 */
const actor: ActorDef = {
  id: 'kogane',
  name: '月岡恋鐘',
  role: 'idol',
  description: "L'Antica 的成员。爱操心的食堂女儿，说话带长崎口音。",
  schedule: [
    // 周一：练习 → 事务所 → 收录 → 买菜
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [1, 4, 5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 12 * 60,
      toMinute: 14 * 60,
      locationId: 'office',
      weekdays: [1, 4],
      label: '做饭',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [1, 2, 3, 4, 5],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'shopping_street',
      weekdays: [1],
      label: '买菜',
      protected: false,
    },
    {
      fromMinute: 20 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '宿舍',
      protected: false,
    },
    // 周二：练习缩短，早点去做饭
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 11 * 60,
      toMinute: 14 * 60,
      locationId: 'office',
      weekdays: [2],
      label: '做饭',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'office',
      weekdays: [2, 4],
      label: '做饭',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [2, 4],
      label: '宿舍',
      protected: false,
    },
    // 周三：上午双周轮换（练习室 / 早市），下午补觉
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      weekParity: 'first',
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'shopping_street',
      weekdays: [3],
      weekParity: 'second',
      label: '早市',
      protected: false,
    },
    {
      fromMinute: 12 * 60,
      toMinute: 14 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '补觉',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 20 * 60,
      locationId: 'office',
      weekdays: [3],
      label: '收拾',
      protected: false,
    },
    {
      fromMinute: 20 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '宿舍',
      protected: false,
    },
    // 周五：中午买菜，傍晚绕去公园
    {
      fromMinute: 12 * 60,
      toMinute: 14 * 60,
      locationId: 'shopping_street',
      weekdays: [5],
      label: '买菜',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'park',
      weekdays: [5],
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 20 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '宿舍',
      protected: false,
    },
    // 周六：练习 → 逛街
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      label: '逛街',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [6],
      label: '宿舍',
      protected: false,
    },
    // 周日：睡到中午，下午公园，傍晚提前备菜
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '休息',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 19 * 60,
      locationId: 'office',
      weekdays: [0],
      label: '备菜',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '宿舍',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
