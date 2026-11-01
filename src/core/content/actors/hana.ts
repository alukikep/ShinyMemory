import type { ActorDef } from '../../types';

/**
 * 鈴木羽那的作息。
 *
 * 依据：
 * - 18 岁，高中毕业后来东京，住**事务所宿舍**（`dorm`）：
 *   制作人带她进宿舍时介绍了咲耶和恋鐘 [102700505]。
 * - 出道当时是一张白纸：「歌もダンスもちゃんとやったことない」[1027005030060]，
 *   所以练习室的时段比她自己的时间多得多。
 * - 后来为了安全和缩短通勤搬出去住 1LDK——这一轮还没到，先按宿舍排。
 * - 冈山老家在那边，不会出现在东京的街上。
 *
 * 周五晚在会场（小型活动试水），周六上午双周轮换站前／商店街。
 */
const actor: ActorDef = {
  id: 'hana',
  name: '鈴木羽那',
  role: 'idol',
  description:
    'CoMETIK 的成员。冈山出身，被朋友的视频送进了这行；不会掩饰，也从不敷衍。',
  schedule: [
    // 周一：上午练习 → 事务所（打合せ）→ 傍晚练习 → 回宿舍
    {
      fromMinute: 9 * 60,
      toMinute: 13 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60 + 30,
      toMinute: 16 * 60,
      locationId: 'office',
      weekdays: [1],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'dorm',
      weekdays: [1],
      label: '宿舍',
      protected: false,
    },
    // 周二：练习一天
    {
      fromMinute: 10 * 60,
      toMinute: 13 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60 + 30,
      toMinute: 15 * 60,
      locationId: 'dorm',
      weekdays: [2],
      label: '宿舍（午饭）',
      protected: false,
    },
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 21 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'dorm',
      weekdays: [2],
      label: '宿舍',
      protected: false,
    },
    // 周三：站前（买吃的）→ 练习 → 宿舍
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'station',
      weekdays: [3],
      label: '站前',
      protected: false,
    },
    {
      fromMinute: 12 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'shopping_street',
      weekdays: [3],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'dorm',
      weekdays: [3],
      label: '宿舍',
      protected: false,
    },
    // 周四：练习 → 录音棚（收录）→ 宿舍
    {
      fromMinute: 9 * 60,
      toMinute: 13 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [4],
      label: '录音棚',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 21 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'dorm',
      weekdays: [4],
      label: '宿舍',
      protected: false,
    },
    // 周五：练习 → 会场（小型活动）→ 宿舍
    {
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 20 * 60,
      locationId: 'hall',
      weekdays: [5],
      label: '会场',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'dorm',
      weekdays: [5],
      label: '宿舍',
      protected: false,
    },
    // 周六：上午双周轮换（站前／商店街）→ 练习 → 宿舍
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'station',
      weekdays: [6],
      weekParity: 'first',
      label: '站前',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'second',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 12 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'dorm',
      weekdays: [6],
      label: '宿舍',
      protected: false,
    },
    // 周日：公园（散步）→ 宿舍（和宿舍的人一起吃饭）→ 傍晚练习
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 12 * 60 + 30,
      toMinute: 15 * 60,
      locationId: 'dorm',
      weekdays: [0],
      label: '宿舍',
      protected: false,
    },
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [0],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'dorm',
      weekdays: [0],
      label: '宿舍',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（hana.chat.*），这里留空。
  topics: [],
};

export default actor;
