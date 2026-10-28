import type { DialogueDef } from '../../types';

// 与真乃闹别扭之后的三段对话。事件与链条见 events/mano/quarrel.ts 与 storyChains.ts。

export const riftOffice: DialogueDef = {
  id: 'dialogue.rift.office',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      speakerId: 'tsutomu',
      text: '真乃今天没来练习室。……你们之间出什么事了？',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      text: '你说了个大概。社长听完，把茶杯放回桌上。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'tsutomu',
      text: '这种时候越解释越糟。给她两天，让她自己把话想清楚。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'tsutomu',
      text: '不过空着手去，就跟没去一样。去街上转转吧。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      text: '你点点头。窗外的天色已经开始发暗。',
    },
  },
};

export const riftShop: DialogueDef = {
  id: 'dialogue.rift.shop',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '商业街的店一家挨着一家。你在花店门口停下，看了很久。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      text: '最后挑了一小束白色的花。不是什么名贵的品种，只是看着安静。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      text: '大概不是用来道歉的东西。但总比空着手好。',
    },
  },
};

export const riftPark: DialogueDef = {
  id: 'dialogue.rift.park',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '公园的长椅上，她抱着膝盖坐着。鸽子落在脚边，她没有喂。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'mano',
      text: '……你怎么知道我在这里。',
      choices: [
        {
          label: '猜的',
          nextNodeId: 'n03a',
        },
        {
          label: '社长说的',
          nextNodeId: 'n03b',
        },
      ],
    },
    n03a: {
      id: 'n03a',
      speakerId: 'mano',
      text: '……猜得真准。',
      nextNodeId: 'n04',
    },
    n03b: {
      id: 'n03b',
      speakerId: 'mano',
      text: '社长真是的。什么都说。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      text: '你把花递过去。她愣了一下，还是接住了。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'mano',
      text: '……我那天也有点过分。对不起。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'mano',
      text: '明天，我会去练习室的。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      text: '她低头闻了闻花，肩膀终于松了下来。',
    },
  },
};

export const RIFT_DIALOGUES = [riftOffice, riftShop, riftPark];
