import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.producer_doubt',
  title: '制作人的怀疑',
  when: [
    { kind: 'weekAtLeast', week: 8 },
    { kind: 'atLocation', locationId: 'office' },
  ],
  once: true,
  text: '事务所的人问你：“你真的觉得她能走到那一步吗？” 你想起她今天早上练习时的样子。',
  choices: [
    {
      label: '说当然',
      effects: [
        { kind: 'stat', stat: 'trust', delta: 1 },
        { kind: 'stat', stat: 'stress', delta: 3 },
      ],
      result: '你说得很肯定，自己却有点不确定。',
    },
    {
      label: '说需要时间',
      effects: [
        { kind: 'stat', stat: 'trust', delta: 2 },
        { kind: 'stat', stat: 'stress', delta: -2 },
      ],
      result: '对方点了点头，说“那你最好别浪费时间”。',
    },
    {
      label: '反问对方',
      effects: [{ kind: 'stat', stat: 'stress', delta: 5 }],
      result: '会议室安静了几秒。',
    },
  ],
};

export default card;
