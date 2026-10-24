import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.her_past",
  "title": "她的过去",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 2
    },
    {
        "kind": "rankAtLeast",
        "attribute": "trust",
        "rank": "C"
      }
  ],
  "once": true,
  "weight": 10,
  "text": "她说起以前的事。说到一半，她停下来，像是在等你决定要不要继续听。",
  "choices": [
    {
      "label": "安静地听她说完",
      "effects": [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -5
      }
      ],
      "result": "她说完，长长地呼了一口气，说“好像也没那么重了”。"
    },
    {
      "label": "转移话题",
      "effects": [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1,
        "direction": "loss"
      }
      ],
      "result": "她笑了一下，说“也是，没什么好说的”。"
    },
    {
      "label": "告诉她你自己的事",
      "effects": [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -4
      }
      ],
      "result": "她听得很认真，中途一次也没有打断你。"
    }
  ]
};

export default card;
