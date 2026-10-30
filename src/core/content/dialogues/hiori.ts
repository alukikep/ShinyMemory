import type { DialogueDef } from '../../types';

/**
 * 招募第一步：改编自 W.I.N.G. 开场（`クールで真面目な女の子`）。
 *
 * 原作里制作人是**看资料**选中她的，第一次见面在练习室，
 * 说了一句「你是个努力家啊」，被她用「只是稍微看了下就知道了吗？」顶回来。
 * 这一段把那一击做成可选分支——玩家要不要犯那个错，自己选。
 */
export const hioriFirst: DialogueDef = {
  id: 'dialogue.hiori.first',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '练习室的镜墙里，一个人正在数拍子。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '1，2，3，4……1，2，3，4……',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      text: '她停下来，从镜子里看见门口的人。然后转过身。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'hiori',
      text: '……有事吗。',
      choices: [
        {
          label: '你就是风野灯织吧',
          nextNodeId: 'n05a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
        {
          label: '先等她这一遍练完',
          nextNodeId: 'n05b',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
            { kind: 'flag', key: 'hiori_waited', value: true },
          ],
        },
        {
          label: '你是个努力家啊',
          nextNodeId: 'n05c',
          effects: [{ kind: 'flag', key: 'hiori_judged_quickly', value: true }],
        },
      ],
    },
    n05a: {
      id: 'n05a',
      speakerId: 'hiori',
      text: '……那是我的名字。你是哪位。',
      nextNodeId: 'n06',
    },
    n05b: {
      id: 'n05b',
      text: '她没有说话，重新数起拍子。一遍结束，才回来。',
      nextNodeId: 'n06',
    },
    n05c: {
      id: 'n05c',
      speakerId: 'hiori',
      text: '只是稍微看了下就知道了吗？',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '我是风野灯织。这边才是——请多关照。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      text: '她说完就转身回去，重新数起拍子。这一次，呼吸比刚才更用力。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'hiori',
      text: '……关于刚才那句话。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'hiori',
      text: '你说想让谁做我的制作人，是看什么决定的？',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'hiori',
      text: '不，现在不要回答。……我还没想好要不要接受。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      text: '她继续练。你在门口站着，直到她练完才离开。',
    },
  },
};

/**
 * 招募第二步：改编自 W.I.N.G. 第一季（`季度1（通过）`）。
 *
 * 原作里她后来承认：「第一次见到制作人的时候……我一直在想，你来做我的制作人到底有没有问题」。
 * 正解是拿出**事先做好的训练清单和甄选资料**——她能接受的是功课，不是鼓励。
 */
export const hioriSecond: DialogueDef = {
  id: 'dialogue.hiori.second',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '两天后。她敲了三下事务所的门，间隔一样长。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '我查过了。283 是个小事务所，还有好几个没人管的练习室。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '所以我想问的是——你来做我的制作人，到底有没有问题。',
      choices: [
        {
          label: '把准备好的训练清单拿出来',
          nextNodeId: 'n04a',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 5 },
            { kind: 'flag', key: 'hiori_saw_list', value: true },
          ],
        },
        {
          label: '因为我相信你的才能',
          nextNodeId: 'n04b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '因为你很努力',
          nextNodeId: 'n04c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n04a: {
      id: 'n04a',
      speakerId: 'hiori',
      text: '！ 这是……为我做的？',
      nextNodeId: 'n05a',
    },
    n04b: {
      id: 'n04b',
      speakerId: 'hiori',
      text: '才能。……你看到的是什么才能。',
      nextNodeId: 'n05b',
    },
    n04c: {
      id: 'n04c',
      speakerId: 'hiori',
      text: '请不要用这种话敷衍。努力是我自己知道的事。',
      nextNodeId: 'n05c',
    },
    n05a: {
      id: 'n05a',
      speakerId: 'hiori',
      text: '训练安排到哪一天，甄选会的日期也写了……是什么时候做的这些。',
      nextNodeId: 'n06',
    },
    n05b: {
      id: 'n05b',
      speakerId: 'hiori',
      text: '……说得再具体一点。我没办法这样相信。',
      nextNodeId: 'n06',
    },
    n05c: {
      id: 'n05c',
      speakerId: 'hiori',
      text: '……不过，至少你没有说谎。这点我记下了。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '那你回答我另一个问题。我第一次见到你的时候——',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      speakerId: 'hiori',
      text: '我在想，你来做我的制作人到底有没有问题。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      speakerId: 'hiori',
      text: '……现在稍微，不那么想了。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      text: '她把资料收进包里，动作比进来时慢。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'hiori',
      text: '我有条件的。我不会因为被选中就高兴。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      speakerId: 'hiori',
      text: '如果最后觉得不对，我会走。这样也可以的话——请多关照。',
    },
  },
};


