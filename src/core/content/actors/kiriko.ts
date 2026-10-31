import type { ActorDef } from '../../types';

/**
 * 幽谷霧子的作息。
 *
 * 依据：
 * - 高中二年级（API 年龄 17；剧本里她对自己的事说得很少）。
 * - 第二天清晨她会提前到练习室打扫 [1008001020010][1008001020020]。
 * - 医院/家庭目前只有二手资料（待核），先给她安排傍晚与周末的医院时段，
 *   让将来的"医院"专属行动有地方落；核实后再改。
 */
const actor: ActorDef = {
  id: 'kiriko',
  name: '幽谷霧子',
  role: 'idol',
  description: "L'Antica 的成员。说话很轻，总在替别人着想。",
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
    {
      // 放学后练习：训练课与"课后事件"都挂在这里。
      fromMinute: 15 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [1, 2, 3, 4, 5],
      label: '练习',
      protected: false,
    },
    {
      // 待核：医院志愿者/家里在医院宿舍。
      fromMinute: 18 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'hospital',
      weekdays: [1, 2, 3, 4, 5],
      label: '医院',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 14 * 60,
      locationId: 'hospital',
      weekdays: [0, 6],
      label: '医院',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [0, 6],
      label: '散步',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
