import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.practice_note',
  title: '镜子上的便签',
  when: [{ kind: 'atLocation', locationId: 'practice_room' }],
  after: { ids: ['look_around'] },
  once: true,
  weight: 30,
  text: '练习室的镜子上贴着一张便签，字迹被水汽晕开了一点。',
  choices: [
    {
      label: '读出来',
      effects: [
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -3
      },
      ],
      result: '上面写着“今天也要笑”。她站在门口，没进来。',
    },
    {
      label: '撕下来收好',
      effects: [{
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      }],
      result: '你把便签夹进台本里。',
    },
    {
      label: '留在原处',
      effects: [{
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 1
      }],
      result: '你们谁也没有提那张便签。',
    },
  ],
};

export default card;