/**
 * 长线第一步：街角的广告牌。
 * 改编自 G.R.A.D.編「そこには千里の距離があるよう」——
 * 她看见两人接到的个人工作，嘴上说"很厉害"，其实在意。
 */
export const hioriGapFirst: DialogueDef = {
  id: 'dialogue.hiori.gap.first',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '商业街的橱窗前站了几个人。玻璃里是新一期的海报。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '……真乃的广告牌。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '巡也在。杂志的样刊前天寄到事务所了。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'hiori',
      text: '个人的工作，两个人都在努力呢。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      text: '旁边的两个女生在讨论海报上的发型。她听着，也接了一句。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '我懂。那个发型很适合巡。……杂志我也买吧。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      text: '她说完就安静了。橱窗的灯把她的侧脸照得很白。',
      choices: [
        {
          label: '你注意到了。只是没说。',
          nextNodeId: 'n08a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 3 }],
        },
        {
          label: '什么也不说，陪她站一会儿',
          nextNodeId: 'n08b',
          effects: [
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
            { kind: 'flag', key: 'hiori_stood_quietly', value: true },
          ],
        },
        {
          label: '她们确实很厉害',
          nextNodeId: 'n08c',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 1 }],
        },
      ],
    },
    n08a: {
      id: 'n08a',
      speakerId: 'hiori',
      text: '……你今天说话很讨厌。',
      nextNodeId: 'n09',
    },
    n08b: {
      id: 'n08b',
      text: '她没说话。过了很久，才低声开口。',
      nextNodeId: 'n09',
    },
    n08c: {
      id: 'n08c',
      speakerId: 'hiori',
      text: '是啊。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      speakerId: 'hiori',
      text: '今天是经常看到两人名字的日子呢。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'hiori',
      text: '"只是"今天吗。……其实并不是这样的。是我没有注意到。',
      nextNodeId: 'n11',
    },
    n11: {
      id: 'n11',
      text: '她转过身，往车站的方向走，走了两步停下。',
      nextNodeId: 'n12',
    },
    n12: {
      id: 'n12',
      speakerId: 'hiori',
      text: '……我回去练习了。',
      effects: [{ kind: 'var', key: 'hiori.gap', op: 'set', value: 1 }],
    },
  },
};

/**
 * 长线第二步：她把问题问出来了。
 * 改编自 G.R.A.D.編「明かりがさす方へ」——她一条条排除技术、笑容、人气。
 */
