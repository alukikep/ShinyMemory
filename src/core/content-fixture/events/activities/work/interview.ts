import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.interview',
  title: '杂志采访',
  when: [
    { kind: 'dayAtLeast', day: 1 },
    { kind: 'timeWindow', fromMinute: 10 * 60, toMinute: 22 * 60 },
  ],
  after: { ids: ['work'] },
  once: true,
  text: '采访提纲上有一个问题：“你觉得自己最大的缺点是什么？”她看了很久。',
  choices: [
    {
      label: '让她自己回答',
      durationMinutes: 60,
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "attributeExp",
        "ref": "expression",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 5
      },
      ],
      result: '她说“太容易放弃”，然后笑了一下。',
    },
    {
      label: '帮她换一个问题',
      durationMinutes: 60,
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1,
        "direction": "loss"
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -3
      },
      ],
      result: '她没说什么，但采访结束后问你为什么。',
    },
    {
      label: '提前对一遍答案',
      durationMinutes: 60,
      effects: [
        {
        "kind": "attributeExp",
        "ref": "expression",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 3
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
      ],
      result: '她照着你写的说了，听起来很标准。',
    },
  ],
};

export default card;
