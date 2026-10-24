import type { EndingDef } from '../../types';

const card: EndingDef = {
  "id": "end.bad",
  "title": "过劳的代价",
  "accent": "bad",
  "when": [
    {
      "kind": "any",
      "of": [
        {
          "kind": "scoreAtMost",
          "value": 54
        },
        {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 80
      }
      ]
    }
  ],
  "text": "她还在笑。谢幕的时候，她笑得很标准，像练习过很多次。\n\n你站在侧幕，看见她下台时扶了一下墙。\n\n那一刻你才意识到，有些东西比分数更早地亮起了红灯。\n\n她回头看见你，还是笑了一下，说：“我没事。”"
};

export default card;
