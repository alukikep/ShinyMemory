import type { ActorDef } from '../../types';

/**
 * 斑鳩ルカ的作息。
 *
 * 依据：
 * - 20 岁，不在学校；一个人在各处的练习室、外面的租用工作室「追い込んで」地练，
 *   舞蹈训练师说她「きっと誰よりも練習していますよ」[WING 4 the key]。
 * - 练到脚步不稳也不停，冬天穿得单薄 [283活动剧情 / 黑色彗星 400106903]。
 * - 会去唱片店（买自己的旧碟、给粉丝签名）[new or ... / 気まぐれな熱]。
 * - 会去会场看别人的 live、也在这里办自己的小型演出 [broken shout 202600404]。
 * - 住在外面租的公寓，深夜才回去 [490103901〜910]。
 *
 * 她几乎不来事务所——刚到 283 时说的第一句就是
 * 「２８３は窓口として使うだけ／ひとりでやる」[WING 3 deny]。
 */
const actor: ActorDef = {
  id: 'luca',
  name: '斑鳩ルカ',
  role: 'idol',
  description:
    'CoMETIK 的成员。话短、火气大、大半句子只有省略号；一个人练到站不稳也不停。',
  schedule: [
    // 周一：练习室长练 → 会场（看别人的 live）→ 深夜回公寓
    {
      fromMinute: 10 * 60,
      toMinute: 15 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 18 * 60,
      locationId: 'hall',
      weekdays: [1],
      label: '会场',
      protected: false,
    },
    {
      fromMinute: 18 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'practice_room',
      weekdays: [1],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 23 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'apartment',
      weekdays: [1],
      label: '回公寓',
      protected: false,
    },
    // 周二：唱片店（翻旧碟）→ 练习室
    {
      fromMinute: 11 * 60,
      toMinute: 13 * 60,
      locationId: 'record_shop',
      weekdays: [2],
      label: '唱片店',
      protected: false,
    },
    {
      fromMinute: 13 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [2],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'apartment',
      weekdays: [2],
      label: '回公寓',
      protected: false,
    },
    // 周三：事务所（只谈工作）→ 练习室
    {
      fromMinute: 13 * 60,
      toMinute: 15 * 60,
      locationId: 'office',
      weekdays: [3],
      label: '事务所',
      protected: false,
    },
    {
      fromMinute: 15 * 60 + 30,
      toMinute: 23 * 60,
      locationId: 'practice_room',
      weekdays: [3],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 23 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'apartment',
      weekdays: [3],
      label: '回公寓',
      protected: false,
    },
    // 周四：公园（走一走、买罐装咖啡）→ 练习室
    {
      fromMinute: 10 * 60,
      toMinute: 12 * 60,
      locationId: 'park',
      weekdays: [4],
      label: '公园',
      protected: false,
    },
    {
      fromMinute: 12 * 60 + 30,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [4],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'apartment',
      weekdays: [4],
      label: '回公寓',
      protected: false,
    },
    // 周五：练习 → 会场（自己的小型演出/彩排）
    {
      fromMinute: 10 * 60,
      toMinute: 17 * 60,
      locationId: 'practice_room',
      weekdays: [5],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 17 * 60 + 30,
      toMinute: 21 * 60,
      locationId: 'hall',
      weekdays: [5],
      label: '会场',
      protected: false,
    },
    {
      fromMinute: 21 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'apartment',
      weekdays: [5],
      label: '回公寓',
      protected: false,
    },
    // 周六：上午双周轮换（站前 / 商店街）→ 练习室
    {
      fromMinute: 11 * 60,
      toMinute: 13 * 60,
      locationId: 'station',
      weekdays: [6],
      weekParity: 'first',
      label: '站前',
      protected: false,
    },
    {
      fromMinute: 11 * 60,
      toMinute: 13 * 60,
      locationId: 'shopping_street',
      weekdays: [6],
      weekParity: 'second',
      label: '商店街',
      protected: false,
    },
    {
      fromMinute: 13 * 60 + 30,
      toMinute: 20 * 60,
      locationId: 'practice_room',
      weekdays: [6],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 20 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'apartment',
      weekdays: [6],
      label: '回公寓',
      protected: false,
    },
    // 周日：下午才出门，练习室 → 深夜回公寓
    {
      fromMinute: 13 * 60,
      toMinute: 22 * 60,
      locationId: 'practice_room',
      weekdays: [0],
      label: '练习',
      protected: false,
    },
    {
      fromMinute: 22 * 60 + 30,
      toMinute: 24 * 60,
      locationId: 'apartment',
      weekdays: [0],
      label: '回公寓',
      protected: false,
    },
  ],
  // 话题走审查台的 topic 草稿（luca.chat.*），这里留空。
  topics: [],
};

export default actor;
