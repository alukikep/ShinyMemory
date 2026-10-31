import type { StoryChainDef } from '../types';

export const manoEncounter: StoryChainDef = {
  id: 'mano-encounter',
  lockScope: 'none',
  kind: 'arc',
  idolId: 'mano',
  priority: 10,
  title: '公园的歌声',
  steps: [
    {
      id: 'mano-park-1',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.mano.first',
      actionLabel: '循着歌声',
      complete: {
        status: 'known',
        nextStepDelayDays: 2,
      },
    },
    {
      id: 'mano-park-2',
      locationId: 'park',
      timeWindow: { fromMinute: 600, toMinute: 1080 },
      dialogueId: 'dialogue.mano.second',
      actionLabel: '再次听见歌声',
      complete: {
        status: 'recruited',
      },
    },
    {
      // 招募之后她第一次主动来找你：这一步会解锁「初次 Live」。
      id: 'mano-office-3',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      minDaysAfterPrevious: 1,
      dialogueId: 'dialogue.mano.third',
      actionLabel: '她在事务所等你',
      effects: [{ kind: 'flag', key: 'unlocked.first_live', value: true }],
    },
  ],
};


/**
 * B6 长线：她第一次「卡住」。
 *
 * 三步 + 分支：第一步发现问题，第二步决定处理方式（写进 var），
 * 第三步的台词按 var 变化。三条路都通向恢复，但代价不同——
 * 这是「选项之间代价不同」的样板。
 */
export const manoSlump: StoryChainDef = {
  id: 'mano-slump',
  kind: 'arc',
  idolId: 'mano',
  priority: 20,
  title: '唱不出来的那天',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'mano', status: 'recruited' },
    { kind: 'attributeAtLeast', ref: 'trust', rank: 'E' },
  ],
  steps: [
    {
      id: 'mano-slump-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 8 * 60, toMinute: 13 * 60 },
      dialogueId: 'dialogue.mano.slump.first',
      actionLabel: '练习室里的停顿',
      when: [{ kind: 'dayAtLeast', day: 5 }],
      effects: [{ kind: 'sharedStat', stat: 'stress', delta: 8 }],
      complete: {
        nextStepDelayDays: 1,
      },
    },
    {
      id: 'mano-slump-2',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.mano.slump.second',
      actionLabel: '她在事务所等你的答复',
      complete: {
        nextStepDelayDays: 1,
      },
    },
    {
      id: 'mano-slump-3',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 8 * 60, toMinute: 13 * 60 },
      dialogueId: 'dialogue.mano.slump.third',
      actionLabel: '她重新站回练习室',
      effects: [
        { kind: 'sharedStat', stat: 'stress', delta: -25 },
        { kind: 'var', key: 'mano.slump', op: 'set', value: 3 },
        { kind: 'flag', key: 'resolved.mano.slump', value: true },
      ],
    },
  ],
};


/** 风野灯织的招募链：公园偶遇 → 她自己来事务所。 */
export const hioriEncounter: StoryChainDef = {
  id: 'hiori-encounter',
  lockScope: 'none',
  kind: 'arc',
  idolId: 'hiori',
  priority: 10,
  title: '练习室里的人在数拍子',
  // 档案型偶像：开局就认识，手册里直接写"接下来要做什么"。
  revealWhen: [{ kind: 'idolStatus', idolId: 'hiori', status: 'known' }],
  steps: [
    {
      id: 'hiori-practice-1',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 10 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.hiori.first',
      actionLabel: '练习室里的人在数拍子',
      // 已经认识，这一步只是第一次见面。
      complete: {
        nextStepDelayDays: 2,
      },
    },
    {
      id: 'hiori-office-2',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.hiori.second',
      actionLabel: '她来事务所问了一句话',
      complete: {
        status: 'recruited',
      },
    },
  ],
};


/**
 * 灯织长线：千里的距离。
 *
 * 改编自 G.R.A.D.編（そこには千里の距離があるよう → 明かりがさす方へ → そしてまた歩き出そう）：
 * 她发现自己落后于同组合的两人，一条条排除原因，最后**没有找到答案**但继续往前。
 * 这是"负面长线"的第二种写法——不是克服，是带着问题走下去。
 */
