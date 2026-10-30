import type { ActorDef } from '../../types';

/**
 * 风野灯织的作息。
 *
 * 设计意图：
 * - 她是学生，**周二 / 周四上午要上学**（protected: true）——那两天不能给她排工作，
 *   这是她和真乃最直接的区别。
 * - 其余时段都可以被工作顶掉。
 * - 周日全天自由活动，但下午会在公园（专属行动的挂载点）。
 */
const actor: ActorDef = {
  id: 'hiori',
  name: '风野灯织',
  role: 'idol',
  description: 'illumination STARS 的成员。冷静、认真，对自己要求很高。',
  color: '#8fa8d8',
  schedule: [
    {
      fromMinute: 10 * 60,
      toMinute: 16 * 60,
      locationId: 'practice_room',
      weekdays: [1, 3, 5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 22 * 60,
      locationId: 'studio',
      weekdays: [1, 3, 5],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 8 * 60,
      toMinute: 10 * 60,
      locationId: 'school',
      weekdays: [2, 4],
      label: '上学',
      visibility: 'private',
      // 上学不能因为工作翘掉：这两天她接不了活。
      protected: true,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [2, 4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 12 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [6],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 20 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      label: '自由活动',
      visibility: 'private',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 18 * 60,
      weekdays: [0],
      label: '自由活动',
      visibility: 'private',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 20 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '一个人待着',
      visibility: 'private',
      protected: false,
    },
  ],
  topics: [],
};

export default actor;
