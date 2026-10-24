import type { EventDef } from '../../../types';

const card: EventDef = {
  id: 'evt.vocal_strain',
  title: '嗓子的警告',
  when: [
    { kind: 'statAtMost', stat: 'stamina', value: 30 },
    { kind: 'statAtLeast', stat: 'stress', value: 50 },
  ],
  after: { ids: ['vocal'] },
  chance: 0.5,
  cooldownActions: 4,
  text: '声乐课结束后，她清了好几次嗓子，声音有点发虚。“没事，可能是今天话说多了。”',
  choices: [
    {
      label: '让她今天别再唱了',
      effects: [
        { kind: 'stat', stat: 'stress', delta: -8 },
        { kind: 'stat', stat: 'stamina', delta: 10 },
        { kind: 'stat', stat: 'trust', delta: 1 },
      ],
      result: '她抿了抿嘴，说“好吧”，但把谱子收得很慢。',
    },
    {
      label: '再试一次，确认一下',
      effects: [
        { kind: 'stat', stat: 'vocal', delta: 2 },
        { kind: 'stat', stat: 'stress', delta: 8 },
        { kind: 'stat', stat: 'stamina', delta: -5 },
        { kind: 'stat', stat: 'trust', delta: -1 },
      ],
      result: '她唱到高音时皱了一下眉，但还是唱完了。',
    },
    {
      label: '去买点润喉的',
      effects: [
        { kind: 'money', delta: -200 },
        { kind: 'stat', stat: 'stress', delta: -5 },
        { kind: 'stat', stat: 'trust', delta: 2 },
      ],
      result: '她捧着热饮，说“太甜了”，但还是喝完了。',
    },
  ],
};

export default card;
