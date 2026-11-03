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
        "delta": 15
      },
    {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -4
      },
    {
      "kind": "flag",
      "key": "forced_rest",
      "value": false
    }
  ],
  "levels": [
    {
      "level": 1,
      "requires": [{ "kind": "varAtLeast", "key": "facility.sofa", "value": 1 }],
      "description": "换一张能躺下的沙发：休息恢复 20 体力，压力 -6。",
      "effects": [
        { "kind": "sharedStat", "stat": "stamina", "delta": 20 },
        { "kind": "sharedStat", "stat": "stress", "delta": -6 },
        { "kind": "flag", "key": "forced_rest", "value": false }
      ]
    },
    {
      "level": 2,
      "requires": [{ "kind": "varAtLeast", "key": "facility.sofa", "value": 2 }],
      "description": "加一张靠垫和一条毯子：休息恢复 25 体力，压力 -8。",
      "effects": [
        { "kind": "sharedStat", "stat": "stamina", "delta": 25 },
        { "kind": "sharedStat", "stat": "stress", "delta": -8 },
        { "kind": "flag", "key": "forced_rest", "value": false }
      ]
    },
    {
      "level": 3,
      "requires": [{ "kind": "varAtLeast", "key": "facility.sofa", "value": 3 }],
      "description": "把角落改成真正的休息区：休息恢复 30 体力，压力 -10。",
      "effects": [
        { "kind": "sharedStat", "stat": "stamina", "delta": 30 },
        { "kind": "sharedStat", "stat": "stress", "delta": -10 },
        { "kind": "flag", "key": "forced_rest", "value": false }
      ]
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
