import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.producer_doubt',
  title: '制作人的怀疑',
  when: [
    { kind: 'dayAtLeast', day: 2 },
    { kind: 'atLocation', locationId: 'office' },
    { kind: 'timeWindow', fromMinute: 10 * 60, toMinute: 18 * 60 },
  ],
  once: true,
  text: '事务所的人问你：“你真的觉得她能走到那一步吗？” 你想起她今天早上练习时的样子。',
  choices: [
    {
      label: '说当然',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 3
      },
      ],
      result: '你说得很肯定，自己却有点不确定。',
    },
    {
      label: '说需要时间',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -2
      },
      ],
      result: '对方点了点头，说“那你最好别浪费时间”。',
    },
    {
      label: '反问对方',
      effects: [{
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 5
      }],
      result: '会议室安静了几秒。',
    },
  ],
};

export default card;
