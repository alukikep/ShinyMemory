import type { ActivityDef } from '../../types';

const EXP = (tier: 2 | 3 | 4 | 5) =>
  ({ kind: 'attributeExp', ref: 'vocal', tier }) as const;

const card: ActivityDef = {
  id: 'vocal',
  name: '声乐课',
  description: '初级课程：气息、音准、把一句歌唱完整。',
  kind: 'training',
  locations: ['practice_room'],
  durationMinutes: 60,
  timeWindows: [{ fromMinute: 480, toMinute: 1200 }],
  cost: { money: 150, stamina: 15 },
  effects: [EXP(2), { kind: 'sharedStat', stat: 'stress', delta: 5 }],
  resultTexts: [
    '她跟着钢琴重复同一句，第三次终于准了。',
    '她唱完，自己先笑了一下，说“这次好像还行”。',
    '她把手放在腹部，试着找气息落下去的位置。',
  ],
  resultVariants: [
    {
      when: [{ kind: 'sharedStatAtLeast', stat: 'stress', value: 70 }],
      text: '她唱到一半停下来，说“再来一次”，但声音已经有点哑。',
    },
    {
      when: [{ kind: 'sharedStatAtMost', stat: 'stamina', value: 30 }],
      text: '她靠在墙边，气息不太稳，但还是把整段唱完了。',
    },
  ],
  levels: [
    {
      level: 1,
      requires: [{ kind: 'varAtLeast', key: 'facility.vocal', value: 1 }],
      name: '中级声乐课',
      description: '更长的乐句，更细的气息控制。',
      durationMinutes: 50,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(3), { kind: 'sharedStat', stat: 'stress', delta: 5 }],
      resultTexts: [
        '老师把谱子翻到下一页，她深吸一口气，把整段接了下来。',
        '她开始注意句尾怎么收，而不是只把音唱准。',
        '同一段唱完，她自己要求再来一遍，这次把声音放轻了。',
      ],
    },
    {
      level: 2,
      requires: [{ kind: 'varAtLeast', key: 'facility.vocal', value: 2 }],
      name: '高级声乐课',
      description: '录音级的细节：换气、咬字、情绪的落点。',
      durationMinutes: 40,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(4), { kind: 'sharedStat', stat: 'stress', delta: 5 }],
      resultTexts: [
        '她戴着耳机听回放，在一句尾音上停了很久。',
        '老师没有打断她，等她唱完才说：“这次是你自己的声音。”',
        '她把同一句换了三种处理，最后选了自己最不习惯的那种。',
      ],
    },
    {
      level: 3,
      requires: [{ kind: 'varAtLeast', key: 'facility.vocal', value: 3 }],
      name: '顶级声乐课',
      description: '不用再想技巧，只剩表达。',
      durationMinutes: 30,
      cost: { money: 150, stamina: 15 },
      effects: [EXP(5), { kind: 'sharedStat', stat: 'stress', delta: 5 }],
      resultTexts: [
        '她唱完最后一句，录音室里安静了两秒，老师才按下停止键。',
        '她没有看谱，也没有看老师，只看着玻璃后面的你。',
        '这一次她一次就过了，自己却要求再录一条更轻的。',
      ],
    },
  ],
};

export default card;
