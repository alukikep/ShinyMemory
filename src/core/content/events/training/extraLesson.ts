import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.extra_lesson",
  "title": "再来一遍",
  "when": [
    {
      "kind": "statAtMost",
      "stat": "stamina",
      "value": 50
    }
  ],
  "once": false,
  "weight": 6,
  "cooldownActions": 4,
  "text": "今天的课程结束了。她站在练习室门口，回头看你：“要不要再来一遍？”",
  "choices": [
    {
      "label": "加练",
      "effects": [
        {
          "kind": "stat",
          "stat": "vocal",
          "delta": 3
        },
        {
          "kind": "stat",
          "stat": "dance",
          "delta": 3
        },
        {
          "kind": "stat",
          "stat": "stamina",
          "delta": -15
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": 10
        }
      ],
      "result": "你们把那段副歌练到保安来催。"
    },
    {
      "label": "今天到此为止",
      "effects": [
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -5
        },
        {
          "kind": "stat",
          "stat": "stamina",
          "delta": 5
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 1
        }
      ],
      "result": "她有点不甘心，但还是收拾了东西。"
    },
    {
      "label": "去吃点东西",
      "effects": [
        {
          "kind": "money",
          "delta": -300
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -8
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 2
        }
      ],
      "result": "她在便利店挑了很久，最后选了一个最便宜的饭团。"
    }
  ]
};

export default card;
