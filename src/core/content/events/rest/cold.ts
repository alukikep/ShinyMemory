import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.cold",
  "title": "鼻音",
  "when": [
    {
      "kind": "statAtMost",
      "stat": "stamina",
      "value": 30
    }
  ],
  "once": true,
  "weight": 20,
  "text": "她说话带着鼻音，练习到一半停下来咳了几声。“没事，最近有点干。”",
  "choices": [
    {
      "label": "让她今天休息",
      "effects": [
        {
          "kind": "stat",
          "stat": "stamina",
          "delta": 20
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -10
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 1
        },
        {
          "kind": "flag",
          "key": "forced_rest",
          "value": true
        }
      ],
      "result": "她裹着外套在沙发上睡着了，呼吸声很轻。"
    },
    {
      "label": "再坚持一下",
      "effects": [
        {
          "kind": "stat",
          "stat": "stamina",
          "delta": -10
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": 10
        },
        {
          "kind": "stat",
          "stat": "trust",
          "delta": -2
        }
      ],
      "result": "她点点头，但下一句歌词没有唱上去。"
    },
    {
      "label": "去医院",
      "effects": [
        {
          "kind": "money",
          "delta": -800
        },
        {
          "kind": "stat",
          "stat": "stamina",
          "delta": 30
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -5
        }
      ],
      "result": "医生说只是感冒，她一路上都在说“太夸张了”。"
    }
  ]
};

export default card;
