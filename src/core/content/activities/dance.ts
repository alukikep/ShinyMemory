import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  "id": "dance",
  "name": "舞蹈课",
  "description": "同一个转身，练到不用想为止。",
  "kind": "training",
  "locations": ["practice_room"],
  "durationMinutes": 120,
  "timeWindows": [{ "fromMinute": 480, "toMinute": 1200 }],
  "cost": {
    "money": 500,
    "stamina": 18
  },
  "effects": [
    {
      "kind": "stat",
      "stat": "dance",
      "delta": 6
    },
    {
      "kind": "stat",
      "stat": "stress",
      "delta": 10
    }
  ],
  "resultTexts": [
    "她数着拍子，把同一个转身重复了十几遍。",
    "镜子里的动作终于和音乐对上了。她停下来，喘了口气。",
    "她扶着把杆，脚尖在地板上点了两下，像是在确认节奏。"
  ],
  "resultVariants": [
    {
      "when": [
        {
          "kind": "statAtLeast",
          "stat": "stress",
          "value": 70
        }
      ],
      "text": "她的动作开始慢半拍，停下来之后，盯着镜子里的自己看了很久。"
    },
    {
      "when": [
        {
          "kind": "statAtMost",
          "stat": "stamina",
          "value": 30
        }
      ],
      "text": "最后一个八拍，她几乎是咬着牙做完的。"
    }
  ]
};

export default card;
