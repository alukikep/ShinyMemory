import type { EventDef } from '../../../types';

const event: EventDef = {
  id: 'evt.tv_failure_aftermath',
  title: '回到事务所',
  entry: { kind: 'chain' },
  when: [],
  text: '回到事务所后，灯织在门口停了一下，才把外套挂好。',
  choices: [
    {
      label: '先不提工作的事',
      hint: '共享压力 -5',
      effects: [{ kind: 'sharedStat', stat: 'stress', delta: -5 }],
      result: '她没有追问。过了一会儿，才小声说：“下次不会这样了。”',
    },
    {
      label: '把问题说清楚',
      hint: '目标偶像信任 EXP +1，共享压力 +3',
      effects: [
        { kind: 'idolExp', attribute: 'trust', tier: 1 },
        { kind: 'sharedStat', stat: 'stress', delta: 3 },
      ],
      result: '她认真听完，点了点头。那晚她留下来多练了一会儿。',
    },
  ],
};

export default event;