export const hioriGapSecond: DialogueDef = {
  id: 'dialogue.hiori.gap.second',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '收录结束，棚里只剩设备散热的嗡声。她没有走。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '制作人。我想问一件事。',
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '两人有的，而我没有的东西，是什么。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'hiori',
      text: '技术？……不。她们也不是每次都做到完美。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      speakerId: 'hiori',
      text: '笑容？像真乃那样治愈人的笑，像巡那样让人有精神的笑，我都做不到。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '人气？……人气不是越多越好。理由不够。',
      nextNodeId: 'n07',
    },
    n07: {
      id: 'n07',
      speakerId: 'hiori',
      text: '不知道。为什么。',
      choices: [
        {
          label: '我也没答案。但我知道你一直在往前走',
          nextNodeId: 'n08a',
          effects: [
            { kind: 'var', key: 'hiori.gapApproach', op: 'set', value: 1 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
        {
          label: '你有一样她们没有的：你从不敷衍自己',
          nextNodeId: 'n08b',
          effects: [
            { kind: 'var', key: 'hiori.gapApproach', op: 'set', value: 2 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
        {
          label: '先不谈这个。你今天有没有好好休息',
          nextNodeId: 'n08c',
          effects: [
            { kind: 'var', key: 'hiori.gapApproach', op: 'set', value: 3 },
            { kind: 'attributeExp', ref: 'trust', tier: 3 },
          ],
        },
      ],
    },
    n08a: {
      id: 'n08a',
      speakerId: 'hiori',
      text: '……制作人也没有答案啊。',
      nextNodeId: 'n09',
    },
    n08b: {
      id: 'n08b',
      speakerId: 'hiori',
      text: '不敷衍自己。……这算优点吗。',
      nextNodeId: 'n09',
    },
    n08c: {
      id: 'n08c',
      speakerId: 'hiori',
      text: '……有。吃了饭才来的。',
      nextNodeId: 'n09',
    },
    n09: {
      id: 'n09',
      text: '她把耳机收进盒里，动作很慢。',
      nextNodeId: 'n10',
    },
    n10: {
      id: 'n10',
      speakerId: 'hiori',
      text: '……我先回去了。明天见。',
      effects: [{ kind: 'var', key: 'hiori.gap', op: 'set', value: 2 }],
    },
  },
};

/**
 * 长线第三步：她没有找到答案，但继续走了。
 * 改编自 G.R.A.D.編「そしてまた歩き出そう」——不是"想通了"，是"继续往前"。
 */
export const hioriGapThird: DialogueDef = {
  id: 'dialogue.hiori.gap.third',
  idolId: 'hiori',
  startNodeId: 'n01',
  nodes: {
    n01: {
      id: 'n01',
      text: '第二天。练习室的音响没开，只有她数拍子的声音。',
      nextNodeId: 'n02',
    },
    n02: {
      id: 'n02',
      speakerId: 'hiori',
      text: '我昨天想了一路。',
      textVariants: [
        {
          when: [{ kind: 'varAtLeast', key: 'hiori.gapApproach', value: 1 }, { kind: 'varAtMost', key: 'hiori.gapApproach', value: 1 }],
          text: '我昨天想了一路。制作人也没有答案的话，那就一起找。',
        },
        {
          when: [{ kind: 'varAtLeast', key: 'hiori.gapApproach', value: 2 }, { kind: 'varAtMost', key: 'hiori.gapApproach', value: 2 }],
          text: '我昨天想了一路。不敷衍自己——如果是这个，那确实是我有的。',
        },
        {
          when: [{ kind: 'varAtLeast', key: 'hiori.gapApproach', value: 3 }, { kind: 'varAtMost', key: 'hiori.gapApproach', value: 3 }],
          text: '我昨天想了一路，然后就睡着了。……难得睡得那么好。',
        },
      ],
      nextNodeId: 'n03',
    },
    n03: {
      id: 'n03',
      speakerId: 'hiori',
      text: '不过，我没有想通。两人有什么、我缺什么，还是不知道。',
      nextNodeId: 'n04',
    },
    n04: {
      id: 'n04',
      speakerId: 'hiori',
      text: '不知道也没关系。我不打算停下来等答案。',
      nextNodeId: 'n05',
    },
    n05: {
      id: 'n05',
      text: '她按下播放键，从第一拍开始。这一次没有停。',
      nextNodeId: 'n06',
    },
    n06: {
      id: 'n06',
      speakerId: 'hiori',
      text: '制作人。明天也继续吧。',
      choices: [
        {
          label: '当然。我一直在。',
          nextNodeId: 'n07a',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 5 }],
        },
        {
          label: '你已经在走了，不用等谁',
          nextNodeId: 'n07b',
          effects: [{ kind: 'attributeExp', ref: 'trust', tier: 5 }],
        },
      ],
    },
    n07a: {
      id: 'n07a',
      speakerId: 'hiori',
      text: '……嗯。那就这样。',
      nextNodeId: 'n08',
    },
    n07b: {
      id: 'n07b',
      speakerId: 'hiori',
      text: '这句话，我记下了。',
      nextNodeId: 'n08',
    },
    n08: {
      id: 'n08',
      text: '她重新戴上耳机。窗外的光落在镜子上，晃了一下。',
    },
  },
};

export const HIORI_DIALOGUES = [
  hioriFirst,
  hioriSecond,
  hioriGapFirst,
  hioriGapSecond,
  hioriGapThird,
];
