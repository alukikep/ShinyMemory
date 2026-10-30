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

export const HIORI_DIALOGUES = [hioriFirst, hioriSecond];
