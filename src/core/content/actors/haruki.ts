import type { ActorDef } from '../../types';

/**
 * 郁田はるき的作息。
 *
 * 依据：
 * - 17 岁，美术科高中二年级；平日在学校，放学后练习 [102800505]。
 * - 借住在东京的姐姐家（不是宿舍），所以晚上回 `home` 方向——这里用 `apartment` 怕撞设定，
 *   统一写 `home`（姐姐家的门牌，机制上等同"回家"）。
 * - 她还有映像部、朋友乐队这些事，但因为已经退部/收敛，日程按"学校 → 练习"排。
 * - 周六双周轮换：画廊街（商店街）／公园写生。
 *
 * 注意：学生身份是**硬声明**——`school: 'high'` 要求平日有 protected 的学校时段，
 * `contentAudit` 会拦（见 dev-guide #37）。
 */
const actor: ActorDef = {
  id: 'haruki',
  name: '郁田はるき',
  role: 'idol',
  description:
    'CoMETIK 的成员。美术科高二，借住在姐姐家；说话软、笑点低，一说到想做的事就停不下来。',
  schedule: [
    // 平日上午：学校（protected）
    {
      fromMinute: 8 * 60,
      toMinute: 15 * 60,
      locationId: 'school',
      weekdays: [1, 2, 3, 4, 5],
      label: '上学',
      protected: true,
    },
    // 周一
    {
      fromMinute: 16 * 60,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家（姐姐家）',
      protected: false,
    },
    // 周二
    {
      fromMinute: 16 * 60,
      toMinute: 18 * 60,
      locationId: 'office',
      weekdays: [2],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 21 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回家（姐姐家）',
      protected: false,
    },
    // 周三
    {
      fromMinute: 16 * 60,
      toMinute: 19 * 60,
      locationId: 'shopping_street',
      weekdays: [3],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 19 * 60 + 30,
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
      label: '回家（姐姐家）',
      protected: false,
    },
    // 周四
    {
      fromMinute: 16 * 60,
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
      locationId: 'home',
      weekdays: [4],
      label: '回家（姐姐家）',
      protected: false,
    },
    // 周五
    {
      fromMinute: 16 * 60,
      toMinute: 19 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'hall',
      weekdays: [5],
      label: '会场',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家（姐姐家）',
      protected: false,
    },
    // 周六：双周轮换（商店街的画廊／公园写生）→ 练习
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'first',
      label: '画廊街',
      protected: false,
    },
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'park',
      weekdays: [6],
      weekParity: 'second',
      label: '公园（写生）',
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
      locationId: 'home',
      weekdays: [6],
      label: '回家（姐姐家）',
      protected: false,
    },
    // 周日：公园 → 练习 → 回家
    {
      fromMinute: 13 * 60,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [0],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '回家（姐姐家）',
      protected: false,
    },
  ],
  topics: [],
};

export default actor;
