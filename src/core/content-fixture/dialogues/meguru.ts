import type { DialogueDef } from '../../types';

export const meguruFirst: DialogueDef = {
  id: 'dialogue.meguru.first',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '商业街的拐角，巡正拎着两只纸袋，低头研究一张传单。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '啊，那边的你！能不能帮我拿一下这个？',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '就差一点点了！',
      choices: [
        {
          label: '接过她手里的纸袋',
          nextNodeId: 'n04a',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
            { kind: 'flag', key: 'meguru_helped_bags', value: true },
          ],
        },
        {
          label: '帮她按住被风吹起的传单',
          nextNodeId: 'n04b',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
            { kind: 'flag', key: 'meguru_helped_flyer', value: true },
          ],
        },
        {
          label: '站到一旁等她忙完',
          nextNodeId: 'n04c',
        },
      ],
    },
    n04a: {
      id: 'n04a',
      text: '纸袋比看起来重。她腾出手，终于把传单折成整齐的一小块。',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      text: '传单停在你手里。她眨眨眼，像是刚发现你站在这里。',
      nextNodeId: 'n05',
    },
    n04c: {
      id: 'n04c',
      text: '她一个人忙了一会儿，最后把传单塞进纸袋，转身看见了你。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'meguru',
      text: '谢谢！我叫八宫巡。你呢？',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '……等一下，你看起来像 283 的人。',
      choices: [
        {
          label: '我是制作人',
          nextNodeId: 'n07a',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
            { kind: 'flag', key: 'meguru_knows_producer', value: true },
          ],
        },
        {
          label: '只是来商业街逛逛',
          nextNodeId: 'n07b',
        },
        {
          label: '你手上的传单是什么？',
          nextNodeId: 'n07c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'meguru',
      text: '制作人！那正好，我有好多想做的事！',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'meguru',
      text: '逛街也很重要！这条街我今天才逛到一半。',
      nextNodeId: 'n08',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'meguru',
      text: '是附近的舞台活动！我本来想一个人去看看。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      text: '她把传单折好，认真塞进外套口袋。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'meguru',
      text: '下次公园有活动。你要是也来，我们再聊！',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      text: '她朝你挥挥手，拎着纸袋跑进人群。',
    },
  },
};

export const meguruSecond: DialogueDef = {
  id: 'dialogue.meguru.second',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '两天后。公园的喷泉旁，巡正踮着脚往舞台方向看。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '你来了！',
      textVariants: [
        {
          when: [{ kind: 'flag', key: 'meguru_helped_bags', value: true }],
          text: '你来了！上次多亏你帮我拿东西。',
        },
        {
          when: [{ kind: 'flag', key: 'meguru_helped_flyer', value: true }],
          text: '你来了！上次那张传单，我最后真的去了。',
        },
      ],
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '我一直在想，要不要认真试试看。',
      choices: [
        {
          label: '试试看什么？',
          nextNodeId: 'n04a',
        },
        {
          label: '你已经在准备了',
          nextNodeId: 'n04b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
        {
          label: '我陪你一起想',
          nextNodeId: 'n04c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n04a: {
      id: 'n04a',
      speakerId: 'meguru',
      text: '站上舞台！不是只在台下看，是真正站在那里。',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      speakerId: 'meguru',
      text: '被你看出来了？我最近一直在偷偷练习。',
      nextNodeId: 'n05',
    },
    n04c: {
      id: 'n04c',
      speakerId: 'meguru',
      text: '一起想？那你要负责到最后哦。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'meguru',
      text: '我想让更多人看见 illumination STARS。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '制作人，你愿意带我吗？',
      choices: [
        {
          label: '我想正式负责你的工作',
          nextNodeId: 'n07a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '先从一起做一场活动开始',
          nextNodeId: 'n07b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '你不必现在回答',
          nextNodeId: 'n07c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'meguru',
      text: '真的？那我会认真跟上你的！',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'meguru',
      text: '一场活动……听起来不错，先从做得到的事开始！',
      nextNodeId: 'n08',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'meguru',
      text: '我没说不回答。我已经想好了。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      text: '她伸出手，又觉得不够正式，改成认真地鞠了一躬。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'meguru',
      text: '八宫巡，请多指教！',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      text: '喷泉的水声盖过了远处的音乐。她抬起头，笑得很亮。',
    },
  },
};

export const MEGURU_DIALOGUES = [meguruFirst, meguruSecond];

