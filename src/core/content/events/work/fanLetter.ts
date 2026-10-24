import type { EventDef } from '../../../types';

const card: EventDef = {
  id: 'evt.fan_letter',
  title: '粉丝来信',
  when: [{ kind: 'weekAtLeast', week: 4 }],
  after: { ids: ['work'] },
  chance: 0.7,
  cooldownActions: 6,
  text: '事务所转来一封信。信封上画着一个歪歪扭扭的星星。',
  choices: [
    {
      label: '读给她听',
      effects: [
        { kind: 'stat', stat: 'trust', delta: 2 },
        { kind: 'stat', stat: 'stress', delta: -5 },
      ],
      result: '她听到一半，把脸埋进靠垫里。',
    },
    {
      label: '让她自己看',
      effects: [
        { kind: 'stat', stat: 'trust', delta: 1 },
        { kind: 'stat', stat: 'stress', delta: -2 },
      ],
      result: '她看完，把信折好放进包里。',
    },
    {
      label: '先收起来，等 Live 后再说',
      effects: [{ kind: 'stat', stat: 'stress', delta: 2 }],
      result: '她点了点头，但之后看了好几次那个抽屉。',
    },
  ],
};

export default card;
