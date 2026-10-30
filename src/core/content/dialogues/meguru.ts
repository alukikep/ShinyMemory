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
export const meguruBurdenFirst: DialogueDef = {
  id: 'dialogue.meguru.burden.first',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '练习时间已经过了。球场上只剩她一个人，对着篮板投球。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '啊，制作人！……等一下，我马上收拾！',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      text: '她跑过去捡球，脚步比前几天慢。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'meguru',
      text: '诶嘿嘿，今天也是陪朋友练习。只奉陪到今天为止哦？',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'meguru',
      text: '……啊。手机。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      text: '她接起电话，说了几句"嗯""我知道了""那就下个休息日"。挂掉以后，笑了一下。',
      choices: [
        {
          label: '又是去帮忙？',
          nextNodeId: 'n07a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '（什么也没问，把水递过去）',
          nextNodeId: 'n07b',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
            { kind: 'flag', key: 'meguru_got_water', value: true },
          ],
        },
        {
          label: '你今天看起来很累',
          nextNodeId: 'n07c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'meguru',
      text: '嗯！朋友的比赛，人手不够！',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'meguru',
      text: '……谢谢。啊，我确实有点渴了。',
      nextNodeId: 'n08',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'meguru',
      text: '诶！？没、没有哦！你看！很有精神，别担心！',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'meguru',
      text: '啊哈哈……比起以前，去的次数已经减少了。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'meguru',
      text: '所以，安排没有冲突的时候，我想努力一下。想帮上大家的忙……！',
      effects: [{ kind: 'var', key: 'meguru.burden', op: 'set', value: 1 }],
    },
  },
};

/**
 * 长线第二步：她说不用取消。
 * 改编自同章节：她拒绝取消工作——"因为这些都是自己说了想做的工作"。
 */
