import type { EventDef } from '../../../types';

const event: EventDef = {
  id: 'evt.hiori_extra_step',
  title: '多出来的一步',
  when: [],
  after: { ids: ['dance'] },
  afterIdol: { ids: ['hiori'] },
  chance: 0.35,
  once: true,
  priority: 5,
  text: '灯织对着镜子又跳了一遍，停下来时轻轻皱眉，像是抓住了什么。',
  choices: [
    {
      label: '指出脚步的问题',
      hint: '灯织 +舞蹈、+信任，共享压力 +3',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "dance",
        "tier": 3
      },
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
      result: '她照着你的话重做了一次，脚步终于落在拍子上。',
    },
    {
      label: '先让她喘口气',
      hint: '灯织 +信任，共享压力 -5',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -5
      },
      ],
      result: '灯织接过水，沉默了一会儿，说下次会跳得更好。',
    },
  ],
};

export default event;
