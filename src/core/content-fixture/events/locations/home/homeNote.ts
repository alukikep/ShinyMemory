import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.home_note',
  title: '冰箱上的便签',
  when: [{ kind: 'atLocation', locationId: 'home' }],
  after: { ids: ['look_around'] },
  once: true,
  weight: 30,
  text: '冰箱上贴着一张便签，写着“记得买鸡蛋”。旁边是她列的训练计划。',
  choices: [
    {
      label: '帮她买回来',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -3
      },
      ],
      result: '你拎着鸡蛋回来时，她已经趴在桌上睡着了。',
    },
    {
      label: '念给她听',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -2
      },
      ],
      result: '她愣了一下，然后笑了：“我昨天写的，忘了。”',
    },
    {
      label: '当作没看见',
      effects: [{
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 1
      }],
      result: '便签继续贴在冰箱上，鸡蛋始终没买。',
    },
  ],
};

export default card;
