import type { ActivityDef } from '../../types';

const EXP = (tier: 2 | 3 | 4 | 5) =>
  ({ kind: 'attributeExp', ref: 'expression', tier }) as const;

const card: ActivityDef = {
  id: 'expression',
  name: '表现课',
  description: '初级课程：镜头、眼神、把一句话说进别人心里。',
  kind: 'training',
  locations: ['practice_room'],
  durationMinutes: 60,
  timeWindows: [{ fromMinute: 480, toMinute: 1200 }],
  cost: { money: 150, stamina: 15 },
  effects: [EXP(2), { kind: 'sharedStat', stat: 'stress', delta: 4 }],
  resultTexts: [
    '她对着镜头说了一句很普通的问候，却让人想再看一遍。',
    '老师让她把同一句话用三种语气说。她选了最轻的那种。',
    '她试着不看镜头，只看着镜头后面的你。',
  ],
  resultVariants: [
    {
      when: [{ kind: 'sharedStatAtLeast', stat: 'stress', value: 70 }],
      text: '她笑着说完那段话，导演喊卡之后，笑容立刻掉了下来。',
    },
  ],
  levels: [
    {
      level: 1,
      requires: [{ kind: 'varAtLeast', key: 'facility.expression', value: 1 }],
      name: '中级表现课',
      description: '同一句话，换三种对象说。',
      durationMinutes: 50,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(3), { kind: 'sharedStat', stat: 'stress', delta: 4 }],
      resultTexts: [
        '她先对镜头说，再对老师说，最后对你说，三遍都不一样。',
        '老师把回放倒回去，让她自己听哪一遍最像她。',
        '她试着把一句话说得更慢，反而更有分量。',
      ],
    },
    {
      level: 2,
      requires: [{ kind: 'varAtLeast', key: 'facility.expression', value: 2 }],
      name: '高级表现课',
      description: '收住表情，让沉默也说话。',
      durationMinutes: 40,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(4), { kind: 'sharedStat', stat: 'stress', delta: 4 }],
      resultTexts: [
        '她听完要求，没有立刻演，先安静了几秒。',
        '镜头推近的时候，她没有躲，也没有刻意看回去。',
        '老师没有喊卡，让她把那段沉默走完。',
      ],
    },
    {
      level: 3,
      requires: [{ kind: 'varAtLeast', key: 'facility.expression', value: 3 }],
      name: '顶级表现课',
      description: '镜头在不在，你都在她眼睛里。',
      durationMinutes: 30,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(5), { kind: 'sharedStat', stat: 'stress', delta: 4 }],
      resultTexts: [
        '她只说了一句话，现场没有人接话。',
        '回放播完，老师先看向你，才说：“这条留着。”',
        '她收工前又看了一遍监视器，然后轻轻点了下头。',
      ],
    },
  ],
};

export default card;
