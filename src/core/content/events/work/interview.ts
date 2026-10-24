import type { EventDef } from '../../../types';

const card: EventDef = {
  id: 'evt.interview',
  title: '杂志采访',
  when: [
    { kind: 'weekAtLeast', week: 5 },
    { kind: 'atLocation', locationId: 'studio' },
  ],
  after: { ids: ['work'] },
  once: true,
  text: '采访提纲上有一个问题：“你觉得自己最大的缺点是什么？”她看了很久。',
  choices: [
    {
      label: '让她自己回答',
      effects: [
        { kind: 'stat', stat: 'trust', delta: 2 },
        { kind: 'stat', stat: 'expression', delta: 2 },
        { kind: 'stat', stat: 'stress', delta: 5 },
      ],
      result: '她说“太容易放弃”，然后笑了一下。',
    },
    {
      label: '帮她换一个问题',
      effects: [
        { kind: 'stat', stat: 'trust', delta: -1 },
        { kind: 'stat', stat: 'stress', delta: -3 },
      ],
      result: '她没说什么，但采访结束后问你为什么。',
    },
    {
      label: '提前对一遍答案',
      effects: [
        { kind: 'stat', stat: 'expression', delta: 3 },
        { kind: 'stat', stat: 'stress', delta: 3 },
        { kind: 'stat', stat: 'trust', delta: 1 },
      ],
      result: '她照着你写的说了，听起来很标准。',
    },
  ],
};

export default card;
