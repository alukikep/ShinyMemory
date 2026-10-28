import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.vocal_strain',
  title: '嗓子的警告',
  when: [
    {
        "kind": "sharedStatAtMost",
        "stat": "stamina",
        "value": 50
      },
    {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 20
      },
  ],
  after: { ids: ['vocal'] },
  chance: 0.5,
  cooldownActions: 4,
  weight: 20,
  text: '声乐课结束后，她清了好几次嗓子，声音有点发虚。“没事，可能是今天话说多了。”',
  choices: [
    {
      label: '让她今天别再唱了',
      effects: [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -8
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": 10
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
      ],
      result: '她抿了抿嘴，说“好吧”，但把谱子收得很慢。',
    },
    {
      label: '再试一次，确认一下',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "vocal",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 8
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -5
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1,
        "direction": "loss"
      },
      ],
      result: '她唱到高音时皱了一下眉，但还是唱完了。',
    },
    {
      label: '去买点润喉的',
      effects: [
        { kind: 'money', delta: -200 },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -5
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
      ],
      result: '她捧着热饮，说“太甜了”，但还是喝完了。',
    },
  ],
};

export default card;
