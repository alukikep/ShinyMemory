import type { ActivityDef } from '../../types';

const card: ActivityDef = {
  "id": "vocal",
  "name": "声乐课",
  "description": "气息、音准、把一句歌唱完整。",
  "kind": "training",
  "locations": ["practice_room"],
  "durationMinutes": 120,
  "timeWindows": [{ "fromMinute": 480, "toMinute": 1200 }],
  "cost": {
    "money": 500,
    "stamina": 15
  },
  "effects": [
    {
        "kind": "idolExp",
        "attribute": "vocal",
        "tier": 3
      },
    {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 8
      }
  ],
  "resultTexts": [
    "她跟着钢琴重复同一句，第三次终于准了。",
    "她唱完，自己先笑了一下，说“这次好像还行”。",
    "她把手放在腹部，试着找气息落下去的位置。"
  ],
  "resultVariants": [
    {
      "when": [
        {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 70
      }
      ],
      "text": "她唱到一半停下来，说“再来一次”，但声音已经有点哑。"
    },
    {
      "when": [
        {
        "kind": "sharedStatAtMost",
        "stat": "stamina",
        "value": 30
      }
      ],
      "text": "她靠在墙边，气息不太稳，但还是把整段唱完了。"
    }
  ]
};

export default card;
