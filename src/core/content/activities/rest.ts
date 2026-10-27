import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  "id": "rest",
  "name": "休息",
  "description": "什么都不做，也是一种安排。",
  "kind": "rest",
  "locations": ["office"],
  "durationMinutes": 120,
  "timeWindows": [{ "fromMinute": 480, "toMinute": 1320 }],
  "cost": {},
  "effects": [
    {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": 30
      },
    {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -20
      },
    {
      "kind": "flag",
      "key": "forced_rest",
      "value": false
    }
  ],
  "resultTexts": [
    "你在沙发上坐了一会儿，什么都没有做。",
    "你没有说几句话，只看着窗外发了一会儿呆。",
    "你抱着靠垫，难得没有想接下来的安排。"
  ],
  "resultVariants": [
    {
      "when": [
        {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 80
      }
      ],
      "text": "你几乎是一坐下就睡着了。醒来时，窗外的光已经换了一个角度。"
    }
  ]
};

export default card;
