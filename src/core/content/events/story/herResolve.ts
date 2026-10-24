import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.her_resolve",
  "title": "以后",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 2
    },
    {
      "kind": "statAtLeast",
      "stat": "trust",
      "value": 10
    }
  ],
  "once": true,
  "weight": 10,
  "text": "她第一次主动跟你说起“以后”。不是那种客套的以后，是很具体的、她自己的以后。",
  "choices": [
    {
      "label": "告诉她你会一直在",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 3
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -5
        }
      ],
      "result": "她看着你，像是想确认这句话的重量。"
    },
    {
      "label": "提醒她这条路很难",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 1
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": 3
        }
      ],
      "result": "她点头，说“我知道”，语气比你想的平静。"
    },
    {
      "label": "问她想要什么",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 2
        }
      ],
      "result": "她想了很久，说“想站在有人等着我的地方”。"
    }
  ]
};

export default card;
