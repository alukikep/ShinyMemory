import type { EventDef } from '../../../../types';

const card: EventDef = {
  id: 'evt.hazuki_nap',
  title: '沙发后面的午睡',
  when: [
    { kind: 'atLocation', locationId: 'office' },
    { kind: 'timeWindow', fromMinute: 12 * 60, toMinute: 14 * 60 },
    { kind: 'npcAffinityAtLeast', actorId: 'hazuki', value: 1 },
  ],
  afterNpc: { ids: ['hazuki'] },
  once: true,
  chance: 1,
  weight: 10,
  text: '你回到事务所时，叶月正躺在沙发后面，眼罩歪到一边。',
  choices: [
    {
      label: '帮她盖外套',
      effects: [
        { kind: 'actorAffinity', actorId: 'hazuki', delta: 1 },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -2
      },
      ],
      result: '她没有醒，只是把外套往上拉了拉。',
    },
    {
      label: '叫醒她',
      effects: [
        { kind: 'actorAffinity', actorId: 'hazuki', delta: -1 },
        { kind: 'log', text: '她迷迷糊糊地坐起来，先看了一眼时间。' },
      ],
      result: '“唔……几点了？……谢谢。”她揉着眼睛去倒咖啡。',
    },
    {
      label: '假装没看见',
      effects: [],
      result: '你轻手轻脚地绕过去，让她继续睡。',
    },
  ],
};

export default card;
