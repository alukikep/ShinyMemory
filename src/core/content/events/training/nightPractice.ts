import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.night_practice",
  "title": "深夜的练习室",
  "when": [
    {
      "kind": "weekAtLeast",
      "week": 2
    },
    {
      "kind": "statAtLeast",
      "stat": "stress",
      "value": 40
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
          "kind": "stat",
          "stat": "trust",
          "delta": 2
        },
        {
          "kind": "stat",
          "stat": "stamina",
          "delta": -10
        },
        {
          "kind": "stat",
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
          "kind": "stat",
          "stat": "stress",
          "delta": -10
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": -1
        }
      ],
      "result": "她关了灯，但在门口站了很久。"
    },
    {
      "label": "什么也不说，先走",
      "effects": [
        {
          "kind": "stat",
          "stat": "stress",
          "delta": 3
        }
      ],
      "result": "你听见身后又响起了音乐。"
    }
  ]
};

export default card;
