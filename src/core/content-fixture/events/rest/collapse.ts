import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.collapse",
  "title": "过劳",
  "when": [
    {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 55
      }
  ],
  "once": true,
  "priority": 100,
  "text": "练习到一半，她突然扶住把杆，慢慢蹲了下去。“……让我缓一下。”",
  "choices": [
    {
      "label": "扶她去休息",
      "effects": [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -30
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": 20
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
        {
          "kind": "flag",
          "key": "forced_rest",
          "value": true
        }
      ],
      "result": "她没再逞强，靠在你肩上睡着了。"
    },
    {
      "label": "让她再坚持一下",
      "effects": [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 5
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -10
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3,
        "direction": "loss"
      }
      ],
      "result": "她站起来，但之后每个动作都慢半拍。"
    }
  ]
};

export default card;
