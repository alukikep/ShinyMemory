import type { EventDef } from '../../../types';

const event: EventDef = {
  id: 'evt.tv_success',
  title: '深夜之后',
  entry: {
    kind: 'workOutcome',
    activityId: 'tv_work',
    outcome: 'success',
  },
  when: [],
  nextEventId: 'evt.tv_afterglow',
  text: '深夜综艺顺利收工。灯织在后台坐下，半天没有动。',
  choices: [
    {
      label: '陪她复盘',
      hint: '目标偶像信任 EXP +3，共享压力 +3',
      effects: [
        { kind: 'attributeExp', ref: 'trust', tier: 3 },
        { kind: 'sharedStat', stat: 'stress', delta: 3 },
      ],
      result: '她把刚才的每个反应都重新说了一遍，说到最后自己笑了。',
    },
    {
      label: '让她先休息',
      hint: '共享压力 -5',
      effects: [{ kind: 'sharedStat', stat: 'stress', delta: -5 }],
      result: '她靠着椅背闭上眼。几分钟后，呼吸就慢了下来。',
    },
  ],
};

export default event;