export const meguruBurdenSecond: DialogueDef = {
  id: 'dialogue.meguru.burden.second',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '事务所的灯还亮着。她趴在桌上，听见开门声立刻坐直。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '制作人！我没睡！',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '……那个。最近工作有点多呢，啊哈哈。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      text: '你说要不要取消几件，先休息一下。她立刻摇头。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'meguru',
      text: '不要。我不想取消。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '因为这些都是自己说了想做的工作……而且，制作人好不容易争取来了工作。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      speakerId: 'meguru',
      text: '要是取消的话……',
      choices: [
        {
          label: '把下周的表摊开：你自己看，哪一格是空的',
          nextNodeId: 'n08a',
          effects: [
            { kind: 'var', key: 'meguru.burdenApproach', op: 'set', value: 1 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
        {
          label: '我担心的不是工作，是你',
          nextNodeId: 'n08b',
          effects: [
            { kind: 'var', key: 'meguru.burdenApproach', op: 'set', value: 2 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
        {
          label: '那你自己选一件最想做的，其他先放下',
          nextNodeId: 'n08c',
          effects: [
            { kind: 'var', key: 'meguru.burdenApproach', op: 'set', value: 3 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
      ],
    },
    n08a: {
      id: 'n08a',
      speakerId: 'meguru',
      text: '……真的，一格都没有。',
      nextNodeId: 'n09',
    },
    n08b: {
      id: 'n08b',
      speakerId: 'meguru',
      text: '我？……我没事的。真的。',
      nextNodeId: 'n09',
    },
    n08c: {
      id: 'n08c',
      speakerId: 'meguru',
      text: '选一件……诶，只有一件吗？',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'meguru',
      text: '……对不起。我今天有点困了。',
      effects: [{ kind: 'var', key: 'meguru.burden', op: 'set', value: 2 }],
    },
  },
};

/**
 * 长线第三步：她第一次说了"不去"。
 * 不是"学会拒绝"，是**她第一次为自己做选择**。
 */
export const meguruBurdenThird: DialogueDef = {
  id: 'dialogue.meguru.burden.third',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '第二天。练习室的地板上摆着她的水壶和一条毛巾。她坐在地上，没在练。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '制作人。我昨天想了很久。',
      textVariants: [
        {
          when: [
            { kind: 'varAtLeast', key: 'meguru.burdenApproach', value: 1 },
            { kind: 'varAtMost', key: 'meguru.burdenApproach', value: 1 },
          ],
          text: '制作人。我昨天想了很久。……那个表，确实一格都没有空。',
        },
        {
          when: [
            { kind: 'varAtLeast', key: 'meguru.burdenApproach', value: 2 },
            { kind: 'varAtMost', key: 'meguru.burdenApproach', value: 2 },
          ],
          text: '制作人。我昨天想了很久。你担心的不是工作……那我要怎么办才好。',
        },
        {
          when: [
            { kind: 'varAtLeast', key: 'meguru.burdenApproach', value: 3 },
            { kind: 'varAtMost', key: 'meguru.burdenApproach', value: 3 },
          ],
          text: '制作人。我昨天想了很久。选一件——我想了一晚上，选不出来。',
        },
      ],
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '我一直以为，能帮上忙就是好事。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'meguru',
      text: '但是昨天……我第一次觉得，好像有什么地方不对。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      text: '她低下头，捏着毛巾的边角。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '……那。下个休息日的比赛，我可以不去吗。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      text: '她说完立刻抬头，像是怕你误会。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'meguru',
      text: '就这一次！我会好好跟朋友说的！只是……只是我想试一次。',
      choices: [
        {
          label: '当然可以。这是你自己的事。',
          nextNodeId: 'n09a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 5 }],
        },
        {
          label: '你已经做得够多了。',
          nextNodeId: 'n09b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 5 }],
        },
      ],
    },
    n09a: {
      id: 'n09a',
      speakerId: 'meguru',
      text: '……嗯。谢谢你。',
      nextNodeId: 'n10',
    },
    n09b: {
      id: 'n09b',
      speakerId: 'meguru',
      text: '诶嘿嘿……被这么说，好像有点想哭。奇怪。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'meguru',
      text: '原来选东西这么难啊。……那我以后，慢慢学。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      text: '她站起来，拍了拍裙子，把毛巾搭在肩上。',
    },
  },
};


/**
 * 卡面章「泳装的颜色」第一步：邀约（桥段）。
 * 改编自 P 卡【夏に恋するピチカート！】/ カラフルサマー.csv
 */
export const meguruSwimsuitFirst: DialogueDef = {
  id: 'dialogue.meguru.swimsuit.first',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '事务所的桌上摊着一本杂志。封面上写着「新人偶像特集」。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '新人偶像特集？',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '这个杂志！是便利店一直有的那个！',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      text: '对方希望她穿自己的衣服来。除此之外，还会拍一组泳装照。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'meguru',
      text: '有学校穿的泳装……嗯——不过要拍照的话还是可爱的泳装更好吧！？',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '那就得去买泳装了，制作人！',
      choices: [
        {
          label: '好，那就出门吧',
          nextNodeId: 'n07',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
        {
          label: '拍摄前不紧张吗',
          nextNodeId: 'n07b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
      ],
    },
    n07: {
      id: 'n07',
      speakerId: 'meguru',
      text: '好耶——！谢谢你，制作人！要选什么泳装好呢，诶嘿嘿！',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'meguru',
      text: '诶？……有一点。不过现在先想着买泳装的事！',
      nextNodeId: 'n07c',
    },
    n07c: {
      id: 'n07c',
      speakerId: 'meguru',
      text: '要选什么泳装好呢，诶嘿嘿！',
    },
  },
};

/** 第二步：逛店（卡面前半，压缩）。 */
export const meguruSwimsuitShop: DialogueDef = {
  id: 'dialogue.meguru.swimsuit.shop',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '店里整整一面墙都是泳装。她从这头走到那头，又走回来。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '哇——……！每一件都很可爱啊——……！',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '有花图案和蝴蝶结……制作人觉得哪种比较好？',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      text: '你说，不是要选巡喜欢的款式吗。她愣了一下，然后笑起来。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'meguru',
      text: '我和朋友买东西的时候，一边聊天一边逛街超开心的。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '之前也有过聊到入迷结果什么都没买就结束了行程的情况！诶嘿嘿。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      speakerId: 'meguru',
      text: '……不过能上杂志的只有一件吧……嗯——……好难选——！',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'meguru',
      text: '我要怎么办啊，制作人……！',
    },
  },
};

/** 第三步：三选一（卡面后半，选项原样保留）。 */
export const meguruSwimsuitPick: DialogueDef = {
  id: 'dialogue.meguru.swimsuit.pick',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      speakerId: 'meguru',
      text: '我要怎么办啊，制作人……！',
      choices: [
        {
          label: '看起来精神的会不会更适合你',
          nextNodeId: 'n02a',
          effects: [{ kind: 'attributeExp', ref: 'expression', tier: 1 }],
        },
        {
          label: '试试搭配吧',
          nextNodeId: 'n02b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '交给运气来吧',
          nextNodeId: 'n02c',
          effects: [{ kind: 'sharedStat', stat: 'stress', delta: -3 }],
        },
      ],
    },
    n02a: {
      id: 'n02a',
      speakerId: 'meguru',
      text: '比如……这样的？',
      nextNodeId: 'n03a',
    },
    n03a: {
      id: 'n03a',
      speakerId: 'meguru',
      text: '那这件呢……！？……会不会有点成熟？',
      nextNodeId: 'n04a',
    },
    n04a: {
      id: 'n04a',
      speakerId: 'meguru',
      text: '不是，虽然我很想变得适合穿这种，但还是等再大点吧！',
      nextNodeId: 'n05',
    },
    n02b: {
      id: 'n02b',
      speakerId: 'meguru',
      text: '诶？什么意思……啊！那样也可以啊！',
      nextNodeId: 'n03b',
    },
    n03b: {
      id: 'n03b',
      speakerId: 'meguru',
      text: '发饰或者项链之类的……把我喜欢的都搭配起来，一定会很开心！',
      nextNodeId: 'n05',
    },
    n02c: {
      id: 'n02c',
      speakerId: 'meguru',
      text: '啊哈哈，好像游戏！那……这件！',
      nextNodeId: 'n03c',
    },
    n03c: {
      id: 'n03c',
      speakerId: 'meguru',
      text: '哇，好时尚……！可是奇怪……好像有点大了。',
      nextNodeId: 'n04c',
    },
    n04c: {
      id: 'n04c',
      speakerId: 'meguru',
      text: '……这么大的尺寸应该比较适合制作人了——',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      text: '最后还是得挑一件合适的。她把范围一点点缩小，手里剩下三件。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'meguru',
      text: '真是的——！能全部都穿到就好了——！',
    },
  },
};

/** 第四步：落点（桥段）。原卡停在店里，这里补一个结束。 */
export const meguruSwimsuitAfter: DialogueDef = {
  id: 'dialogue.meguru.swimsuit.after',
  idolId: 'meguru',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '从店里出来，天已经开始暗了。她抱着纸袋走在旁边。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'meguru',
      text: '制作人，今天谢谢你。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'meguru',
      text: '……那个。下次，要是还有这种事的话……',
      choices: [
        {
          label: '下次也一起去',
          nextNodeId: 'n04a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '先把这次的拍摄做好',
          nextNodeId: 'n04b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n04a: {
      id: 'n04a',
      speakerId: 'meguru',
      text: '真的？诶嘿嘿，那就说好了！',
      nextNodeId: 'n05',
    },
    n04b: {
      id: 'n04b',
      speakerId: 'meguru',
      text: '……也是哦！那我拍摄的时候，会加油的！',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      text: '她把纸袋抱得更紧了。路口的灯亮起来，映在她脸上。',
    },
  },
};

export const MEGURU_DIALOGUES = [
  meguruSwimsuitFirst,
  meguruSwimsuitShop,
  meguruSwimsuitPick,
  meguruSwimsuitAfter,
  meguruFirst,
  meguruSecond,
  meguruBurdenFirst,
  meguruBurdenSecond,
  meguruBurdenThird,
];
