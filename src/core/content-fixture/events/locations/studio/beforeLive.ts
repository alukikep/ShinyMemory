import type { EventDef } from '../../../../types';

const card: EventDef = {
  "id": "evt.before_live",
  "title": "Live 前夜",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 3
    },
    {
      "kind": "atLocation",
      "locationId": "studio"
    },
    {
      "kind": "timeWindow",
      "fromMinute": 1080,
      "toMinute": 1380
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
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
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
        "kind": "attributeExp",
        "ref": "vocal",
        "tier": 3
      },
        {
        "kind": "attributeExp",
        "ref": "dance",
        "tier": 3
      },
        {
        "kind": "sharedStat",
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
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -3
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1,
        "direction": "loss"
      }
      ],
      "result": "你走开时，听见她轻轻哼起了第一句。"
    }
  ]
};

export default card;
