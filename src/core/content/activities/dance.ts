import type { ActivityDef } from '../../types';

const EXP = (tier: 2 | 3 | 4 | 5) =>
  ({ kind: 'attributeExp', ref: 'dance', tier }) as const;

const card: ActivityDef = {
  id: 'dance',
  name: '舞蹈课',
  description: '初级课程：同一个转身，练到不用想为止。',
  kind: 'training',
  locations: ['practice_room'],
  durationMinutes: 60,
  timeWindows: [{ fromMinute: 480, toMinute: 1200 }],
  cost: { money: 150, stamina: 15 },
  effects: [EXP(2), { kind: 'sharedStat', stat: 'stress', delta: 6 }],
  resultTexts: [
    '她数着拍子，把同一个转身重复了十几遍。',
    '镜子里的动作终于和音乐对上了。她停下来，喘了口气。',
    '她扶着把杆，脚尖在地板上点了两下，像是在确认节奏。',
  ],
  resultVariants: [
    {
      when: [{ kind: 'sharedStatAtLeast', stat: 'stress', value: 70 }],
      text: '她的动作开始慢半拍，停下来之后，盯着镜子里的自己看了很久。',
    },
    {
      when: [{ kind: 'sharedStatAtMost', stat: 'stamina', value: 30 }],
      text: '最后一个八拍，她几乎是咬着牙做完的。',
    },
  ],
  levels: [
    {
      level: 1,
      requires: [{ kind: 'varAtLeast', key: 'facility.dance', value: 1 }],
      name: '中级舞蹈课',
      description: '动作开始接成句子，不再是一个一个拆开练。',
      durationMinutes: 50,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(3), { kind: 'sharedStat', stat: 'stress', delta: 6 }],
      resultTexts: [
        '她把两个八拍连起来，第一次没有在转身处停顿。',
        '老师让她闭着眼睛跳一遍，她真的照做了。',
        '她开始注意手的位置，而不是只盯着脚。',
      ],
    },
    {
      level: 2,
      requires: [{ kind: 'varAtLeast', key: 'facility.dance', value: 2 }],
      name: '高级舞蹈课',
      description: '速度、重心和呼吸，全都要对。',
      durationMinutes: 40,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(4), { kind: 'sharedStat', stat: 'stress', delta: 6 }],
      resultTexts: [
        '音乐加速之后，她反而慢了下来，把每个重心都踩稳。',
        '她对着镜子跳完，回头问：“刚才那个角度，好看吗？”',
        '最后一个动作收得很轻，她自己也愣了一下。',
      ],
    },
    {
      level: 3,
      requires: [{ kind: 'varAtLeast', key: 'facility.dance', value: 3 }],
      name: '顶级舞蹈课',
      description: '不用再数拍子，身体自己知道下一步。',
      durationMinutes: 30,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(5), { kind: 'sharedStat', stat: 'stress', delta: 6 }],
      resultTexts: [
        '她没有等音乐，先动了起来，音乐进来的时候刚好合上。',
        '一遍跳完，她站在镜子前没说话，只是笑了一下。',
        '老师关掉音乐，她还在跳，像没听见一样。',
      ],
    },
  ],
};

export default card;
