import type { ActorDef } from '../../types';

/**
 * 緋田美琴的作息。
 *
 * 依据：
 * - 24 岁，不在学校：白天到深夜都在练习室 [mikoto facts 练习与生活习惯]。
 * - 她会练到深夜甚至天亮，被劝也照旧；休息日也借练习室的钥匙。
 * - 生活很随便：便利店买日用品、不做饭、家电全寄到事务所 [202500411]。
 *
 * 一周不重样：练习室 7 天（她是"停不下来"的人）；双周轮换用在周六上午。
 */
const actor: ActorDef = {
  id: 'mikoto',
  name: '緋田美琴',
  role: 'idol',
  description: 'SHHis 的成员。说话平静、句子短、停顿多；一练起来就听不见人叫。',
  schedule: [
    // 周一：上午练 → 便利店 → 练到晚上
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
      toMinute: 14 * 60 + 30,
      locationId: 'station',
      weekdays: [1],
      label: '站前（便利店）',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：练习 → 唱片店（买杂志和 CD）→ 练习
    {
      fromMinute: 10 * 60,
      toMinute: 14 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 14 * 60 + 30,
      toMinute: 16 * 60,
      locationId: 'record_shop',
      weekdays: [2],
      label: '唱片店',
      protected: false,
    },
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回家',
      protected: false,
    },
    // 周三：事务所（打合せ）→ 公园（走一走）→ 练习
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'office',
      weekdays: [3],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 12 * 60 + 30,
      toMinute: 14 * 60,
      locationId: 'park',
      weekdays: [3],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 14 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [3],
      label: '回家',
      protected: false,
    },
    // 周四：长练 → 商店街 → 继续练
    {
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 16 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [4],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 23 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回家',
      protected: false,
    },
    // 周五：练习 → 事务所 → 练习
    {
      fromMinute: 9 * 60,
      toMinute: 13 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60 + 30,
      toMinute: 15 * 60,
      locationId: 'office',
      weekdays: [5],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（唱片店 / 在家）→ 长练 → 站前
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'record_shop',
      weekdays: [6],
      weekParity: 'first',
      label: '唱片店',
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
      fromMinute: 12 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'station',
      weekdays: [6],
      label: '站前',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [6],
      label: '回家',
      protected: false,
    },
    // 周日：在家（补睡）→ 公园 → 事务所（看录像）→ 练习
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '在家',
      protected: false,
    },
    {
      fromMinute: 12 * 60 + 30,
      toMinute: 15 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [0],
      label: '事务所（看录像）',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [0],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
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
