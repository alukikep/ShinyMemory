import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  "id": "work",
  "name": "节目收录",
  "description": "有钱，有曝光，也有半夜回家的电车。",
  "kind": "work",
  "locations": ["studio"],
  "cost": {
    "stamina": 20
  },
  "effects": [
    {
      "kind": "money",
      "delta": 1500
    },
    {
      "kind": "stat",
      "stat": "stress",
      "delta": 14
    }
  ],
  "resultTexts": [
    "录制比预想中顺利。她在休息间隙偷偷打了个哈欠。",
    "工作人员夸她“比想象中稳”。她鞠躬的时候，耳朵有点红。",
    "收工时已经过了十点。她在回程的车上睡着了。"
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
      "text": "她在镜头前笑得很标准。只有你知道，她今天几乎没怎么吃东西。"
    }
  ]
};

export default card;
