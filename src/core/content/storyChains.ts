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

export const STORY_CHAINS = [manoEncounter];
