import type { DialogueDef } from '../../types';

export const hioriFirst: DialogueDef = {
  id: 'dialogue.hiori.first',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '公园的长椅上，灯织戴着耳机，膝盖上摊着一本写到一半的笔记本。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '你站在这里很久了。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '有事吗？',
      choices: [
        {
          label: '帮她捡起被风吹散的纸',
          nextNodeId: 'n04a',
          effects: [
            { kind: 'idolExp', attribute: 'trust', tier: 1 },
            { kind: 'flag', key: 'hiori_helped_paper', value: true },
          ],
        },
        {
          label: '站远一点，不打扰她',
          nextNodeId: 'n04b',
        },
        {
          label: '问她是不是在写歌',
          nextNodeId: 'n04c',
          effects: [
            { kind: 'idolExp', attribute: 'trust', tier: 1 },
            { kind: 'flag', key: 'hiori_asked_song', value: true },
          ],
        },
      ],
    },
    n04a: {
      id: 'n04a',
      text: '纸页被她接过去的时候，指尖停了一下。她把顺序重新理好，才重新看向你。',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      text: '她重新戴上耳机，却没有立刻低头。风把她的头发吹到脸侧，她抬手别开。',
      nextNodeId: 'n05',
    },
    n04c: {
      id: 'n04c',
      text: '她合上笔记本，像是没想到会被这样问。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'hiori',
      text: '你不是这附近的人。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '……找我有事？',
      choices: [
        {
          label: '我是 283 的制作人',
          nextNodeId: 'n07a',
          effects: [
            { kind: 'idolExp', attribute: 'trust', tier: 1 },
            { kind: 'flag', key: 'hiori_knows_producer', value: true },
          ],
        },
        {
          label: '只是路过',
          nextNodeId: 'n07b',
        },
        {
          label: '想听你唱歌',
          nextNodeId: 'n07c',
          effects: [
            { kind: 'idolExp', attribute: 'trust', tier: 1 },
            { kind: 'flag', key: 'hiori_wants_song', value: true },
          ],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'hiori',
      text: '制作人。……原来是这样。',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'hiori',
      text: '路过的人不会在这里站这么久。',
      nextNodeId: 'n08',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'hiori',
      text: '现在？在这里？',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      text: '她把笔记本收进包里，站起来。耳机线在手指间绕了一圈。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'hiori',
      text: '如果下次还在这里遇见，再说吧。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      text: '她朝公园出口走去，没有回头。',
    },
  },
};

export const hioriSecond: DialogueDef = {
  id: 'dialogue.hiori.second',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '两天后。灯织还是坐在那张长椅上，只是这次没有戴耳机。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '你来了。',
      textVariants: [
        {
          when: [{ kind: 'flag', key: 'hiori_helped_paper', value: true }],
          text: '你来了。上次的纸……谢谢。',
        },
        {
          when: [{ kind: 'flag', key: 'hiori_asked_song', value: true }],
          text: '你来了。我后来想了一下你问的那个问题。',
        },
      ],
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '你上次说的，我回去想了很久。',
      choices: [
        {
          label: '我说过，会再来',
          nextNodeId: 'n04a',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
        },
        {
          label: '我带了上次那张纸',
          nextNodeId: 'n04b',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
        },
        {
          label: '只是来看看你',
          nextNodeId: 'n04c',
        },
      ],
    },
    n04a: {
      id: 'n04a',
      speakerId: 'hiori',
      text: '……你真的来了。',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      speakerId: 'hiori',
      text: '那张纸你还留着？',
      nextNodeId: 'n05',
    },
    n04c: {
      id: 'n04c',
      speakerId: 'hiori',
      text: '看我做什么。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'hiori',
      text: '我查过 283。也问过别人。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '你是认真的吗？',
      choices: [
        {
          label: '我想正式负责你的工作',
          nextNodeId: 'n07a',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 3 }],
        },
        {
          label: '先从朋友开始也可以',
          nextNodeId: 'n07b',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
        },
        {
          label: '你不用现在回答',
          nextNodeId: 'n07c',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'hiori',
      text: '……你说得倒直接。',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'hiori',
      text: '朋友。……那你最好别半途而废。',
      nextNodeId: 'n08',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'hiori',
      text: '我没说不回答。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      text: '她把一边耳机摘下来，像是在做一个不太习惯的决定。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'hiori',
      text: '那就试试。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      text: '她把笔记本递给你，扉页上写着一行还没干的字。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      speakerId: 'hiori',
      text: '下次录音，我会准时。',
      nextNodeId: 'n12',
    },
    n12: {
      id: 'n12',
      text: '她站起来，第一次没有先走。',
    },
  },
};

export const HIORI_DIALOGUES = [hioriFirst, hioriSecond];