export const hioriGap: StoryChainDef = {
  id: 'hiori-gap',
  kind: 'arc',
  idolId: 'hiori',
  priority: 20,
  title: '千里的距离',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'hiori', status: 'recruited' },
    { kind: 'attributeAtLeast', ref: 'trust', rank: 'E' },
  ],
  steps: [
    {
      id: 'hiori-gap-1',
      locationId: 'shopping_street',
      timeWindow: { fromMinute: 18 * 60, toMinute: 20 * 60 },
      dialogueId: 'dialogue.hiori.gap.first',
      actionLabel: '橱窗前的广告牌',
      when: [{ kind: 'dayAtLeast', day: 6 }],
      effects: [{ kind: 'sharedStat', stat: 'stress', delta: 6 }],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'hiori-gap-2',
      locationId: 'studio',
      timeWindow: { fromMinute: 16 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.hiori.gap.second',
      actionLabel: '收录结束后她没走',
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'hiori-gap-3',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 10 * 60, toMinute: 16 * 60 },
      dialogueId: 'dialogue.hiori.gap.third',
      actionLabel: '她按下了播放键',
      effects: [
        { kind: 'sharedStat', stat: 'stress', delta: -20 },
        { kind: 'var', key: 'hiori.gap', op: 'set', value: 3 },
        { kind: 'flag', key: 'resolved.hiori.gap', value: true },
      ],
    },
  ],
};


/** 八宫巡的招募链：公园球场 → 她提前到事务所问了一件事。 */
export const meguruEncounter: StoryChainDef = {
  id: 'meguru-encounter',
  lockScope: 'none',
  kind: 'arc',
  idolId: 'meguru',
  priority: 10,
  title: '球场边的人',
  revealWhen: [{ kind: 'idolStatus', idolId: 'meguru', status: 'known' }],
  steps: [
    {
      id: 'meguru-park-1',
      locationId: 'park',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.meguru.first',
      actionLabel: '球场上有人在喊',
      complete: {
        nextStepDelayDays: 2,
      },
    },
    {
      id: 'meguru-office-2',
      locationId: 'office',
      timeWindow: { fromMinute: 9 * 60, toMinute: 12 * 60 },
      dialogueId: 'dialogue.meguru.second',
      actionLabel: '她提前来了',
      complete: {
        status: 'recruited',
      },
    },
  ],
};

/**
 * 巡的长线：大切、選べないから。
 *
 * 改编自 W.I.N.G.編的同名章节：她把所有请求都接下来，
 * 累到站着都费劲还说"很有精神，别担心"，并且拒绝取消工作
 * （"因为这些都是自己说了想做的工作"）。
 * 第三步不是"她学会拒绝"，而是**她第一次为自己做选择**。
 */
export const meguruBurden: StoryChainDef = {
  id: 'meguru-burden',
  kind: 'arc',
  idolId: 'meguru',
  priority: 20,
  title: '不重要的事，选不出来',
  revealWhen: [
    { kind: 'idolStatus', idolId: 'meguru', status: 'recruited' },
    { kind: 'attributeAtLeast', ref: 'trust', rank: 'E' },
  ],
  steps: [
    {
      id: 'meguru-burden-1',
      locationId: 'park',
      timeWindow: { fromMinute: 16 * 60, toMinute: 18 * 60 },
      dialogueId: 'dialogue.meguru.burden.first',
      actionLabel: '她还在球场上',
      when: [{ kind: 'dayAtLeast', day: 5 }],
      effects: [{ kind: 'sharedStat', stat: 'stress', delta: 8 }],
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'meguru-burden-2',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.meguru.burden.second',
      actionLabel: '她说不用取消',
      complete: { nextStepDelayDays: 1 },
    },
    {
      id: 'meguru-burden-3',
      locationId: 'practice_room',
      timeWindow: { fromMinute: 10 * 60, toMinute: 16 * 60 },
      dialogueId: 'dialogue.meguru.burden.third',
      actionLabel: '她第一次说了"不去"',
      effects: [
        { kind: 'sharedStat', stat: 'stress', delta: -20 },
        { kind: 'var', key: 'meguru.burden', op: 'set', value: 3 },
        { kind: 'flag', key: 'resolved.meguru.burden', value: true },
      ],
    },
  ],
};


export const STORY_CHAINS = [
];
