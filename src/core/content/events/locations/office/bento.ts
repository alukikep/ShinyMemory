import type { EventDef } from '../../../../types';

const card: EventDef = {
  "id": "evt.bento",
  "title": "便当",
  "when": [
    {
      "kind": "weekAtLeast",
      "week": 3
    },
    {
      "kind": "statAtLeast",
      "stat": "trust",
      "value": 8
    },
    {
      "kind": "atLocation",
      "locationId": "office"
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
          "kind": "stat",
          "stat": "trust",
          "delta": 2
        },
        {
          "kind": "stat",
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
          "kind": "stat",
          "stat": "trust",
          "delta": -1
        }
      ],
      "result": "她把便当盒收回去，动作比平时快。"
    },
    {
      "label": "分她一半",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 1
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -3
        }
      ],
      "result": "你们在练习室的地板上吃完了那份便当。"
    }
  ]
};

export default card;
