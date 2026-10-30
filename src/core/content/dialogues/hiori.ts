import type { DialogueDef } from '../../types';

/** 第一次见面：公园的长椅，她在写东西。 */
export const hioriFirst: DialogueDef = {
  id: 'dialogue.hiori.first',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '公园的长椅上，她戴着耳机，膝盖上摊着一本写到一半的笔记本。风把其中一页掀起来，她用手压住。',
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
      text: '有事吗。',
      choices: [
        {
          label: '帮她把被吹散的纸捡回来',
          nextNodeId: 'n04a',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
            { kind: 'flag', key: 'hiori_helped_paper', value: true },
          ],
        },
        {
          label: '退开一点，不打扰她',
          nextNodeId: 'n04b',
        },
        {
          label: '问她是不是在写歌',
          nextNodeId: 'n04c',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
            { kind: 'flag', key: 'hiori_asked_song', value: true },
          ],
        },
      ],
    },
    n04a: {
      id: 'n04a',
      text: '纸被她接过去的时候，指尖停了一下。她按页序理好，才重新抬头。',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      text: '她重新戴上耳机，却没有立刻低头。风把头发吹到脸侧，她抬手别开。',
      nextNodeId: 'n05',
    },
    n04c: {
      id: 'n04c',
      text: '她合上笔记本，像是没料到会被这样问。',
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
      text: '……找我干什么。',
      choices: [
        {
          label: '我是 283 的制作人',
          nextNodeId: 'n07a',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
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
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
            { kind: 'flag', key: 'hiori_wants_song', value: true },
          ],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'hiori',
      text: '制作人。……所以是来挖人的。',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'hiori',
      text: '路过的人不会站这么久。',
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
      text: '她把笔记本收进包里，站起来。耳机线在手指上绕了一圈。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'hiori',
      text: '我不喜欢被人看过一次就下结论。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'hiori',
      text: '如果下次还在这里遇见，再说吧。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      text: '她朝公园出口走去，没有回头。',
    },
  },
};

/** 第二次：她自己来了事务所。 */
export const hioriSecond: DialogueDef = {
  id: 'dialogue.hiori.second',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '两天后。事务所的门被敲了三下，间隔一样长。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '我查过了。283 是个小事务所，艺人不到十个。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '先说清楚。我不需要别人告诉我"我可以"。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'hiori',
      text: '我想知道的是，如果我做不好，你们会怎么处理。',
      choices: [
        {
          label: '会告诉你哪里不好，然后一起改',
          nextNodeId: 'n05a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '不会替你遮过去',
          nextNodeId: 'n05b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '你先做不好一次，我们再谈',
          nextNodeId: 'n05c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
      ],
    },
    n05a: {
      id: 'n05a',
      speakerId: 'hiori',
      text: '……具体。这点还行。',
      nextNodeId: 'n06',
    },
    n05b: {
      id: 'n05b',
      speakerId: 'hiori',
      text: '那就好。我最讨厌被当成需要保护的人。',
      nextNodeId: 'n06',
    },
    n05c: {
      id: 'n05c',
      speakerId: 'hiori',
      text: '你倒是敢说。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '还有一个问题。为什么是我。',
      choices: [
        {
          label: '因为你在长椅上写到天黑',
          nextNodeId: 'n07a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '因为你唱歌的时候不像在表演',
          nextNodeId: 'n07b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'hiori',
      text: '……那是我自己的事。',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'hiori',
      text: '……你听过？',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      text: '她沉默了几秒，把包放到桌上。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'hiori',
      text: '我答应，是有条件的。我不会因为被选中就高兴。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'hiori',
      text: '我会自己判断值不值得。如果最后觉得不对，我会走。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      speakerId: 'hiori',
      text: '这样也可以的话——风野灯织。请多指教。',
    },
  },
};

export const HIORI_DIALOGUES = [hioriFirst, hioriSecond];
