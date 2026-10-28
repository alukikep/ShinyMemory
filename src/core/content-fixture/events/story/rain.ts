import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.rain",
  "title": "雨天",
  "when": [
    {
      "kind": "dayAtLeast",
      "day": 1
    },
    {
      "kind": "timeWindow",
      "fromMinute": 960,
      "toMinute": 1200
    }
  ],
  "once": true,
  "weight": 10,
  "text": "傍晚突然下起雨。她站在校门口，看着没有停的意思的雨，把书包抱在怀里。",
  "choices": [
    {
      "label": "把伞给她，自己跑回去",
      "effects": [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -10
      }
      ],
      "result": "第二天她把伞还给你，伞柄上缠了一圈新的胶带。"
    },
    {
      "label": "叫车送她回家",
      "effects": [
        {
          "kind": "money",
          "delta": -500
        },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      }
      ],
      "result": "车开走前，她摇下车窗说了句“明天见”。"
    },
    {
      "label": "一起等雨停",
      "effects": [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -3
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -5
      }
      ],
      "result": "雨停了，你们谁也没提刚才那半小时。"
    }
  ]
};

export default card;
