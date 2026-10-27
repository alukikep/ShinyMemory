import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.office_desk',
  title: '桌上的台本',
  when: [{ kind: 'atLocation', locationId: 'office' }],
  after: { ids: ['look_around'] },
  once: true,
  weight: 30,
  text: '你回到事务所时，桌上多了一份没有署名的台本。封面只写着一个日期。',
  choices: [
    {
      label: '翻开看看',
      effects: [
        {
        "kind": "idolExp",
        "attribute": "expression",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 3
      },
      ],
      result: '是下一档节目的备选方案。旁边用铅笔写了一句：“她适合吗？”',
    },
    {
      label: '拿去问经纪人',
      effects: [
        {
        "kind": "idolExp",
        "attribute": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -2
      },
      ],
      result: '经纪人看了一眼，说：“先别让她知道。”',
    },
    {
      label: '放回原处',
      effects: [{
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 1
      }],
      result: '你把台本推到桌角，假装没看见。',
    },
  ],
};

export default card;
