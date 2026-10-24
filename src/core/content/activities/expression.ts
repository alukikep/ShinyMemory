import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  "id": "expression",
  "name": "表现课",
  "description": "镜头、眼神、把一句话说进别人心里。",
  "kind": "training",
  "cost": {
    "money": 500,
    "stamina": 12
  },
  "effects": [
    {
      "kind": "stat",
      "stat": "expression",
      "delta": 6
    },
    {
      "kind": "stat",
      "stat": "stress",
      "delta": 7
    }
  ],
  "resultTexts": [
    "她对着镜头说了一句很普通的问候，却让人想再看一遍。",
    "老师让她把同一句话用三种语气说。她选了最轻的那种。",
    "她试着不看镜头，只看着镜头后面的你。"
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
      "text": "她笑着说完那段话，导演喊卡之后，笑容立刻掉了下来。"
    }
  ]
};

export default card;
