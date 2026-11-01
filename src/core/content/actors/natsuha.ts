import type { ActorDef } from '../../types';

/**
 * 有栖川夏葉的作息。
 *
 * 依据：
 * - 大学生（经济/经营/会计/统计），平日上午有课 [facts]。
 * - 她独居、养狗カトレア；早上起不来，靠散步醒神 [facts]。
 * - 她每天跑步、上健身房、洗完澡拉伸；练习室是舞蹈课（相遇就在那里）[101300101]。
 * - 等工作的空档也在练平衡 [101300102]。
 *
 * **不建"健身房"地点**：剧本只提到「ジム」三个字，没有描写，所以训练动作挂在
 * 练习室和公园（跑步）。不要为了一个词造一座空建筑。
 *
 * 一周不重样：练习室每周 6 天；双周轮换用在周三下午、周六上午、周日下午。
 */
const actor: ActorDef = {
  id: 'natsuha',
  name: '有栖川夏葉',
  role: 'idol',
  description: "放学后 Climax Girls 的最年长成员。大小姐口吻，目标只有顶点。",
  schedule: [
    {
      fromMinute: 9 * 60,
      toMinute: 13 * 60,
      locationId: 'university',
      weekdays: [1, 2, 3, 4, 5],
      label: '大学',
      visibility: 'private',
      protected: true,
    },
    // 练习：周一、周二、周五固定；周四晚一点；周六下午
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60 + 30,
      locationId: 'practice_room',
      weekdays: [1, 2, 5],
      label: '练习',
      protected: false,
    },
    // 周一：练习 → 商店街
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'shopping_street',
      weekdays: [1],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [1],
      label: '回家',
      protected: false,
    },
    // 周二：练习 → 公园跑步
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'park',
      weekdays: [2],
      label: '跑步',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [2],
      label: '回家',
      protected: false,
    },
    // 周三：第 1 周加练，第 2 周去事务所处理工作
    {
      fromMinute: 15 * 60,
      toMinute: 18 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      weekParity: 'first',
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60 + 30,
      locationId: 'office',
      weekdays: [3],
      weekParity: 'second',
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 18 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'first',
      label: '回家',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [3],
      weekParity: 'second',
      label: '回家',
      protected: false,
    },
    // 周四：先事务所，再练习
    {
      fromMinute: 14 * 60,
      toMinute: 16 * 60,
      locationId: 'office',
      weekdays: [4],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 19 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [4],
      label: '回家',
      protected: false,
    },
    // 周五：练习 → 车站附近
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 19 * 60,
      locationId: 'station',
      weekdays: [5],
      label: '车站附近',
      protected: false,
    },
    {
      fromMinute: 19 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [5],
      label: '回家',
      protected: false,
    },
    // 周六：上午双周轮换（晨跑 / 遛狗），下午练习，傍晚商店街
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'park',
      weekdays: [6],
      weekParity: 'first',
      label: '跑步',
      protected: false,
    },
    {
      fromMinute: 9 * 60,
      toMinute: 11 * 60,
      locationId: 'home',
      weekdays: [6],
      weekParity: 'second',
      label: '遛狗',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 15 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 15 * 60,
      toMinute: 17 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 17 * 60,
      toMinute: 22 * 60,
      locationId: 'home',
      weekdays: [6],
      label: '回家',
      protected: false,
    },
    // 周日：上午在家遛狗，下午双周轮换（公园 / 商店街）
    {
      fromMinute: 9 * 60,
      toMinute: 12 * 60,
      locationId: 'home',
      weekdays: [0],
      label: '遛狗',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'park',
      weekdays: [0],
      weekParity: 'first',
      label: '跑步',
      protected: false,
    },
    {
      fromMinute: 13 * 60,
      toMinute: 16 * 60,
      locationId: 'shopping_street',
      weekdays: [0],
      weekParity: 'second',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 16 * 60,
      toMinute: 22 * 60,
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
