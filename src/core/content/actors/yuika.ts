import type { ActorDef } from '../../types';

/**
 * 三峰結華的作息。
 *
 * 依据：
 * - 大学生，有必修课，毕业前要两头跑 [1007005010040][1007005020190]；
 *   功课不落下 [1007005040050]，所以平日白天在学校（protected）。
 * - 钱是为周边挣的，而且只接**单发**打工 [1007005010120][1007005010160]，
 *   所以商店街那段写成"打工"，按天分开。
 * - 她会在练习室听 CD、自己加练 [2007003020020][1007005040210]。
 *
 * 一周不重样：练习室每周 4 天（训练课与课后事件挂在这儿），
 * 其余时段按天分开；双周轮换用在周四傍晚与周六晚上。
 */
const actor: ActorDef = {
  id: 'yuika',
  name: '三峰結華',
  role: 'idol',
  description: "L'Antica 的成员。大学生，偶像宅出身。说话快、爱开玩笑，越认真的话越要笑着说。",
  schedule: [
    // 周一：课 → 练习 → 收录
    {
      fromMinute: 9 * 60,
      toMinute: 14 * 60,
      locationId: 'school',
      weekdays: [1, 3],
      label: '大学',
      visibility: 'private',
      protected: true,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'studio',
      weekdays: [1],
      label: '收录',
      protected: false,
    },
    // 周二：课 → 打工
    {
      fromMinute: 10 * 60,
      toMinute: 15 * 60,
      locationId: 'school',
      weekdays: [2, 4],
      label: '大学',
      visibility: 'private',
      protected: true,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 19 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '打工',
      protected: false,
    },
    // 周三：课 → 练习（时间长一点，她在补基础）
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    // 周四：练习（每周都有，练习室是训练课的挂载点）
    {
      fromMinute: 16 * 60,
      toMinute: 19 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    // 周二晚上双周轮换：第 1 周收录，第 2 周去公园
    {
      fromMinute: 19 * 60,
      toMinute: 21 * 60,
      locationId: 'studio',
      weekdays: [2],
      weekParity: 'first',
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 21 * 60,
      locationId: 'park',
      weekdays: [2],
      weekParity: 'second',
      label: '散步',
      protected: false,
    },
    // 周五：上午课，下午打工，晚上回家
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'school',
      weekdays: [5],
      label: '大学',
      visibility: 'private',
      protected: true,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [5],
      label: '打工',
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
    // 周六：白天逛店，晚上练习（第 2 周去公园）
    {
      fromMinute: 12 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      label: '逛街',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      weekParity: 'first',
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 20 * 60,
      locationId: 'park',
      weekdays: [6],
      weekParity: 'second',
      label: '散步',
      protected: false,
    },
    // 周日：睡到中午，下午出去走走
    {
      fromMinute: 12 * 60,
      toMinute: 15 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '休息',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
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
