import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.insomnia",
  "title": "凌晨一点",
  "when": [
    {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 40
      },
    {
      "kind": "timeWindow",
      "fromMinute": 0,
      "toMinute": 300
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
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -10
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -8
      },
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1
      }
      ],
      "result": "她最后一条消息是“晚安”，后面跟了一个很笨的颜文字。"
    },
    {
      "label": "让她数羊",
      "effects": [
        {
        "kind": "sharedStat",
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
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 2
      },
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1,
        "direction": "loss"
      }
      ],
      "result": "第二天她看起来没事，但你注意到她眼下有点青。"
    }
  ]
};

export default card;
