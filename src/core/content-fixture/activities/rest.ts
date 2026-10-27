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
    "她在沙发上睡着了，呼吸声很轻。",
    "你们没说几句话。她把外套盖在腿上，看着窗外发了一会儿呆。",
    "她抱着靠垫，难得没有提练习的事。"
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
      "text": "她几乎是一坐下就睡着了。你替她把灯调暗了一点。"
    }
  ]
};

export default card;
