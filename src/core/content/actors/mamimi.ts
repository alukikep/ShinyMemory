import type { ActorDef } from '../../types';

/**
 * 田中摩美々的作息。
 *
 * 依据（101 剧本）：她是高中生，放学后要练习，「めんどくさそー」[1005001010040]；
 * 白天在街上、傍晚进录音棚是改编的挂载点。
 * - **学校是 protected 的**：不能被工作顶掉。
 * - 放学后在**练习室**（训练行动的挂载点）、商业街、公园之间移动。
 * - 晚上是她的时间（她喜欢夜里的街），所以夜里常在公园。
 */
const actor: ActorDef = {
  id: 'mamimi',
  name: '田中摩美々',
  role: 'idol',
  // "不登校"没有出处（事故 #28），名册上不该这么写。
  description: 'L\'Antica 的成员。高中生，放学后要练习；说话总带拖长音。',
  color: '#b79bd1',
  schedule: [
    {
      // 她是高中生（1005001010030–1005001010070）：白天要上学，不能被工作顶掉。
      fromMinute: 8 * 60,
      toMinute: 15 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '上学',
      visibility: 'private',
      protected: true,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 19 * 60,
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
      // 原作：「当偶像要每天放学后练习」，她嫌「めんどくさそー」[1005001010040]。
      // 放学校区之后的空档给练习室——没有这一段，舞蹈课/表演课对她永远不可用，
      // 挂在课后的两个事件就成了死内容（事故 #30）。
      fromMinute: 17 * 60,
      toMinute: 19 * 60,
      locationId: 'practice_room',
      weekdays: [2, 4],
      label: '练习',
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
