import type { StoryChainDef } from '../types';

export const manoEncounter: StoryChainDef = {
  id: 'mano-encounter',
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
  idolId: 'hiori',
  priority: 10,
  title: '长椅上的笔记本',
  steps: [
    {
      id: 'hiori-park-1',
      locationId: 'park',
      timeWindow: { fromMinute: 13 * 60, toMinute: 17 * 60 },
      dialogueId: 'dialogue.hiori.first',
      actionLabel: '长椅上的人',
      complete: {
        status: 'known',
        nextStepDelayDays: 2,
      },
    },
    {
      id: 'hiori-office-2',
      locationId: 'office',
      timeWindow: { fromMinute: 18 * 60, toMinute: 22 * 60 },
      dialogueId: 'dialogue.hiori.second',
      actionLabel: '她来事务所了',
      complete: {
        status: 'recruited',
      },
    },
  ],
};

export const STORY_CHAINS = [manoEncounter, manoSlump, hioriEncounter];
