import type { DialogueDef } from '../../types';

/**
 * 招募第一步：改编自 W.I.N.G. 開場（`輝きはめまぐるしく`）。
 *
 * 原作：制作人看档案选中她 → 公园找她 → 她在和朋友打篮球 →
 * 她自己先认出制作人、叫她"巡"就行、然后拉着制作人往事务所跑。
 */
export const meguruFirst: DialogueDef = {
  id: 'dialogue.meguru.first',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '公园的球场上，一个女生刚投进一球，被朋友们围着拍手。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '要上了哦！嘿……！',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      text: '她转身捡球，正好和站在场边的你对了眼。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'meguru',
      text: '……我说！',
      choices: [
        {
          label: '（先开口）你是八宫巡吧',
          nextNodeId: 'n05a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
        {
          label: '（站着等她过来）',
          nextNodeId: 'n05b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '（不知道该说什么）',
          nextNodeId: 'n05c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n05a: {
      id: 'n05a',
      speakerId: 'meguru',
      text: '诶！？你怎么知道我的名字？',
      nextNodeId: 'n06',
    },
    n05b: {
      id: 'n05b',
      speakerId: 'meguru',
      text: '……果然！我就觉得是！',
      nextNodeId: 'n06',
    },
    n05c: {
      id: 'n05c',
      speakerId: 'meguru',
      text: '那个！你是不是有什么话要说？',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '难道你是制作人吗！？',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      text: '她把球往朋友那边一抛，几步就跑到你面前。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'meguru',
      text: '我刚才就在想，说不定是这样呢～"这个人肯定就是我的制作人"，刚见到的时候就有这感觉了！',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'meguru',
      text: '我一直期待着能跟制作人说上话的这天哦！',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      text: '她说着已经迈开步子，往车站的方向走。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      speakerId: 'meguru',
      text: '走吧走吧！因为有很开心的事情在等着吧？',
      nextNodeId: 'n12',
    },
    n12: {
      id: 'n12',
      speakerId: 'meguru',
      text: '啊，对了。叫我巡就可以了！今后请多关照哦，制作人！',
    },
  },
};

/**
 * 招募第二步：改编自 W.I.N.G. 開場后半（她陪朋友练习的习惯）。
 *
 * 原作：她"只要拜托就什么忙都帮"，把那当成理所当然。
 * 这一步把她的这个习惯第一次摆到制作人面前——但要先由她自己说出口。
 */
export const meguruSecond: DialogueDef = {
  id: 'dialogue.meguru.second',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '第二天，她提前到了事务所，手里还拿着一副护腕。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '制作人！我想先问一件事！',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '当偶像，是不是就不能像以前那样，随便去帮朋友的忙了？',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'meguru',
      text: '之前我跟朋友说过，只奉陪到我要工作的时间为止。所以……应该没关系吧？',
      choices: [
        {
          label: '没关系。但你的时间要自己划清',
          nextNodeId: 'n05a',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 5 },
            { kind: 'flag', key: 'meguru_drew_line', value: true },
          ],
        },
        {
          label: '没关系。你想帮就帮',
          nextNodeId: 'n05b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '最好还是少去一点',
          nextNodeId: 'n05c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n05a: {
      id: 'n05a',
      speakerId: 'meguru',
      text: '自己划清……嗯。我知道了，我会试试看！',
      nextNodeId: 'n06',
    },
    n05b: {
      id: 'n05b',
      speakerId: 'meguru',
      text: '太好了！那我会加油的！……不过好像会变得很忙诶，诶嘿嘿。',
      nextNodeId: 'n06',
    },
    n05c: {
      id: 'n05c',
      speakerId: 'meguru',
      text: '诶……啊，嗯。也是哦。……我会尽量少去一点。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      text: '她把护腕塞进包里，又抬起头，笑了一下。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      speakerId: 'meguru',
      text: '那我就是这个事务所的偶像了？诶嘿嘿，有点不真实！',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'meguru',
      text: '制作人，请多关照！我会努力的！',
    },
  },
};


/**
 * 长线第一步：她还在球场上。
 * 改编自 W.I.N.G.編「大切、選べないから。」——累到站着都费劲，还说"很有精神，别担心！"
 */

/**
 * 长线第二步：她说不用取消。
 * 改编自同章节：她拒绝取消工作——"因为这些都是自己说了想做的工作"。
 */

/**
 * 长线第三步：她第一次说了"不去"。
 * 不是"学会拒绝"，是**她第一次为自己做选择**。
 */


// 长线对话已迁到审查台（content-review），由 approved 内容提供。
export const MEGURU_DIALOGUES = [
  meguruFirst,
  meguruSecond,
];
