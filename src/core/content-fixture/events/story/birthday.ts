import type { EventDef } from '../../../types';

const card: EventDef = {
  id: 'evt.birthday',
  title: '生日',
  when: [{ kind: 'dayAtLeast', day: 2 }],
  once: true,
  text: '日程表上写着今天是她的生日。她本人一次也没提。',
  choices: [
    {
      label: '准备一个小蛋糕',
      effects: [
        { kind: 'money', delta: -500 },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -8
      },
      ],
      result: '她盯着蛋糕看了很久，说“我很久没过生日了”。',
    },
    {
      label: '说一句生日快乐',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -2
      },
      ],
      result: '她愣了一下，说“谢谢”，然后继续练习。',
    },
    {
      label: '装作不知道',
      effects: [{
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3,
        "direction": "loss"
      }],
      result: '那天她走得比平时早。',
    },
  ],
};

export default card;
