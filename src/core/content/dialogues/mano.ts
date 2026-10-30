import type { DialogueDef } from '../../types';

export const manoFirst: DialogueDef = {
  id: 'dialogue.mano.first',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '公园的午后。长椅旁落着几只鸽子，一个女孩正低着头，小声哼着歌。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'mano',
      text: '……ほわっ。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'mano',
      text: '啊、对不起。我没有注意到有人。',
      choices: [
        {
          label: '刚才的歌，很好听',
          nextNodeId: 'n04a',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 1 },
            { kind: 'flag', key: 'mano_heard_song', value: true },
          ],
        },
        {
          label: '你经常在这里唱歌吗？',
          nextNodeId: 'n04b',
        },
        {
          label: '抱歉，打扰到你了',
          nextNodeId: 'n04c',
        },
      ],
    },
    n04a: {
      id: 'n04a',
      speakerId: 'mano',
      text: '……真的吗？我只是随便哼的。',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      speakerId: 'mano',
      text: '嗯。这里很安静，鸽子也不会笑我。',
      nextNodeId: 'n05',
    },
    n04c: {
      id: 'n04c',
      speakerId: 'mano',
      text: '没有关系。是我自己在这里唱歌。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'mano',
      text: '我叫樱木真乃。那个……你不是这附近的人吧？',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'mano',
      text: '刚才的歌，其实是我自己想着写的。还没有给别人听过。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      speakerId: 'mano',
      text: '制作人……？',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'mano',
      text: '对不起。我还没有想过要成为偶像。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      text: '她低下头，手指轻轻攥住裙角。风把她的声音吹得很轻。',
    },
  },
};

