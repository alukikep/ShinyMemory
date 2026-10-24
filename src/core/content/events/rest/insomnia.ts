import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.insomnia",
  "title": "凌晨一点",
  "when": [
    {
      "kind": "statAtLeast",
      "stat": "stress",
      "value": 60
    }
  ],
  "once": false,
  "weight": 8,
  "text": "凌晨一点，她发来一条消息：“睡了吗？” 过了几秒，又补了一句：“没事。”",
  "choices": [
    {
      "label": "陪她聊到睡着",
      "effects": [
        {
          "kind": "stat",
          "stat": "stamina",
          "delta": -10
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -8
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 1
        }
      ],
      "result": "她最后一条消息是“晚安”，后面跟了一个很笨的颜文字。"
    },
    {
      "label": "让她数羊",
      "effects": [
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -2
        }
      ],
      "result": "她回了个“好”，你也不知道她有没有真的数。"
    },
    {
      "label": "第二天再问",
      "effects": [
        {
          "kind": "stat",
          "stat": "stress",
          "delta": 2
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": -1
        }
      ],
      "result": "第二天她看起来没事，但你注意到她眼下有点青。"
    }
  ]
};

export default card;
