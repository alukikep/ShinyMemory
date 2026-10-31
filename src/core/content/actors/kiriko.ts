import type { ActorDef } from '../../types';

/**
 * 幽谷霧子的作息。
 *
 * 依据：
 * - 高中二年级（API 年龄 17）。
 * - 第二天清晨她会提前到练习室打扫 [1008001020010][1008001020020]。
 * - 医院/志愿者的细节仍待核（目前只有二手资料），这里只用来安排"傍晚去哪儿"，
 *   不在文案里当设定用。
 *
 * 一周不重样：放学后的练习是核心（训练课与课后事件都挂在这里），
 * 但傍晚去的地方按天分开——一周只去一样的两个地方，日程表会像排班表。
 * 双周轮换只用在"周二傍晚"这段时间上（练习室/公园 vs 收录/公园）。
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
    // 周一：练习 → 医院
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [1, 3, 4, 5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'hospital',
      weekdays: [1, 3],
      label: '医院',
      protected: false,
    },
    // 周二：练习缩短，先去公园，再回医院（第 2 周公园换成收录）
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 17 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 18 * 60 + 30,
      locationId: 'park',
      weekdays: [2],
      weekParity: 'first',
      label: '散步',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 18 * 60 + 30,
      locationId: 'studio',
      weekdays: [2],
      weekParity: 'second',
      label: '收录',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'hospital',
      weekdays: [2],
      label: '医院',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'hospital',
      weekdays: [4],
      label: '医院',
      protected: false,
    },
    // 周四：医院早一点结束，回家路上绕去公园
    {
      fromMinute: 20 * 60,
      toMinute: 21 * 60,
      locationId: 'park',
      weekdays: [4],
      label: '散步',
      protected: false,
    },
    // 周五：顺路买东西，再回医院
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'shopping_street',
      weekdays: [5],
      label: '顺路',
      protected: false,
    },
    {
      fromMinute: 20 * 60,
      toMinute: 21 * 60,
      locationId: 'hospital',
      weekdays: [5],
      label: '医院',
      protected: false,
    },
    // 周六：医院 → 公园
    {
      fromMinute: 10 * 60,
      toMinute: 14 * 60,
      locationId: 'hospital',
      weekdays: [6],
      label: '医院',
      protected: false,
    },
    {
      fromMinute: 14 * 60,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [6],
      label: '散步',
      protected: false,
    },
    // 周日：睡到自然醒，下午出门
    {
      fromMinute: 10 * 60,
      toMinute: 13 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '休息',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 18 * 60,
      locationId: 'park',
      weekdays: [0],
      label: '散步',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
