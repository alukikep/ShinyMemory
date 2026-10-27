import type { DialogueDef } from '../../types';

export const prologueOffice: DialogueDef = {
  id: 'dialogue.prologue.office',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '事务所的早晨很安静。桌上放着一串钥匙和一份还没拆封的资料。沙发后面传来均匀的呼吸声。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hazuki',
      text: '啊……早上好。不好意思，我昨晚整理资料，稍微睡了一会儿。我是七草叶月，事务所的事务员。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'hazuki',
      text: '严格来说，是兼职。不过事务、日程、训练室这些，基本都是我在管。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'tsutomu',
      text: '来了。从今天开始，你就是 283 的制作人。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'tsutomu',
      text: '在你开始工作之前，我想听一句实话。你觉得自己能成为什么样的制作人？',
      choices: [
        { label: '我想认真面对偶像', nextNodeId: 'n07a' },
        { label: '我还没有具体的答案', nextNodeId: 'n07b' },
        { label: '先从今天能做的事开始', nextNodeId: 'n07c' },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'tsutomu',
      text: '那就记住这句话。认真不是口号，是你每天都要拿出来的东西。',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'tsutomu',
      text: '没有答案很正常。不要装作有。先去看，先去听。',
      nextNodeId: 'n08',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'tsutomu',
      text: '可以。工作不是从宏大的目标开始的。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'tsutomu',
      text: '283 不会把公司的方针强加给偶像。偶像不是换装娃娃。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'tsutomu',
      text: '制作人不是替她们决定一切的人。你要站在她们旁边，让她们能自己往前走。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'tsutomu',
      text: '我没有给你指定谁。接下来你会遇见谁，那是你自己的事。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      speakerId: 'hazuki',
      text: '事务所的钥匙、地图、日程和训练室的使用方法，我之后会带你熟悉。遇到不明白的事可以问我。虽然我可能会在奇怪的地方睡着。',
      nextNodeId: 'n13',
    },
    n13: {
      id: 'n13',
      text: '社长回了办公室，叶月也去整理资料。事务所有些安静。\n\n今天开始，你是 283 的制作人。接下来做什么，没有人替你决定。',
    },
  },
};

export const PROLOGUE_DIALOGUES = [prologueOffice];

