import type { EventDef } from '../../../../types';

const card: EventDef = {
  "id": "evt.before_live",
  "title": "Live 前夜",
  "when": [
    {
      "kind": "weekAtLeast",
      "week": 11
    },
    {
      "kind": "atLocation",
      "locationId": "studio"
    }
  ],
  "once": true,
  "weight": 10,
  "text": "Live 前夜。她坐在舞台侧幕的台阶上，手里攥着 setlist，纸边已经被捏软了。",
  "choices": [
    {
      "label": "陪她坐一会儿",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 2
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -8
        }
      ],
      "result": "你们谁也没说话。远处的灯一盏一盏亮起来。"
    },
    {
      "label": "再对一遍流程",
      "effects": [
        {
          "kind": "stat",
          "stat": "vocal",
          "delta": 2
        },
        {
          "kind": "stat",
          "stat": "dance",
          "delta": 2
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": 5
        }
      ],
      "result": "她跟着你过了一遍，声音慢慢稳下来。"
    },
    {
      "label": "让她一个人待着",
      "effects": [
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -3
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": -1
        }
      ],
      "result": "你走开时，听见她轻轻哼起了第一句。"
    }
  ]
};

export default card;
