import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.studio_headphones',
  title: '调音台上的耳机',
  when: [{ kind: 'atLocation', locationId: 'studio' }],
  after: { ids: ['look_around'] },
  once: true,
  weight: 30,
  text: '录音棚的调音台上放着一副耳机，里面还在放一首没听过的 demo。',
  choices: [
    {
      label: '听完',
      effects: [
        {
        "kind": "idolExp",
        "attribute": "expression",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -2
      },
      ],
      result: '副歌有一句和声，像是她之前哼过的。',
    },
    {
      label: '叫录音师来问',
      effects: [
        {
        "kind": "idolExp",
        "attribute": "expression",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 1
      },
      ],
      result: '录音师说，那是一个没选上的候选曲。',
    },
    {
      label: '关掉',
      effects: [{
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -1
      }],
      result: '你把耳机放回原处，demo 还在继续。',
    },
  ],
};

export default card;
