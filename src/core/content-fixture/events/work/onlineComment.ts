import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.online_comment",
  "title": "评论区",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 2
    },
    {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 25
      }
  ],
  "once": true,
  "weight": 10,
  "text": "你在网上看到一条评论，说她“没什么存在感”。她正好从你身后经过。",
  "choices": [
    {
      "label": "关掉页面，装作没看见",
      "effects": [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 2
      }
      ],
      "result": "她什么也没问，但那天话比平时少。"
    },
    {
      "label": "告诉她别在意",
      "effects": [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -3
      }
      ],
      "result": "她说“我知道”，但手指一直在抠袖口。"
    },
    {
      "label": "把评论念给她听，然后说你的看法",
      "effects": [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 5
      }
      ],
      "result": "她听完，沉默了一会儿，说“那你觉得呢？”"
    }
  ]
};

export default card;
