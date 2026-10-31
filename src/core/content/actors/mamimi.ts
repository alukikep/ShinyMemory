import type { ActorDef } from '../../types';

/**
 * 田中摩美々的作息。
 *
 * 依据：她是 L'Antica 里"不登校、白天在街上放浪"的那个。
 * - **不排学校**（protected 的时段对她是空的）。
 * - 下午多在**商业街/公园**晃，傍晚才进**录音棚**。
 * - 晚上是她的时间（她喜欢夜里的街），所以夜里常在公园。
 */
const actor: ActorDef = {
  id: 'mamimi',
  name: '田中摩美々',
  role: 'idol',
  description: "L'Antica 的成员。不登校，白天在街上放浪，说话总带拖长音。",
  color: '#b79bd1',
  schedule: [
    {
      fromMinute: 11 * 60,
      toMinute: 15 * 60,
      locationId: 'shopping_street',
      weekdays: [1, 3, 5],
      label: '在街上晃',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [1, 3, 5],
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 17 * 60,
      locationId: 'park',
      weekdays: [2, 4],
      label: '放浪',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 23 * 60,
      locationId: 'park',
      weekdays: [2, 4, 6],
      label: '夜里的街',
      protected: false,
    },
    {
      fromMinute: 12 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [0, 6],
      label: '闲逛',
      protected: false,
    },
  ],
  // 日常话题走审查台的 topic 草稿（approved 内容），这里留空。
  topics: [],
};

export default actor;
