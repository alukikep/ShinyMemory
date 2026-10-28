import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.tv_offer",
  "title": "临时通告",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 1
    },
    {
      "kind": "moneyAtMost",
      "value": 2000
    },
    {
      "kind": "atLocation",
      "locationId": "studio"
    },
    {
      "kind": "timeWindow",
      "fromMinute": 1200,
      "toMinute": 1380
    }
  ],
  "once": true,
  "weight": 10,
  "text": "事务所临时塞来一个深夜综艺的通告。钱不少，但明天一早还有课。",
  "choices": [
    {
      "label": "接下",
      "durationMinutes": 240,
      "effects": [
        {
          "kind": "money",
          "delta": 1800
        },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 15
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -15
      }
      ],
      "result": "录制结束时已经过了零点。她在车上睡着了。"
    },
    {
      "label": "拒绝",
      "effects": [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -3
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      }
      ],
      "result": "她听说你推掉了，愣了一下，说“其实我可以的”。"
    },
    {
      "label": "问她自己的意思",
      "effects": [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 2
      }
      ],
      "result": "她想了很久，说“我想试试”。"
    }
  ]
};

export default card;
