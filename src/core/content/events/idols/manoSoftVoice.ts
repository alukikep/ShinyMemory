import type { EventDef } from '../../../types';

const event: EventDef = {
  id: 'evt.mano_soft_voice',
  title: '声音的余韵',
  when: [],
  after: { ids: ['vocal'] },
  afterIdol: { ids: ['mano'] },
  chance: 0.35,
  once: true,
  priority: 5,
  text: '声乐课结束后，真乃还站在钢琴边，小声重复着刚才那一句。',
  choices: [
    {
      label: '再陪她练一遍',
      hint: '真乃 +歌唱、+信任，共享体力 -5',
      effects: [
        {
        "kind": "idolExp",
        "attribute": "vocal",
        "tier": 3
      },
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -5
      },
      ],
      result: '她又唱了一遍。这次没有看谱，声音比刚才更稳。',
    },
    {
      label: '让她早点休息',
      hint: '真乃 +信任，共享压力 -5',
      effects: [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -5
      },
      ],
      result: '真乃点点头，把谱子收好。她说，明天会记得这个音。',
    },
  ],
};

export default event;
