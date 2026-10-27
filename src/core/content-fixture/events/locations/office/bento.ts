import type { EventDef } from '../../../../types';

const card: EventDef = {
  "id": "evt.bento",
  "title": "便当",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 1
    },
    {
        "kind": "rankAtLeast",
        "attribute": "trust",
        "rank": "C"
      },
    {
      "kind": "atLocation",
      "locationId": "office"
    },
    {
      "kind": "timeWindow",
      "fromMinute": 660,
      "toMinute": 840
    }
  ],
  "once": true,
  "weight": 10,
  "text": "午休时，她把一个歪歪扭扭的便当盒推到你面前。“……做多了。”",
  "choices": [
    {
      "label": "收下，认真吃完",
      "effects": [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": 10
      }
      ],
      "result": "她假装在看手机，耳朵却红了。"
    },
    {
      "label": "说已经吃过了",
      "effects": [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1,
        "direction": "loss"
      }
      ],
      "result": "她把便当盒收回去，动作比平时快。"
    },
    {
      "label": "分她一半",
      "effects": [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -3
      }
      ],
      "result": "你们在练习室的地板上吃完了那份便当。"
    }
  ]
};

export default card;
