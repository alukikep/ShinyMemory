import type { ActivityDef } from '../types';

export const ACTIVITIES: ActivityDef[] = [
  {
    id: 'vocal',
    name: '声乐课',
    description: '气息、音准、把一句歌唱完整。',
    kind: 'training',
    cost: { money: 500, stamina: 15 },
    effects: [
      { kind: 'stat', stat: 'vocal', delta: 6 },
      { kind: 'stat', stat: 'stress', delta: 8 },
    ],
    resultTexts: [
      '她跟着钢琴重复同一句，第三次终于准了。',
      '她唱完，自己先笑了一下，说“这次好像还行”。',
      '她把手放在腹部，试着找气息落下去的位置。',
    ],
    resultVariants: [
      {
        when: [{ kind: 'statAtLeast', stat: 'stress', value: 70 }],
        text: '她唱到一半停下来，说“再来一次”，但声音已经有点哑。',
      },
      {
        when: [{ kind: 'statAtMost', stat: 'stamina', value: 30 }],
        text: '她靠在墙边，气息不太稳，但还是把整段唱完了。',
      },
    ],
  },
  {
    id: 'dance',
    name: '舞蹈课',
    description: '同一个转身，练到不用想为止。',
    kind: 'training',
    cost: { money: 500, stamina: 18 },
    effects: [
      { kind: 'stat', stat: 'dance', delta: 6 },
      { kind: 'stat', stat: 'stress', delta: 10 },
    ],
    resultTexts: [
      '她数着拍子，把同一个转身重复了十几遍。',
      '镜子里的动作终于和音乐对上了。她停下来，喘了口气。',
      '她扶着把杆，脚尖在地板上点了两下，像是在确认节奏。',
    ],
    resultVariants: [
      {
        when: [{ kind: 'statAtLeast', stat: 'stress', value: 70 }],
        text: '她的动作开始慢半拍，停下来之后，盯着镜子里的自己看了很久。',
      },
      {
        when: [{ kind: 'statAtMost', stat: 'stamina', value: 30 }],
        text: '最后一个八拍，她几乎是咬着牙做完的。',
      },
    ],
  },
  {
    id: 'expression',
    name: '表现课',
    description: '镜头、眼神、把一句话说进别人心里。',
    kind: 'training',
    cost: { money: 500, stamina: 12 },
    effects: [
      { kind: 'stat', stat: 'expression', delta: 6 },
      { kind: 'stat', stat: 'stress', delta: 7 },
    ],
    resultTexts: [
      '她对着镜头说了一句很普通的问候，却让人想再看一遍。',
      '老师让她把同一句话用三种语气说。她选了最轻的那种。',
      '她试着不看镜头，只看着镜头后面的你。',
    ],
    resultVariants: [
      {
        when: [{ kind: 'statAtLeast', stat: 'stress', value: 70 }],
        text: '她笑着说完那段话，导演喊卡之后，笑容立刻掉了下来。',
      },
    ],
  },
  {
    id: 'work',
    name: '节目收录',
    description: '有钱，有曝光，也有半夜回家的电车。',
    kind: 'work',
    cost: { stamina: 20 },
    effects: [
      { kind: 'money', delta: 1500 },
      { kind: 'stat', stat: 'stress', delta: 14 },
    ],
    resultTexts: [
      '录制比预想中顺利。她在休息间隙偷偷打了个哈欠。',
      '工作人员夸她“比想象中稳”。她鞠躬的时候，耳朵有点红。',
      '收工时已经过了十点。她在回程的车上睡着了。',
    ],
    resultVariants: [
      {
        when: [{ kind: 'statAtLeast', stat: 'stress', value: 70 }],
        text: '她在镜头前笑得很标准。只有你知道，她今天几乎没怎么吃东西。',
      },
    ],
  },
  {
    id: 'rest',
    name: '休息',
    description: '什么都不做，也是一种安排。',
    kind: 'rest',
    cost: {},
    effects: [
      { kind: 'stat', stat: 'stamina', delta: 30 },
      { kind: 'stat', stat: 'stress', delta: -20 },
      { kind: 'flag', key: 'forced_rest', value: false },
    ],
    resultTexts: [
      '她在沙发上睡着了，呼吸声很轻。',
      '你们没说几句话。她把外套盖在腿上，看着窗外发了一会儿呆。',
      '她抱着靠垫，难得没有提练习的事。',
    ],
    resultVariants: [
      {
        when: [{ kind: 'statAtLeast', stat: 'stress', value: 80 }],
        text: '她几乎是一坐下就睡着了。你替她把灯调暗了一点。',
      },
    ],
  },
  {
    id: 'free',
    name: '自由时间',
    description: '不训练，也不工作。只是待在一起。',
    kind: 'bond',
    cost: { stamina: 10 },
    effects: [
      { kind: 'stat', stat: 'trust', delta: 2 },
      { kind: 'stat', stat: 'stress', delta: -10 },
      { kind: 'stat', stat: 'stamina', delta: 5 },
    ],
    resultTexts: [
      '你们在便利店门口分了一盒关东煮。她挑了最便宜的那个。',
      '她说了很多不着边际的话，最后自己先笑了。',
      '你们沿着车站前的路走了一段，谁也没有提下周的安排。',
    ],
    resultVariants: [
      {
        when: [{ kind: 'statAtLeast', stat: 'trust', value: 12 }],
        text: '她开始主动跟你说些无关紧要的事。比如今天早上梦见什么，比如她其实不太喜欢甜的。',
      },
      {
        when: [{ kind: 'statAtMost', stat: 'stamina', value: 25 }],
        text: '她没什么精神，但还是陪你走了一段。回去的路上，她走得很慢。',
      },
    ],
  },
];
