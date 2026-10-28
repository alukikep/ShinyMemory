import type { EventDef } from '../../../types';

const card: EventDef = {
  id: 'evt.escape',
  title: '逃走的下午',
  when: [
    {
        "kind": "sharedStatAtLeast",
        "stat": "stress",
        "value": 45
      },
    { kind: 'atLocation', locationId: 'practice_room' },
    { kind: 'timeWindow', fromMinute: 8 * 60, toMinute: 20 * 60 },
  ],
  chance: 0.4,
  cooldownActions: 3,
  text: '练习开始前，她发来一条消息：“我今天可以请假吗？” 你打过去，她没有接。',
  choices: [
    {
      label: '去找她',
      effects: [
        {
        "kind": "sharedStat",
        "stat": "stamina",
        "delta": -10
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3
      },
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -8
      },
      ],
      result: '她在天台，抱着膝盖，看到你时没有惊讶。',
    },
    {
      label: '让她休息一天',
      effects: [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": -12
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 1
      },
      ],
      result: '她回了一个“谢谢”，之后一整天都没有消息。',
    },
    {
      label: '告诉她今天必须来',
      effects: [
        {
        "kind": "sharedStat",
        "stat": "stress",
        "delta": 10
      },
        {
        "kind": "attributeExp",
        "ref": "trust",
        "tier": 3,
        "direction": "loss"
      },
      ],
      result: '她来了，但一句话也没说。',
    },
  ],
};

export default card;
