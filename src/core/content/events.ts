import type { EventDef } from '../types';

export const EVENTS: EventDef[] = [
  {
    id: 'evt.night_practice',
    title: '深夜的练习室',
    when: [
      { kind: 'weekAtLeast', week: 2 },
      { kind: 'statAtLeast', stat: 'stress', value: 40 },
    ],
    once: true,
    weight: 10,
    text: '晚上十点，练习室的灯还亮着。她对着镜子，一遍一遍地重复同一个转身。',
    choices: [
      {
        label: '陪她练一会儿',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 2 },
          { kind: 'stat', stat: 'stamina', delta: -10 },
          { kind: 'stat', stat: 'stress', delta: -5 },
        ],
        result: '她没说话，但把音乐的拍子调慢了一点。',
      },
      {
        label: '劝她回去休息',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -10 },
          { kind: 'stat', stat: 'trust', delta: -1 },
        ],
        result: '她关了灯，但在门口站了很久。',
      },
      {
        label: '什么也不说，先走',
        effects: [{ kind: 'stat', stat: 'stress', delta: 3 }],
        result: '你听见身后又响起了音乐。',
      },
    ],
  },
  {
    id: 'evt.bento',
    title: '便当',
    when: [
      { kind: 'weekAtLeast', week: 3 },
      { kind: 'statAtLeast', stat: 'trust', value: 8 },
    ],
    once: true,
    weight: 10,
    text: '午休时，她把一个歪歪扭扭的便当盒推到你面前。“……做多了。”',
    choices: [
      {
        label: '收下，认真吃完',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 2 },
          { kind: 'stat', stat: 'stamina', delta: 10 },
        ],
        result: '她假装在看手机，耳朵却红了。',
      },
      {
        label: '说已经吃过了',
        effects: [{ kind: 'stat', stat: 'trust', delta: -1 }],
        result: '她把便当盒收回去，动作比平时快。',
      },
      {
        label: '分她一半',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 1 },
          { kind: 'stat', stat: 'stress', delta: -3 },
        ],
        result: '你们在练习室的地板上吃完了那份便当。',
      },
    ],
  },
  {
    id: 'evt.rain',
    title: '雨天',
    when: [{ kind: 'weekAtLeast', week: 4 }],
    once: true,
    weight: 10,
    text: '傍晚突然下起雨。她站在校门口，看着没有停的意思的雨，把书包抱在怀里。',
    choices: [
      {
        label: '把伞给她，自己跑回去',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 2 },
          { kind: 'stat', stat: 'stamina', delta: -10 },
        ],
        result: '第二天她把伞还给你，伞柄上缠了一圈新的胶带。',
      },
      {
        label: '叫车送她回家',
        effects: [
          { kind: 'money', delta: -500 },
          { kind: 'stat', stat: 'trust', delta: 1 },
        ],
        result: '车开走前，她摇下车窗说了句“明天见”。',
      },
      {
        label: '一起等雨停',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -3 },
          { kind: 'stat', stat: 'trust', delta: 1 },
          { kind: 'stat', stat: 'stamina', delta: -5 },
        ],
        result: '雨停了，你们谁也没提刚才那半小时。',
      },
    ],
  },
  {
    id: 'evt.her_past',
    title: '她的过去',
    when: [
      { kind: 'weekAtLeast', week: 5 },
      { kind: 'statAtLeast', stat: 'trust', value: 10 },
    ],
    once: true,
    weight: 10,
    text: '她说起以前的事。说到一半，她停下来，像是在等你决定要不要继续听。',
    choices: [
      {
        label: '安静地听她说完',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: -5 },
        ],
        result: '她说完，长长地呼了一口气，说“好像也没那么重了”。',
      },
      {
        label: '转移话题',
        effects: [{ kind: 'stat', stat: 'trust', delta: -1 }],
        result: '她笑了一下，说“也是，没什么好说的”。',
      },
      {
        label: '告诉她你自己的事',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: -4 },
        ],
        result: '她听得很认真，中途一次也没有打断你。',
      },
    ],
  },
  {
    id: 'evt.insomnia',
    title: '凌晨一点',
    when: [{ kind: 'statAtLeast', stat: 'stress', value: 60 }],
    once: false,
    weight: 8,
    text: '凌晨一点，她发来一条消息：“睡了吗？” 过了几秒，又补了一句：“没事。”',
    choices: [
      {
        label: '陪她聊到睡着',
        effects: [
          { kind: 'stat', stat: 'stamina', delta: -10 },
          { kind: 'stat', stat: 'stress', delta: -8 },
          { kind: 'stat', stat: 'trust', delta: 1 },
        ],
        result: '她最后一条消息是“晚安”，后面跟了一个很笨的颜文字。',
      },
      {
        label: '让她数羊',
        effects: [{ kind: 'stat', stat: 'stress', delta: -2 }],
        result: '她回了个“好”，你也不知道她有没有真的数。',
      },
      {
        label: '第二天再问',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 2 },
          { kind: 'stat', stat: 'trust', delta: -1 },
        ],
        result: '第二天她看起来没事，但你注意到她眼下有点青。',
      },
    ],
  },
  {
    id: 'evt.cold',
    title: '鼻音',
    when: [{ kind: 'statAtMost', stat: 'stamina', value: 30 }],
    once: true,
    weight: 20,
    text: '她说话带着鼻音，练习到一半停下来咳了几声。“没事，最近有点干。”',
    choices: [
      {
        label: '让她今天休息',
        effects: [
          { kind: 'stat', stat: 'stamina', delta: 20 },
          { kind: 'stat', stat: 'stress', delta: -10 },
          { kind: 'stat', stat: 'trust', delta: 1 },
          { kind: 'flag', key: 'forced_rest', value: true },
        ],
        result: '她裹着外套在沙发上睡着了，呼吸声很轻。',
      },
      {
        label: '再坚持一下',
        effects: [
          { kind: 'stat', stat: 'stamina', delta: -10 },
          { kind: 'stat', stat: 'stress', delta: 10 },
          { kind: 'stat', stat: 'trust', delta: -2 },
        ],
        result: '她点点头，但下一句歌词没有唱上去。',
      },
      {
        label: '去医院',
        effects: [
          { kind: 'money', delta: -800 },
          { kind: 'stat', stat: 'stamina', delta: 30 },
          { kind: 'stat', stat: 'stress', delta: -5 },
        ],
        result: '医生说只是感冒，她一路上都在说“太夸张了”。',
      },
    ],
  },
  {
    id: 'evt.tv_offer',
    title: '临时通告',
    when: [
      { kind: 'weekAtLeast', week: 3 },
      { kind: 'moneyAtMost', value: 2000 },
    ],
    once: true,
    weight: 10,
    text: '事务所临时塞来一个深夜综艺的通告。钱不少，但明天一早还有课。',
    choices: [
      {
        label: '接下',
        effects: [
          { kind: 'money', delta: 1800 },
          { kind: 'stat', stat: 'stress', delta: 15 },
          { kind: 'stat', stat: 'stamina', delta: -15 },
        ],
        result: '录制结束时已经过了零点。她在车上睡着了。',
      },
      {
        label: '拒绝',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -3 },
          { kind: 'stat', stat: 'trust', delta: 1 },
        ],
        result: '她听说你推掉了，愣了一下，说“其实我可以的”。',
      },
      {
        label: '问她自己的意思',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 2 },
        ],
        result: '她想了很久，说“我想试试”。',
      },
    ],
  },
  {
    id: 'evt.online_comment',
    title: '评论区',
    when: [
      { kind: 'weekAtLeast', week: 6 },
      { kind: 'statAtLeast', stat: 'stress', value: 40 },
    ],
    once: true,
    weight: 10,
    text: '你在网上看到一条评论，说她“没什么存在感”。她正好从你身后经过。',
    choices: [
      {
        label: '关掉页面，装作没看见',
        effects: [{ kind: 'stat', stat: 'stress', delta: 2 }],
        result: '她什么也没问，但那天话比平时少。',
      },
      {
        label: '告诉她别在意',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 1 },
          { kind: 'stat', stat: 'stress', delta: -3 },
        ],
        result: '她说“我知道”，但手指一直在抠袖口。',
      },
      {
        label: '把评论念给她听，然后说你的看法',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
        result: '她听完，沉默了一会儿，说“那你觉得呢？”',
      },
    ],
  },
  {
    id: 'evt.extra_lesson',
    title: '再来一遍',
    when: [{ kind: 'statAtMost', stat: 'stamina', value: 50 }],
    once: false,
    weight: 6,
    text: '今天的课程结束了。她站在练习室门口，回头看你：“要不要再来一遍？”',
    choices: [
      {
        label: '加练',
        effects: [
          { kind: 'stat', stat: 'vocal', delta: 3 },
          { kind: 'stat', stat: 'dance', delta: 3 },
          { kind: 'stat', stat: 'stamina', delta: -15 },
          { kind: 'stat', stat: 'stress', delta: 10 },
        ],
        result: '你们把那段副歌练到保安来催。',
      },
      {
        label: '今天到此为止',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -5 },
          { kind: 'stat', stat: 'stamina', delta: 5 },
          { kind: 'stat', stat: 'trust', delta: 1 },
        ],
        result: '她有点不甘心，但还是收拾了东西。',
      },
      {
        label: '去吃点东西',
        effects: [
          { kind: 'money', delta: -300 },
          { kind: 'stat', stat: 'stress', delta: -8 },
          { kind: 'stat', stat: 'trust', delta: 2 },
        ],
        result: '她在便利店挑了很久，最后选了一个最便宜的饭团。',
      },
    ],
  },
  {
    id: 'evt.first_name',
    title: '名字',
    when: [
      { kind: 'weekAtLeast', week: 6 },
      { kind: 'statAtLeast', stat: 'trust', value: 12 },
    ],
    once: true,
    weight: 10,
    text: '她突然叫了你的名字。不是“制作人”，是名字。叫完她自己先愣住了。',
    choices: [
      {
        label: '应一声',
        effects: [{ kind: 'stat', stat: 'trust', delta: 2 }],
        result: '她低下头，假装在整理谱子。',
      },
      {
        label: '开玩笑说她没大没小',
        effects: [
          { kind: 'stat', stat: 'trust', delta: -1 },
          { kind: 'stat', stat: 'stress', delta: 2 },
        ],
        result: '她立刻改口叫“制作人”，之后一整天都没再叫错。',
      },
      {
        label: '也叫她的名字',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: -5 },
        ],
        result: '她“嗯”了一声，声音小得几乎听不见。',
      },
    ],
  },
  {
    id: 'evt.her_resolve',
    title: '以后',
    when: [
      { kind: 'weekAtLeast', week: 9 },
      { kind: 'statAtLeast', stat: 'trust', value: 10 },
    ],
    once: true,
    weight: 10,
    text: '她第一次主动跟你说起“以后”。不是那种客套的以后，是很具体的、她自己的以后。',
    choices: [
      {
        label: '告诉她你会一直在',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 3 },
          { kind: 'stat', stat: 'stress', delta: -5 },
        ],
        result: '她看着你，像是想确认这句话的重量。',
      },
      {
        label: '提醒她这条路很难',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 1 },
          { kind: 'stat', stat: 'stress', delta: 3 },
        ],
        result: '她点头，说“我知道”，语气比你想的平静。',
      },
      {
        label: '问她想要什么',
        effects: [{ kind: 'stat', stat: 'trust', delta: 2 }],
        result: '她想了很久，说“想站在有人等着我的地方”。',
      },
    ],
  },
  {
    id: 'evt.before_live',
    title: 'Live 前夜',
    when: [{ kind: 'weekAtLeast', week: 11 }],
    once: true,
    weight: 10,
    text: 'Live 前夜。她坐在舞台侧幕的台阶上，手里攥着 setlist，纸边已经被捏软了。',
    choices: [
      {
        label: '陪她坐一会儿',
        effects: [
          { kind: 'stat', stat: 'trust', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: -8 },
        ],
        result: '你们谁也没说话。远处的灯一盏一盏亮起来。',
      },
      {
        label: '再对一遍流程',
        effects: [
          { kind: 'stat', stat: 'vocal', delta: 2 },
          { kind: 'stat', stat: 'dance', delta: 2 },
          { kind: 'stat', stat: 'stress', delta: 5 },
        ],
        result: '她跟着你过了一遍，声音慢慢稳下来。',
      },
      {
        label: '让她一个人待着',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -3 },
          { kind: 'stat', stat: 'trust', delta: -1 },
        ],
        result: '你走开时，听见她轻轻哼起了第一句。',
      },
    ],
  },
  {
    id: 'evt.collapse',
    title: '过劳',
    when: [{ kind: 'statAtLeast', stat: 'stress', value: 90 }],
    once: true,
    weight: 100,
    text: '练习到一半，她突然扶住把杆，慢慢蹲了下去。“……让我缓一下。”',
    choices: [
      {
        label: '扶她去休息',
        effects: [
          { kind: 'stat', stat: 'stress', delta: -30 },
          { kind: 'stat', stat: 'stamina', delta: 20 },
          { kind: 'stat', stat: 'trust', delta: 1 },
          { kind: 'flag', key: 'forced_rest', value: true },
        ],
        result: '她没再逞强，靠在你肩上睡着了。',
      },
      {
        label: '让她再坚持一下',
        effects: [
          { kind: 'stat', stat: 'stress', delta: 5 },
          { kind: 'stat', stat: 'stamina', delta: -10 },
          { kind: 'stat', stat: 'trust', delta: -2 },
        ],
        result: '她站起来，但之后每个动作都慢半拍。',
      },
    ],
  },
];
