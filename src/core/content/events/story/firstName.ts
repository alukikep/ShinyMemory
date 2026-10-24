import type { EventDef } from '../../../types';

const card: EventDef = {
  "id": "evt.first_name",
  "title": "名字",
  "when": [
    {
      "kind": "weekAtLeast",
      "week": 6
    },
    {
      "kind": "statAtLeast",
      "stat": "trust",
      "value": 12
    }
  ],
  "once": true,
  "weight": 10,
  "text": "她突然叫了你的名字。不是“制作人”，是名字。叫完她自己先愣住了。",
  "choices": [
    {
      "label": "应一声",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 2
        }
      ],
      "result": "她低下头，假装在整理谱子。"
    },
    {
      "label": "开玩笑说她没大没小",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": -1
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": 2
        }
      ],
      "result": "她立刻改口叫“制作人”，之后一整天都没再叫错。"
    },
    {
      "label": "也叫她的名字",
      "effects": [
        {
          "kind": "stat",
          "stat": "trust",
          "delta": 3
        },
        {
          "kind": "stat",
          "stat": "stress",
          "delta": -5
        }
      ],
      "result": "她“嗯”了一声，声音小得几乎听不见。"
    }
  ]
};

export default card;
