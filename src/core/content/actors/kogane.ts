import type { ActorDef } from '../../types';

/**
 * 月岡恋鐘的作息。
 *
 * 依据：
 * - 已上京、住宿舍（S.T.E.P. 待核），没有学校时段。
 * - 她会用事务所现有的材料做饭 [2004003010010][2004003010020]，
 *   所以中午与傍晚在事务所各留一段。
 * - W.I.N.G. 第一次工作是キャンペーンガール [100400102]，收录在录音棚。
 */
const actor: ActorDef = {
  id: 'kogane',
  name: '月岡恋鐘',
  role: 'idol',
  description: "L'Antica 的成员。爱操心的食堂女儿，说话带长崎口音。",
  schedule: [
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [1, 2, 3, 4, 5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 12 * 60,
      toMinute: 14 * 60,
      locationId: 'office',
      weekdays: [1, 2, 3, 4, 5],
      label: '做饭',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'studio',
      weekdays: [1, 2, 3, 4, 5],
      label: '收录',
      protected: false,
    },
    {
      // 收工后回事务所做晚饭：专属行动的挂载点。
      fromMinute: 18 * 60,
      toMinute: 21 * 60,
      locationId: 'office',
      weekdays: [1, 2, 3, 4, 5],
      label: '做饭',
      protected: false,
    },
    {
      fromMinute: 21 * 60,
      toMinute: 23 * 60,
      locationId: 'home',
      weekdays: [1, 2, 3, 4, 5],
      label: '宿舍',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'practice_room',
      weekdays: [0, 6],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 18 * 60,
      locationId: 'shopping_street',
      weekdays: [0, 6],
      label: '逛街',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [0, 6],
      label: '宿舍',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（<id>.chat.*），这里留空。
  topics: [],
};

export default actor;
