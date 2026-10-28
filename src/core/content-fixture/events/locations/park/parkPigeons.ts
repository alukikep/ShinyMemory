import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.park_pigeons',
  title: '公园的鸽子',
  when: [{ kind: 'atLocation', locationId: 'park' }],
  after: { ids: ['look_around'] },
  once: true,
  weight: 20,
  text: '长椅旁的鸽子一点也不怕人。你坐下来，它们反而围得更近了。',
  choices: [
    {
      label: '把面包分给它们',
      effects: [
        { kind: 'sharedStat', stat: 'stress', delta: -3 },
      ],
      result: '鸽子一拥而上。你忽然觉得，今天可以先不急着赶路。',
    },
    {
      label: '坐着看喷泉',
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 1 },
        { kind: 'sharedStat', stat: 'stress', delta: -1 },
      ],
      result: '水声盖过了远处的车流。你想起她说过，休息也是训练的一部分。',
    },
  ],
};

export default card;
