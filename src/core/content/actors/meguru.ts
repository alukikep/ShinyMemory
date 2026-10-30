import type { ActorDef } from '../../types';

/**
 * 八宫巡的作息。
 *
 * 设计意图（依据 W.I.N.G. 開場与她"陪遍所有社团"的设定）：
 * - 她是学生，**周二 / 周四上午上学**（protected: true），那两天不能排整天工作。
 * - 下午常在**公园**陪朋友练习——这也是她专属行动的挂载点。
 * - 周日全天自由，傍晚在公园。
 */
const actor: ActorDef = {
  id: 'meguru',
  name: '八宫巡',
  role: 'idol',
  description: 'illumination STARS 的成员。精力旺盛，什么忙都愿意帮。',
  color: '#f2b04a',
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
      // 上学不能因为工作翘掉。
      protected: true,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [2, 4],
      label: '陪朋友练习',
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
      label: '在公园',
      visibility: 'private',
      protected: false,
    },
  ],
  topics: [],
};

export default actor;