export const manoSecond: DialogueDef = {
  id: 'dialogue.mano.second',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '两天后。公园的长椅上，真乃还是坐在原来的位置。鸽子比上次多了一只。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'mano',
      text: '你来了。',
      textVariants: [
        {
          when: [{ kind: 'flag', key: 'mano_heard_song', value: true }],
          text: '你来了。上次那首歌……我后来又改了一点。',
        },
      ],
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'mano',
      text: '我一直在想，你那天为什么要停下来听。',
      choices: [
        {
          label: '因为我想听你唱完',
          nextNodeId: 'n04a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
        {
          label: '因为那首歌让我停下了脚步',
          nextNodeId: 'n04b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
        {
          label: '因为我觉得你还没有唱完',
          nextNodeId: 'n04c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n04a: {
      id: 'n04a',
      speakerId: 'mano',
      text: '……唱完。我好像很久没有把一首歌唱完了。',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      speakerId: 'mano',
      text: '停下脚步……我从来没有想过，会有人这样听。',
      nextNodeId: 'n05',
    },
    n04c: {
      id: 'n04c',
      speakerId: 'mano',
      text: '还没有唱完……嗯。也许是这样。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'mano',
      text: '我从小就喜欢唱歌。但是，站在别人面前的时候，就会不知道该怎么办。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'mano',
      text: '所以那天，我才说了那种话。对不起。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      speakerId: 'tsutomu',
      text: '真乃。你不用为没有准备好道歉。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'tsutomu',
      text: '但如果你愿意试着改变，283 会接住你。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'mano',
      text: '……制作人。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'mano',
      text: '我想试试。不是为了成为很厉害的人，只是想……把这首歌唱完。',
      choices: [
        {
          label: '我会陪你到最后',
          nextNodeId: 'n11a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '先从第一步开始',
          nextNodeId: 'n11b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n11a: {
      id: 'n11a',
      speakerId: 'mano',
      text: '……嗯。那就请多指教。',
      nextNodeId: 'n12',
    },
    n11b: {
      id: 'n11b',
      speakerId: 'mano',
      text: '第一步……我可以做到吗？',
      nextNodeId: 'n12',
    },
    n12: {
      id: 'n12',
      speakerId: 'mano',
      text: '樱木真乃。从今天开始，请多指教。',
      nextNodeId: 'n13',
    },
    n13: {
      id: 'n13',
      text: '她站起来，认真地向你鞠了一躬。公园里的鸽子扑棱棱飞起，又落在她脚边。',
    },
  },
};



/** B2 第三步：招募之后，她第一次主动来找你。 */
const manoThird: DialogueDef = {
  id: 'dialogue.mano.third',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '事务所的灯只开了半排。她把包放在桌上，站得笔直，像在等谁先开口。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'mano',
      text: '抱歉，这么晚还来打扰……',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'mano',
      text: '我一直在想一件事。我这样的人，真的可以站到台上去吗。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'mano',
      text: '不是不想。是怕上去以后，让别人失望。',
      choices: [
        {
          label: '那就先站一次小的',
          nextNodeId: 'n05a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '失望也是我们自己的事',
          nextNodeId: 'n05b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '你已经在准备了，我看得见',
          nextNodeId: 'n05c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
      ],
    },
    n05a: {
      id: 'n05a',
      speakerId: 'mano',
      text: '小的……像那种只有几十个人的场子吗。',
      nextNodeId: 'n06',
    },
    n05b: {
      id: 'n05b',
      speakerId: 'mano',
      text: '我们……您说"我们"。',
      nextNodeId: 'n06',
    },
    n05c: {
      id: 'n05c',
      speakerId: 'mano',
      text: '被看见了。有点不好意思，但也有点高兴。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'mano',
      text: '那……我可以试试吗。哪怕只有一次。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      text: '她说这句话的时候没有低头。窗外有鸽子落在窗台上，停了一下又飞走。',
    },
  },
};


/** B6 第一步：练习室里，她第一次唱不出来了。 */
const manoSlumpFirst: DialogueDef = {
  id: 'dialogue.mano.slump.first',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '练习室的门半开着。音响里那一段已经循环到第四遍，还是没有声音。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'mano',
      text: '……对不起。再来一次。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      text: '她按下播放键，张了张嘴，又停下。第五遍。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'mano',
      text: '明明练过很多次了。为什么今天唱不出来。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'mano',
      text: '……是不是我本来就不适合站在前面。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'mano',
      text: '抱歉，说了奇怪的话。我继续练。',
      choices: [
        {
          label: '今天先到这里',
          nextNodeId: 'n07a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '我在这儿听你唱',
          nextNodeId: 'n07b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '你刚才那句，是真的吗',
          nextNodeId: 'n07c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'mano',
      text: '……可以吗。那我明天早点来。',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'mano',
      text: '会很难听。',
      nextNodeId: 'n08',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'mano',
      text: '……不知道。可能是。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      text: '她没有说完，把耳机摘下来绕好，放回架子上。走的时候没有回头。',
      effects: [
        { kind: 'var', key: 'mano.slump', op: 'set', value: 1 },
      ],
    },
  },
};

/** B6 第二步：事务所的晚上，制作人决定怎么处理。 */
const manoSlumpSecond: DialogueDef = {
  id: 'dialogue.mano.slump.second',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '事务所的灯只开了一盏。她坐在桌边，面前那碗面几乎没有动过。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'mano',
      text: '制作人先生。今天的事，我想了一路。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'mano',
      text: '如果我做不到，早点说会比较好吧。这样大家还能换人。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'mano',
      text: '……我不是在赌气。我是真的这么想。',
      choices: [
        {
          label: '把问题拆开：到底是哪一句唱不出来',
          nextNodeId: 'n05a',
          effects: [
            { kind: 'var', key: 'mano.slumpApproach', op: 'set', value: 1 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
        {
          label: '先休息一天，什么都别想',
          nextNodeId: 'n05b',
          effects: [
            { kind: 'var', key: 'mano.slumpApproach', op: 'set', value: 2 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
        {
          label: '陪她把今天那段重听一遍',
          nextNodeId: 'n05c',
          effects: [
            { kind: 'var', key: 'mano.slumpApproach', op: 'set', value: 3 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
      ],
    },
    n05a: {
      id: 'n05a',
      speakerId: 'mano',
      text: '哪一句……是第二段最后那句。每次到那里，我就开始想别的。',
      nextNodeId: 'n06',
    },
    n05b: {
      id: 'n05b',
      speakerId: 'mano',
      text: '休息。……好。那我明天什么都不做。',
      nextNodeId: 'n06',
    },
    n05c: {
      id: 'n05c',
      speakerId: 'mano',
      text: '要听吗。……会很糟糕。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      text: '她终于拿起筷子，吃了一口。面已经凉了。',
      effects: [
        { kind: 'var', key: 'mano.slump', op: 'set', value: 2 },
      ],
    },
  },
};

/** B6 第三步：她回到练习室。台词按第二步的处理方式变化。 */
const manoSlumpThird: DialogueDef = {
  id: 'dialogue.mano.slump.third',
  idolId: 'mano',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '第二天。练习室的窗帘拉开了，光落在地板中间。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'mano',
      text: '我准备好了。',
      textVariants: [
        {
          when: [{ kind: 'varAtLeast', key: 'mano.slumpApproach', value: 1 }, { kind: 'varAtMost', key: 'mano.slumpApproach', value: 1 }],
          text: '我数过了。第二段最后那句，一共 11 个字，我拆成了三段练。',
        },
        {
          when: [{ kind: 'varAtLeast', key: 'mano.slumpApproach', value: 2 }, { kind: 'varAtMost', key: 'mano.slumpApproach', value: 2 }],
          text: '昨天什么都没想，睡了一整天。……好像有点用。',
        },
        {
          when: [{ kind: 'varAtLeast', key: 'mano.slumpApproach', value: 3 }, { kind: 'varAtMost', key: 'mano.slumpApproach', value: 3 }],
          text: '我把那段重听了。听了七遍。……然后发现自己一直在抢拍。',
        },
      ],
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      text: '她按下播放键。这一次，从头到尾没有停。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'mano',
      text: '……唱完了。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'mano',
      text: '制作人先生。昨天那些话，我想收回。',
      choices: [
        {
          label: '不用收回，那也是你的一部分',
          nextNodeId: 'n06a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 5 }],
        },
        {
          label: '下次卡住的时候，也告诉我',
          nextNodeId: 'n06b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 5 }],
        },
      ],
    },
    n06a: {
      id: 'n06a',
      speakerId: 'mano',
      text: '……嗯。那我要连着好的部分一起收下。',
      nextNodeId: 'n07',
    },
    n06b: {
      id: 'n06b',
      speakerId: 'mano',
      text: '好。下次……我会在更早的时候说。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      text: '她重新戴上耳机。窗外的鸽子落在窗台上，这次没有飞走。',
    },
  },
};

export const MANO_DIALOGUES = [
  manoFirst,
  manoSecond,
  manoThird,
  manoSlumpFirst,
  manoSlumpSecond,
  manoSlumpThird,
];

