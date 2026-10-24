import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  "id": "free",
  "name": "自由时间",
  "description": "不训练，也不工作。只是待在一起。",
  "kind": "bond",
  "locations": ["office", "practice_room", "studio", "home"],
  "durationMinutes": 120,
  "timeWindows": [{ "fromMinute": 480, "toMinute": 1320 }],
  "cost": {
    "stamina": 10
  },
  "effects": [
    {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 3
      },
    {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -10
      },
    {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": 5
      }
  ],
  "resultTexts": [
    "你们在便利店门口分了一盒关东煮。她挑了最便宜的那个。",
    "她说了很多不着边际的话，最后自己先笑了。",
    "你们沿着车站前的路走了一段，谁也没有提下周的安排。"
  ],
  "resultVariants": [
    {
      "when": [
        {
        "kind": "rankAtLeast",
        "attribute": "trust",
        "rank": "D"
      }
      ],
      "text": "她开始主动跟你说些无关紧要的事。比如今天早上梦见什么，比如她其实不太喜欢甜的。"
    },
    {
      "when": [
        {
        "kind": "sharedStatAtMost",
        "stat": "stamina",
        "value": 25
      }
      ],
      "text": "她没什么精神，但还是陪你走了一段。回去的路上，她走得很慢。"
    }
  ]
};

export default card;
