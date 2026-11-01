import type { ActorDef } from '../../types';

/**
 * 園田智代子的作息。
 *
 * 依据：
 * - 高中二年级、学校是 protected；家和学校都离事务所远（所以傍晚在家那一头）。
 * - 休息日一个人跑甜品店巡礼 [2010003010030][2010003010040]，
 *   所以商店街既有"甜品店"，也有"顺路"的时段。
 * - 她在练习室一个人练巧克力段子 [1010001020020]，
 *   所以练习室是训练课与课后事件的挂载点。
 *
 * 一周不重样：练习室每周 4–5 天，其余按天分开；
 * 双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'chiyoko',
  name: '園田智代子',
  role: 'idol',
  description: "放学后 Climax Girls 的成员。普通的女高中生，把「チョコアイドル」当成自己选的武器。",
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
    // 周一：练习 → 回家
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1, 2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：练习 → 甜品店
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'shopping_street',
      weekdays: [2],
      label: '甜品店',
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
    // 周三：第 1 周练到 18 点，第 2 周提早收工去逛店
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
      toMinute: 17 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      weekParity: 'second',
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 18 * 60 + 30,
      locationId: 'shopping_street',
      weekdays: [3],
      weekParity: 'second',
      label: '逛店',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'first',
      label: '回家',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'second',
      label: '回家',
      protected: false,
    },
    // 周四：先顺路去甜品店，再回练习室
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60,
      locationId: 'shopping_street',
      weekdays: [4],
      label: '甜品店',
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
    // 周五：事务所（对台本、开会）→ 回家
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60 + 30,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
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
    // 周六：上午双周轮换（甜品店 / 加练），下午练习，傍晚回家
    {
      fromMinute: 11 * 60,
      toMinute: 15 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'first',
      label: '甜品店',
      protected: false,
    },
    {
      fromMinute: 11 * 60,
      toMinute: 13 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      weekParity: 'second',
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'second',
      label: '甜品店',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      weekParity: 'first',
      label: '练习',
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
    // 周日：上午在家做点心，下午双周轮换（逛店 / 公园）
    {
      fromMinute: 10 * 60,
      toMinute: 13 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '做点心',
      visibility: 'private',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'first',
      label: '逛店',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      weekParity: 'second',
      label: '散步',
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
