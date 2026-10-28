import type { EventDef } from '../../../types';

const card: EventDef = {
  id: 'evt.rival',
  title: '竞争对手',
  when: [{ kind: 'dayAtLeast', day: 2 }],
  once: true,
  text: '另一个事务所的新人上了同一档节目。她在后台看了很久对方的彩排。',
  choices: [
    {
      label: '正面竞争',
      effects: [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 8
      },
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
      ],
      result: '她把自己的 part 又练了一遍。',
    },
    {
      label: '专注自己',
      effects: [
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
      ],
      result: '她关掉手机，说“不看就好了”。',
    },
    {
      label: '去打招呼',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 2
      },
      ],
      result: '她回来的时候，手里多了一颗糖。',
    },
  ],
};

export default card;
