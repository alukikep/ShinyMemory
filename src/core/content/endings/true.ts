import type { EndingDef } from '../../types';

const card: EndingDef = {
  "id": "end.true",
  "title": "闪耀的舞台",
  "accent": "true",
  "when": [
    {
      "kind": "scoreAtLeast",
      "value": 60
    },
    {
      "kind": "statAtLeast",
      "stat": "trust",
      "value": 14
    },
    {
      "kind": "statAtMost",
      "stat": "stress",
      "value": 40
    }
  ],
  "text": "她站在舞台中央，灯光落在她肩上。\n\n你想起第一次见她时，她连自我介绍都说得磕磕绊绊。\n\n现在她抬起头，对着台下说：“谢谢你们，找到我。”\n\n你站在侧幕，忽然觉得这十二周很长，又很短。"
};

export default card;
