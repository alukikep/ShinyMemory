import type { EndingDef } from '../types';

/**
 * Order matters: the first matching ending wins.
 * Keep the bad ending first so high stress can override a high score.
 */
export const ENDINGS: EndingDef[] = [
  {
    id: 'end.bad',
    title: '过劳的代价',
    accent: 'bad',
    when: [
      {
        kind: 'any',
        of: [
          { kind: 'scoreAtMost', value: 54 },
          { kind: 'statAtLeast', stat: 'stress', value: 80 },
        ],
      },
    ],
    text: [
      '她还在笑。谢幕的时候，她笑得很标准，像练习过很多次。',
      '你站在侧幕，看见她下台时扶了一下墙。',
      '那一刻你才意识到，有些东西比分数更早地亮起了红灯。',
      '她回头看见你，还是笑了一下，说：“我没事。”',
    ].join('\n\n'),
  },
  {
    id: 'end.true',
    title: '闪耀的舞台',
    accent: 'true',
    when: [
      { kind: 'scoreAtLeast', value: 70 },
      { kind: 'statAtLeast', stat: 'trust', value: 14 },
      { kind: 'statAtMost', stat: 'stress', value: 40 },
    ],
    text: [
      '她站在舞台中央，灯光落在她肩上。',
      '你想起第一次见她时，她连自我介绍都说得磕磕绊绊。',
      '现在她抬起头，对着台下说：“谢谢你们，找到我。”',
      '你站在侧幕，忽然觉得这十二周很长，又很短。',
    ].join('\n\n'),
  },
  {
    id: 'end.normal',
    title: '平凡的日常',
    accent: 'normal',
    when: [{ kind: 'scoreAtLeast', value: 55 }],
    text: [
      'Live 结束了。没有奇迹，也没有遗憾。',
      '她卸了妆，抱着背包在门口等你，说：“去吃点什么吧。”',
      '你们走在夜里的街上，谁也没有提以后。',
      '路过便利店时，她停下来，挑了很久的饭团。',
    ].join('\n\n'),
  },
];
