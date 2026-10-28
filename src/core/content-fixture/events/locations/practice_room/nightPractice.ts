import type { EventDef } from '../../../../types';

const card: EventDef = {
  "id": "evt.night_practice",
  "title": "深夜的练习室",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 1
    },
    {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 25
      },
    {
      "kind": "atLocation",
      "locationId": "practice_room"
    },
    {
      "kind": "timeWindow",
      "fromMinute": 1080,
      "toMinute": 1380
    }
  ],
  "once": true,
  "weight": 10,
  "text": "晚上十点，练习室的灯还亮着。她对着镜子，一遍一遍地重复同一个转身。",
  "choices": [
    {
      "label": "陪她练一会儿",
      "effects": [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -10
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -5
      }
      ],
      "result": "她没说话，但把音乐的拍子调慢了一点。"
    },
    {
      "label": "劝她回去休息",
      "effects": [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -10
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1,
        "direction": "loss"
      }
      ],
      "result": "她关了灯，但在门口站了很久。"
    },
    {
      "label": "什么也不说，先走",
      "effects": [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 3
      }
      ],
      "result": "你听见身后又响起了音乐。"
    }
  ]
};

export default card;
