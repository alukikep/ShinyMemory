import type { ActorDef } from '../../types';

/**
 * 小宮果穂的作息。
 *
 * 依据：
 * - 小学六年级 [1009001010060]，本分是学業 [1009005050180]：
 *   平日白天在学校（protected），放学后才来练习室/事务所。
 * - 她喜欢英雄节目，周日早上要在家看电视（API interest：
 *   日曜日朝の子供向け番組）。
 * - 家里有柴犬マメ丸，傍晚会在附近遛狗 [200900301]；
 *   所以公园既有"和孩子玩"，也有"遛狗"的时段。
 *
 * 一周不重样：练习室每周 4–5 天（训练课与课后事件挂在这儿），
 * 其余按天分开；双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'kaho',
  name: '小宮果穂',
  role: 'idol',
  description: "放学后 Climax Girls 的成员。小学六年级，身高像个高中生，满脑子是英雄片。",
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
    // 周一：练习 → 事务所（作战会议）
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1, 2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 18 * 60 + 30,
      locationId: 'office',
      weekdays: [1],
      label: '作战会议',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：练习 → 遛狗
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'park',
      weekdays: [2],
      label: '遛狗',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [2, 4],
      label: '回家',
      protected: false,
    },
    // 周三：第 1 周练习，第 2 周和附近的孩子玩
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
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [3],
      weekParity: 'second',
      label: '和孩子玩',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '回家',
      protected: false,
    },
    // 周四：先顺路买东西，再回练习室
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60,
      locationId: 'shopping_street',
      weekdays: [4],
      label: '顺路',
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
    // 周五：事务所（作业 + 作战会议）
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'office',
      weekdays: [5],
      label: '作战会议',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（公园玩 / 加练），下午练习，傍晚逛街
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'park',
      weekdays: [6],
      weekParity: 'first',
      label: '和孩子玩',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      weekParity: 'second',
      label: '练习',
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
      label: '逛街',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [6],
      label: '回家',
      protected: false,
    },
    // 周日：早上看英雄节目，中午休息，下午双周轮换（逛街 / 公园）
    {
      fromMinute: 8 * 60,
      toMinute: 10 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '看电视',
      visibility: 'private',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '和孩子玩',
      protected: false,
    },
    {
      fromMinute: 12 * 60,
      toMinute: 14 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '休息',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'first',
      label: '和家人出门',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      weekParity: 'second',
      label: '遛狗',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 21 * 60,
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
