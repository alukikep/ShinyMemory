import type { ActorDef } from '../../types';

/**
 * 白瀬咲耶的作息。
 *
 * 依据：
 * - 高中三年级的在校生，从高一就一直在接模特工作 [1006005030080]；
 *   平日白天在学校（protected），放学后才能来练习室/录音棚。
 * - 她总是最早到事务所 [1006005060100]，还会在路上买点心 [1006005060120]，
 *   所以傍晚在商店街留一段（专属行动的挂载点）。
 * - 周末她喜欢到处走（API interest「色々な所に出かける」），傍晚在公园。
 */
const actor: ActorDef = {
  id: 'sakuya',
  name: '白瀬咲耶',
  role: 'idol',
  description: "L'Antica 的成员。模特出身，被人叫作「咲耶様」。说话礼貌、带着一点戏，最怕被人只当成「帅」。",
  schedule: [
    {
      fromMinute: 8 * 60,
      toMinute: 15 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '学校',
      protected: true,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'practice_room',
      weekdays: [1, 2, 3, 4, 5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 19 * 60,
      locationId: 'studio',
      weekdays: [1, 2, 3, 4, 5],
      label: '收录',
      protected: false,
    },
    {
      // 收工顺路买点东西：专属行动的挂载点。
      fromMinute: 19 * 60,
      toMinute: 21 * 60,
      locationId: 'shopping_street',
      weekdays: [1, 2, 3, 4, 5],
      label: '顺路',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [1, 2, 3, 4, 5],
      label: '回家',
      protected: false,
    },
    {
      fromMinute: 11 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [0, 6],
      label: '逛街',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [0, 6],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'park',
      weekdays: [0, 6],
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [0, 6],
      label: '回家',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
