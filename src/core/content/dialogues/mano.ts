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
            { kind: 'idolExp', attribute: 'trust', tier: 1 },
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
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
        },
        {
          label: '因为那首歌让我停下了脚步',
          nextNodeId: 'n04b',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
        },
        {
          label: '因为我觉得你还没有唱完',
          nextNodeId: 'n04c',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
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
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 3 }],
        },
        {
          label: '先从第一步开始',
          nextNodeId: 'n11b',
          effects: [{ kind: 'idolExp', attribute: 'trust', tier: 1 }],
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


export const MANO_DIALOGUES = [manoFirst, manoSecond];

